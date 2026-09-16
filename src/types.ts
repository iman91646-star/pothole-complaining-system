export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export type ComplaintCategory =
  | 'Small Pothole'
  | 'Large Pothole'
  | 'Multiple Potholes'
  | 'Road Damage'
  | 'Other';

export type ComplaintSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

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
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  description: string;
  imageUrl?: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
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

export interface UserStats {
  total: number;
  submitted: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface AdminStats {
  total: number;
  newComplaints: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  highOrCritical: number;
}
