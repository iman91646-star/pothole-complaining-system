import express, { Request, Response } from 'express';
import { db, hashPassword } from './db.ts';
import { createToken, requireAuth, requireAdmin, AuthenticatedRequest } from './auth.ts';

export const apiApp = express();

apiApp.use(express.json({ limit: '10mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

// User Registration: public user can ONLY register with role = 'user'
apiApp.post('/api/auth/register', (req: Request, res: Response): void => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Full Name is required.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    // Explicitly prohibit any role tampering: role is strictly 'user'
    const newUser = db.createUser(name, email, password);
    const token = createToken(newUser);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to register account.' });
  }
});

// User Login
apiApp.post('/api/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Separate Admin Login
apiApp.post('/api/auth/admin/login', (req: Request, res: Response): void => {
  try {
    const { adminEmail, password } = req.body;

    if (!adminEmail || !password) {
      res.status(400).json({ error: 'Admin Email/Username and Password are required.' });
      return;
    }

    // Accepts either "Admin1234" or "admin1234@potholetrack.gov"
    const user = db.getAdminUser(adminEmail);
    if (!user || user.role !== 'admin') {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = createToken(user);

    res.json({
      message: 'Administrator authorization successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Admin login failed.' });
  }
});

// Current Authenticated User profile
apiApp.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// -------------------------------------------------------------
// Citizen / User Complaint Endpoints
// -------------------------------------------------------------

// Fetch user's own complaints and real-time statistics
apiApp.get('/api/user/complaints', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const complaints = db.getComplaintsByUser(userId);

  const stats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === 'Submitted').length,
    underReview: complaints.filter((c) => c.status === 'Under Review').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    rejected: complaints.filter((c) => c.status === 'Rejected').length,
  };

  res.json({
    complaints,
    stats,
  });
});

// Submit a new complaint
apiApp.post('/api/complaints', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { location, area, city, landmark, category, severity, description, imageUrl } = req.body;

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      res.status(400).json({ error: 'Street or Road Name is required.' });
      return;
    }

    if (!area || typeof area !== 'string' || area.trim().length === 0) {
      res.status(400).json({ error: 'Area is required.' });
      return;
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      res.status(400).json({ error: 'City is required.' });
      return;
    }

    const validCategories = ['Small Pothole', 'Large Pothole', 'Multiple Potholes', 'Road Damage', 'Other'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: 'Please select a valid pothole category.' });
      return;
    }

    const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
    if (!validSeverities.includes(severity)) {
      res.status(400).json({ error: 'Please select a valid severity level.' });
      return;
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      res.status(400).json({ error: 'Please provide a detailed description (at least 10 characters).' });
      return;
    }

    const newComplaint = db.createComplaint({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      location,
      area,
      city,
      landmark,
      category,
      severity,
      description,
      imageUrl,
    });

    res.status(201).json({
      message: 'Pothole complaint submitted successfully!',
      complaintId: newComplaint.complaintId,
      complaint: newComplaint,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit complaint.' });
  }
});

// Single Complaint Details (Ownership and Role Verified)
apiApp.get('/api/complaints/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const user = req.user!;
  const complaint = db.getComplaintById(id);

  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  // Security Rule: A normal user can ONLY access their own complaint!
  if (user.role !== 'admin' && complaint.userId !== user.id) {
    res.status(403).json({
      error: 'Access Denied: You do not have permission to view this complaint.',
    });
    return;
  }

  const history = db.getComplaintHistory(complaint.complaintId);

  res.json({
    complaint,
    history,
  });
});

// -------------------------------------------------------------
// Administrator Endpoints (STRICTLY ROLE === 'admin')
// -------------------------------------------------------------

// Admin Dashboard: fetch all complaints with search/filtering and real DB stats
apiApp.get('/api/admin/complaints', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const allComplaints = db.getAllComplaints();

  const now = new Date().getTime();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const stats = {
    total: allComplaints.length,
    newComplaints: allComplaints.filter(
      (c) => c.status === 'Submitted' || new Date(c.createdAt).getTime() > twentyFourHoursAgo
    ).length,
    underReview: allComplaints.filter((c) => c.status === 'Under Review').length,
    inProgress: allComplaints.filter((c) => c.status === 'In Progress').length,
    resolved: allComplaints.filter((c) => c.status === 'Resolved').length,
    rejected: allComplaints.filter((c) => c.status === 'Rejected').length,
    highOrCritical: allComplaints.filter((c) => c.severity === 'High' || c.severity === 'Critical').length,
  };

  // Optional query params for backend filtering
  const { search, status, severity, priority, category } = req.query;

  let filtered = [...allComplaints];

  if (typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.complaintId.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q) ||
        c.userEmail.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }

  if (typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (typeof severity === 'string' && severity !== 'all') {
    filtered = filtered.filter((c) => c.severity === severity);
  }

  if (typeof priority === 'string' && priority !== 'all') {
    filtered = filtered.filter((c) => c.priority === priority);
  }

  if (typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }

  res.json({
    complaints: filtered,
    stats,
  });
});

// Admin Update Complaint (Status, Priority, Administrator Response)
apiApp.patch('/api/admin/complaints/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, priority, adminResponse } = req.body;
    const adminUser = req.user!;

    const updated = db.updateComplaintByAdmin(
      id,
      {
        status,
        priority,
        adminResponse,
      },
      adminUser.name || 'Administrator'
    );

    const history = db.getComplaintHistory(updated.complaintId);

    res.json({
      message: 'Complaint updated successfully.',
      complaint: updated,
      history,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update complaint.' });
  }
});

// -------------------------------------------------------------
// User Notifications Endpoints
// -------------------------------------------------------------

apiApp.get('/api/user/notifications', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const notifications = db.getNotificationsByUser(userId);
  res.json({ notifications });
});

apiApp.patch('/api/user/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;
  const success = db.markNotificationRead(id, userId);
  res.json({ success });
});

apiApp.post('/api/user/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  db.markAllNotificationsRead(userId);
  res.json({ success: true });
});

// -------------------------------------------------------------
// Photo Upload Helper
// -------------------------------------------------------------
apiApp.post('/api/upload', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'No image data provided.' });
      return;
    }

    // In this web app, we store image as base64 data URL for instant reliability and persistence
    res.json({
      url: imageBase64,
      filename: filename || 'pothole.jpg',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process image upload.' });
  }
});
