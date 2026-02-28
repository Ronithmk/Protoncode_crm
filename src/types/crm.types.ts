// ============================================================
// types/crm.types.ts
// Shared domain types across all CRM feature modules.
// ============================================================

export type LeadSource = "Meta Ads" | "WhatsApp" | "Walk-in";

export type LifecycleStage =
  | "Lead Created"
  | "Call Handling"
  | "Followup"
  | "Trial Booked"
  | "Trial Done"
  | "Joined"
  | "Membership Active"
  | "Renewal";

export type MembershipPlan = "Monthly" | "Quarterly" | "Half-Yearly" | "Annual";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  stage: LifecycleStage;
  assignedTo: string;
  assignedToId: string;
  center: string;
  createdAt: string;
  lastActivity: string;
  notes?: string;
  trialDate?: string;
  membershipPlan?: MembershipPlan;
  membershipStart?: string;
  membershipEnd?: string;
  totalRevenue?: number;
  tags?: string[];
};

export type TimelineEntry = {
  id: string;
  type: "call" | "followup" | "trial" | "note" | "membership" | "stage_change";
  date: string;
  by: string;
  byRole: string;
  content: string;
  metadata?: Record<string, string | number>;
};

export type Task = {
  id: string;
  title: string;
  leadName: string;
  leadId: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  type: "call" | "followup" | "trial" | "renewal";
  done: boolean;
  assignedTo: string;
};

export type TrialSession = {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  date: string;
  time: string;
  batch: string;
  trainer: string;
  status: "scheduled" | "confirmed" | "done" | "cancelled" | "no_show";
  program: string;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  center: string;
  status: "active" | "inactive";
  joinedAt: string;
  lastLogin: string;
  avatar?: string;
  permissions: string[];
};

export type Permission = {
  id: string;
  label: string;
  description: string;
  category: string;
};

export type RolePermissionMap = {
  [role: string]: string[];
};

export type ReportMetric = {
  label: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  unit?: string;
};

export type ChartDataPoint = {
  label: string;
  value: number;
  secondary?: number;
};
