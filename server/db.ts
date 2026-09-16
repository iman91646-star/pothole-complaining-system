import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Complaint {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userEmail: string;
  location: string;
  area: string;
  city: string;
  landmark?: string;
  category: 'Small Pothole' | 'Large Pothole' | 'Multiple Potholes' | 'Road Damage' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  imageUrl?: string | null;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  adminResponse?: string | null;
  responseAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintHistory {
  id: string;
  complaintId: string;
  previousStatus: string;
  newStatus: string;
  remarks: string;
  changedBy: string;
  changedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  complaintId: string;
  message: string;
  status: string;
  adminResponse: string;
  read: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  complaints: Complaint[];
  complaintHistory: ComplaintHistory[];
  notifications: Notification[];
  complaintCounter: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'pothole_db.json');

// Helper to hash password with salt using native crypto
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    complaints: [],
    complaintHistory: [],
    notifications: [],
    complaintCounter: 0,
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.complaints) this.data.complaints = [];
        if (!this.data.complaintHistory) this.data.complaintHistory = [];
        if (!this.data.notifications) this.data.notifications = [];
        if (typeof this.data.complaintCounter !== 'number') {
          this.data.complaintCounter = this.data.complaints.length;
        }
      } catch (err) {
        console.error('Failed to read database file, initializing fresh store:', err);
        this.save();
      }
    } else {
      this.save();
    }

    this.seedAdminAccount();
  }

  private save() {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Ensures authorized admin account exists:
  // Admin username/email: "Admin1234" (or admin1234@potholetrack.gov)
  // Admin password: "gowtham"
  // Role: "admin"
  private seedAdminAccount() {
    const existingAdmin = this.data.users.find(
      (u) => u.email.toLowerCase() === 'admin1234@potholetrack.gov' || u.name === 'Admin1234'
    );

    const salt = generateSalt();
    const passwordHash = hashPassword('gowtham', salt);

    if (!existingAdmin) {
      const adminUser: User = {
        id: 'usr_admin_authorized',
        name: 'Admin1234',
        email: 'admin1234@potholetrack.gov',
        passwordHash,
        salt,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(adminUser);
      this.save();
      console.log('Authorized Admin account initialized.');
    } else {
      // Ensure role and password are always strictly synced
      existingAdmin.role = 'admin';
      existingAdmin.name = 'Admin1234';
      existingAdmin.salt = salt;
      existingAdmin.passwordHash = passwordHash;
      this.save();
    }
  }

  // User methods
  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === normalized);
  }

  // Flexible admin lookup: accepts either "Admin1234" or "admin1234@potholetrack.gov"
  getAdminUser(identifier: string): User | undefined {
    const normalized = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) =>
        u.role === 'admin' &&
        (u.email.toLowerCase() === normalized || u.name.toLowerCase() === normalized)
    );
  }

  createUser(name: string, email: string, password: string): User {
    const normalized = email.trim().toLowerCase();
    const existing = this.getUserByEmail(normalized);
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const newUser: User = {
      id: `usr_${crypto.randomUUID()}`,
      name: name.trim(),
      email: normalized,
      passwordHash,
      salt,
      role: 'user', // strictly hardcoded to user, no admin creation allowed
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Complaint methods
  generateComplaintId(): string {
    this.data.complaintCounter += 1;
    const year = new Date().getFullYear();
    const counterStr = String(this.data.complaintCounter).padStart(4, '0');
    const complaintId = `PH-${year}-${counterStr}`;
    this.save();
    return complaintId;
  }

  createComplaint(params: {
    userId: string;
    userName: string;
    userEmail: string;
    location: string;
    area: string;
    city: string;
    landmark?: string;
    category: Complaint['category'];
    severity: Complaint['severity'];
    description: string;
    imageUrl?: string | null;
  }): Complaint {
    const complaintId = this.generateComplaintId();
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: `cmp_${crypto.randomUUID()}`,
      complaintId,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      location: params.location.trim(),
      area: params.area.trim(),
      city: params.city.trim(),
      landmark: params.landmark?.trim() || '',
      category: params.category,
      severity: params.severity,
      description: params.description.trim(),
      imageUrl: params.imageUrl || null,
      status: 'Submitted',
      priority: params.severity, // initial priority matches severity
      adminResponse: null,
      responseAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.data.complaints.unshift(newComplaint);

    // Initial history entry
    const historyEntry: ComplaintHistory = {
      id: `his_${crypto.randomUUID()}`,
      complaintId: newComplaint.complaintId,
      previousStatus: 'None',
      newStatus: 'Submitted',
      remarks: 'Complaint submitted by citizen',
      changedBy: params.userName,
      changedAt: now,
    };
    this.data.complaintHistory.push(historyEntry);

    this.save();
    return newComplaint;
  }

  getComplaintsByUser(userId: string): Complaint[] {
    return this.data.complaints
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllComplaints(): Complaint[] {
    return [...this.data.complaints].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getComplaintById(idOrComplaintId: string): Complaint | undefined {
    return this.data.complaints.find(
      (c) => c.id === idOrComplaintId || c.complaintId.toUpperCase() === idOrComplaintId.toUpperCase()
    );
  }

  updateComplaintByAdmin(
    idOrComplaintId: string,
    updates: {
      status?: Complaint['status'];
      priority?: Complaint['priority'];
      adminResponse?: string;
    },
    adminName: string = 'Administrator'
  ): Complaint {
    const complaint = this.getComplaintById(idOrComplaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    const previousStatus = complaint.status;
    const now = new Date().toISOString();
    let hasChanges = false;

    if (updates.status && updates.status !== complaint.status) {
      complaint.status = updates.status;
      hasChanges = true;
    }

    if (updates.priority && updates.priority !== complaint.priority) {
      complaint.priority = updates.priority;
      hasChanges = true;
    }

    if (updates.adminResponse && updates.adminResponse.trim().length > 0) {
      complaint.adminResponse = updates.adminResponse.trim();
      complaint.responseAt = now;
      hasChanges = true;
    }

    if (hasChanges) {
      complaint.updatedAt = now;

      // Add to ComplaintHistory
      const historyEntry: ComplaintHistory = {
        id: `his_${crypto.randomUUID()}`,
        complaintId: complaint.complaintId,
        previousStatus: previousStatus,
        newStatus: complaint.status,
        remarks: updates.adminResponse?.trim() || `Status updated to ${complaint.status}`,
        changedBy: adminName,
        changedAt: now,
      };
      this.data.complaintHistory.push(historyEntry);

      // Create Notification for the user
      const notifMessage = updates.adminResponse?.trim()
        ? `Complaint ${complaint.complaintId} has been updated. Status: ${complaint.status}. Admin Response: ${updates.adminResponse.trim()}`
        : `Complaint ${complaint.complaintId} has been updated. Status: ${complaint.status}.`;

      const notification: Notification = {
        id: `notif_${crypto.randomUUID()}`,
        userId: complaint.userId,
        complaintId: complaint.complaintId,
        message: notifMessage,
        status: complaint.status,
        adminResponse: updates.adminResponse?.trim() || '',
        read: false,
        createdAt: now,
      };
      this.data.notifications.unshift(notification);

      this.save();
    }

    return complaint;
  }

  getComplaintHistory(complaintId: string): ComplaintHistory[] {
    return this.data.complaintHistory
      .filter((h) => h.complaintId.toUpperCase() === complaintId.toUpperCase())
      .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
  }

  getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationRead(notificationId: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === notificationId && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): void {
    let changed = false;
    for (const n of this.data.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        changed = true;
      }
    }
    if (changed) this.save();
  }
}

export const db = new Database();
