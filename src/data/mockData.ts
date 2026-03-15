// ============================================================
// data/mockData.ts
// Centralised mock data. Replace with API calls via TanStack Query.
// ============================================================

import type {
  Lead,
  Task,
  TrialSession,
  StaffUser,
  TimelineEntry,
  ChartDataPoint,
  ReportMetric,
} from "../types/crm.types";

// ─── LEADS ───────────────────────────────────────────────
export const MOCK_LEADS: Lead[] = [
{ id:"L001", name:"Arjun Mehta", phone:"+919876543210", email:"arjun@email.com", source:"Meta Ads", stage:"Trial Booked", assignedTo:"Priya R", assignedToId:"U002", center:"Koramangala", createdAt:"2025-02-20 10:30", lastActivity:"2025-02-25 12:10", trialDate:"2025-02-28 18:00", tags:["Hot","BJJ"] },

{ id:"L002", name:"Sneha Kapoor", phone:"+918765432109", email:"sneha@email.com", source:"WhatsApp", stage:"Call Handling", assignedTo:"Ravi K", assignedToId:"U003", center:"Indiranagar", createdAt:"2025-02-22 09:15", lastActivity:"2025-02-26 11:40", tags:["New"] },

{ id:"L003", name:"Dev Sharma", phone:"+917654321098", email:"dev@email.com", source:"Walk-in", stage:"Joined", assignedTo:"Priya R", assignedToId:"U002", center:"Koramangala", createdAt:"2025-02-18 14:20", lastActivity:"2025-02-24 16:00", membershipPlan:"Monthly", membershipStart:"2025-02-25 08:00", membershipEnd:"2025-03-25 08:00", totalRevenue:2500 },

{ id:"L004", name:"Ananya Singh", phone:"+916543210987", email:"ananya@email.com", source:"Meta Ads", stage:"Membership Active", assignedTo:"Ravi K", assignedToId:"U003", center:"Whitefield", createdAt:"2025-02-15 13:45", lastActivity:"2025-02-23 15:30", membershipPlan:"Quarterly", membershipStart:"2025-02-16 09:00", membershipEnd:"2025-05-16 09:00", totalRevenue:6500 },

{ id:"L005", name:"Rohit Verma", phone:"+915432109876", email:"rohit@email.com", source:"WhatsApp", stage:"Renewal", assignedTo:"Priya R", assignedToId:"U002", center:"Koramangala", createdAt:"2025-02-10 08:30", lastActivity:"2025-02-22 17:10", membershipPlan:"Annual", membershipStart:"2025-02-11 08:00", membershipEnd:"2026-02-11 08:00", totalRevenue:18000 },

{ id:"L006", name:"Meera Nair", phone:"+914321098765", email:"meera@email.com", source:"Walk-in", stage:"Followup", assignedTo:"Ravi K", assignedToId:"U003", center:"Indiranagar", createdAt:"2025-02-24 11:25", lastActivity:"2025-02-27 14:10", tags:["Interested"] },

{ id:"L007", name:"Kabir Khan", phone:"+913210987654", email:"kabir@email.com", source:"Meta Ads", stage:"Lead Created", assignedTo:"Priya R", assignedToId:"U002", center:"Whitefield", createdAt:"2025-02-25 10:05", lastActivity:"2025-02-25 10:05", tags:["New","MMA"] },

{ id:"L008", name:"Pooja Iyer", phone:"+912109876543", email:"pooja@email.com", source:"WhatsApp", stage:"Trial Done", assignedTo:"Ravi K", assignedToId:"U003", center:"Koramangala", createdAt:"2025-02-21 16:30", lastActivity:"2025-02-26 18:00" },

{ id:"L009", name:"Vikram Negi", phone:"+911198765432", email:"vikram@email.com", source:"Meta Ads", stage:"Membership Active", assignedTo:"Priya R", assignedToId:"U002", center:"Indiranagar", createdAt:"2025-02-14 09:50", lastActivity:"2025-02-20 12:00", membershipPlan:"Half-Yearly", totalRevenue:11000 },

{ id:"L010", name:"Divya Pillai", phone:"+911087654321", email:"divya@email.com", source:"Walk-in", stage:"Call Handling", assignedTo:"Ravi K", assignedToId:"U003", center:"Whitefield", createdAt:"2025-02-26 15:10", lastActivity:"2025-02-27 17:20", tags:["New"] },

{ id:"L011", name:"Rahul Shetty", phone:"+919812345678", email:"rahul@email.com", source:"Meta Ads", stage:"Followup", assignedTo:"Priya R", assignedToId:"U002", center:"Indiranagar", createdAt:"2025-02-19 10:00", lastActivity:"2025-02-23 13:10", tags:["Warm"] },

{ id:"L012", name:"Neha Agarwal", phone:"+918923456789", email:"neha@email.com", source:"WhatsApp", stage:"Trial Booked", assignedTo:"Ravi K", assignedToId:"U003", center:"Koramangala", createdAt:"2025-02-23 11:40", lastActivity:"2025-02-25 12:45", trialDate:"2025-02-27 17:30", tags:["Yoga"] },

{ id:"L013", name:"Amit Kulkarni", phone:"+917934567890", email:"amit@email.com", source:"Walk-in", stage:"Trial Done", assignedTo:"Priya R", assignedToId:"U002", center:"Whitefield", createdAt:"2025-02-17 18:10", lastActivity:"2025-02-22 19:00", tags:["Gym"] },

{ id:"L014", name:"Priyanka Das", phone:"+916945678901", email:"priyanka@email.com", source:"Meta Ads", stage:"Lead Created", assignedTo:"Ravi K", assignedToId:"U003", center:"Indiranagar", createdAt:"2025-02-26 09:30", lastActivity:"2025-02-26 09:30", tags:["New"] },

{ id:"L015", name:"Siddharth Rao", phone:"+915956789012", email:"sid@email.com", source:"WhatsApp", stage:"Membership Active", assignedTo:"Priya R", assignedToId:"U002", center:"Koramangala", createdAt:"2025-02-12 08:20", lastActivity:"2025-02-18 10:00", membershipPlan:"Monthly", totalRevenue:2500 },

{ id:"L016", name:"Kiran Patil", phone:"+914967890123", email:"kiran@email.com", source:"Meta Ads", stage:"Call Handling", assignedTo:"Ravi K", assignedToId:"U003", center:"Whitefield", createdAt:"2025-02-24 14:40", lastActivity:"2025-02-27 15:00", tags:["New"] },

{ id:"L017", name:"Manish Gupta", phone:"+913978901234", email:"manish@email.com", source:"Walk-in", stage:"Trial Booked", assignedTo:"Priya R", assignedToId:"U002", center:"Indiranagar", createdAt:"2025-02-21 12:10", lastActivity:"2025-02-25 14:00", trialDate:"2025-02-28 19:00", tags:["MMA"] },

{ id:"L018", name:"Ritika Sen", phone:"+912989012345", email:"ritika@email.com", source:"Meta Ads", stage:"Followup", assignedTo:"Ravi K", assignedToId:"U003", center:"Koramangala", createdAt:"2025-02-23 16:20", lastActivity:"2025-02-26 17:10", tags:["Warm"] },

{ id:"L019", name:"Varun Nair", phone:"+911990123456", email:"varun@email.com", source:"WhatsApp", stage:"Trial Done", assignedTo:"Priya R", assignedToId:"U002", center:"Whitefield", createdAt:"2025-02-20 13:10", lastActivity:"2025-02-25 16:40", tags:["Gym"] },

{ id:"L020", name:"Shreya Bhat", phone:"+919001234567", email:"shreya@email.com", source:"Meta Ads", stage:"Lead Created", assignedTo:"Ravi K", assignedToId:"U003", center:"Indiranagar", createdAt:"2025-02-27 10:50", lastActivity:"2025-02-27 10:50", tags:["New"] },
];

// ─── TIMELINE ENTRIES ─────────────────────────────────────
export const MOCK_TIMELINE: TimelineEntry[] = [
  { id:"T001", type:"stage_change", date:"Feb 20, 9:00 AM",  by:"System",  byRole:"System", content:"Lead created from Meta Ads campaign.", metadata:{ from:"", to:"Lead Created" } },
  { id:"T002", type:"call",         date:"Feb 21, 11:30 AM", by:"Priya R", byRole:"RM",     content:"Initial call made. Arjun is interested in BJJ and Kickboxing programs. Prefers evening batches. Will review fee structure." },
  { id:"T003", type:"followup",     date:"Feb 23, 2:00 PM",  by:"Priya R", byRole:"RM",     content:"WhatsApp follow-up sent. Shared batch schedule and fee PDF. Lead responded positively." },
  { id:"T004", type:"stage_change", date:"Feb 24, 10:00 AM", by:"Priya R", byRole:"RM",     content:"Stage updated to Trial Booked.", metadata:{ from:"Followup", to:"Trial Booked" } },
  { id:"T005", type:"trial",        date:"Feb 28, 6:00 PM",  by:"Kiran TM",byRole:"TRAINING_MANAGER", content:"Trial session scheduled for BJJ Basics batch at Koramangala center. Trainer: Coach Reddy." },
  { id:"T006", type:"note",         date:"Feb 28, 9:15 AM",  by:"Priya R", byRole:"RM",     content:"Reminder sent on WhatsApp. Lead confirmed attendance for today's trial." },
];

// ─── TASKS ────────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  { id:"TK001", title:"Follow up after trial",   leadName:"Arjun Mehta",  leadId:"L001", dueDate:"2025-02-28", priority:"high",   type:"followup", done:false, assignedTo:"Priya R" },
  { id:"TK002", title:"Schedule trial session",  leadName:"Sneha Kapoor", leadId:"L002", dueDate:"2025-02-28", priority:"medium", type:"trial",    done:false, assignedTo:"Ravi K" },
  { id:"TK003", title:"Renewal call due",        leadName:"Rohit Verma",  leadId:"L005", dueDate:"2025-03-01", priority:"high",   type:"renewal",  done:false, assignedTo:"Priya R" },
  { id:"TK004", title:"Initial call pending",    leadName:"Kabir Khan",   leadId:"L007", dueDate:"2025-02-28", priority:"medium", type:"call",     done:false, assignedTo:"Priya R" },
  { id:"TK005", title:"Confirm trial attendance",leadName:"Arjun Mehta",  leadId:"L001", dueDate:"2025-02-28", priority:"low",    type:"call",     done:true,  assignedTo:"Priya R" },
];

// ─── TRIAL SESSIONS ───────────────────────────────────────
export const MOCK_TRIALS: TrialSession[] = [
  { id:"TR001", leadId:"L001", leadName:"Arjun Mehta",   phone:"+91 98765 43210", date:"2025-02-28", time:"6:00 PM", batch:"BJJ Basics",    trainer:"Coach Reddy",  status:"confirmed",  program:"BJJ" },
  { id:"TR002", leadId:"L002", leadName:"Sneha Kapoor",  phone:"+91 87654 32109", date:"2025-02-28", time:"7:30 PM", batch:"Kickboxing",     trainer:"Coach Meena",  status:"scheduled",  program:"Kickboxing" },
  { id:"TR003", leadId:"L008", leadName:"Pooja Iyer",    phone:"+91 21098 76543", date:"2025-02-27", time:"5:00 PM", batch:"MMA Intro",      trainer:"Coach Reddy",  status:"done",       program:"MMA" },
  { id:"TR004", leadId:"L006", leadName:"Meera Nair",    phone:"+91 43210 98765", date:"2025-03-01", time:"6:00 PM", batch:"BJJ Basics",     trainer:"Coach Reddy",  status:"scheduled",  program:"BJJ" },
  { id:"TR005", leadId:"L010", leadName:"Divya Pillai",  phone:"+91 10876 54321", date:"2025-03-02", time:"8:00 AM", batch:"Kickboxing",     trainer:"Coach Meena",  status:"scheduled",  program:"Kickboxing" },
];

// ─── STAFF USERS ──────────────────────────────────────────
export const MOCK_USERS: StaffUser[] = [
  { id:"U001", name:"Rajesh Kumar",  email:"rajesh@dojo.com",  phone:"+91 99001 12345", role:"SUPER_ADMIN",      center:"All",          status:"active",   joinedAt:"2023-01-15", lastLogin:"2025-02-28", permissions:["all"] },
  { id:"U002", name:"Priya R",       email:"priya@dojo.com",   phone:"+91 98765 11111", role:"RM",               center:"Koramangala",  status:"active",   joinedAt:"2023-06-01", lastLogin:"2025-02-27", permissions:["CALL_LEAD","UPDATE_TRIAL"] },
  { id:"U003", name:"Ravi K",        email:"ravi@dojo.com",    phone:"+91 87654 22222", role:"RM",               center:"Indiranagar",  status:"active",   joinedAt:"2024-01-10", lastLogin:"2025-02-26", permissions:["CALL_LEAD","UPDATE_TRIAL"] },
  { id:"U004", name:"Meena Sharma",  email:"meena@dojo.com",   phone:"+91 76543 33333", role:"FM",               center:"Koramangala",  status:"active",   joinedAt:"2023-09-05", lastLogin:"2025-02-25", permissions:["CREATE_MEMBERSHIP","HANDLE_RENEWAL","VIEW_REPORTS"] },
  { id:"U005", name:"Kiran TM",      email:"kiran@dojo.com",   phone:"+91 65432 44444", role:"TRAINING_MANAGER", center:"All",          status:"active",   joinedAt:"2023-03-20", lastLogin:"2025-02-24", permissions:["UPDATE_TRIAL","VIEW_REPORTS"] },
  { id:"U006", name:"Anita HR",      email:"anita@dojo.com",   phone:"+91 54321 55555", role:"HR",               center:"All",          status:"inactive", joinedAt:"2024-05-01", lastLogin:"2025-02-01", permissions:["VIEW_REPORTS"] },
  { id:"U007", name:"Dev Admin",     email:"dev@dojo.com",     phone:"+91 43210 66666", role:"ADMIN",            center:"Whitefield",   status:"active",   joinedAt:"2023-11-15", lastLogin:"2025-02-28", permissions:["CALL_LEAD","UPDATE_TRIAL","CREATE_MEMBERSHIP","VIEW_REPORTS","VIEW_SETTINGS"] },
];

// ─── REPORT METRICS ───────────────────────────────────────
export const REPORT_METRICS: ReportMetric[] = [
  { label:"Total Leads",       value:148, change:12,  changeType:"increase", unit:"" },
  { label:"Trials Conducted",  value:43,  change:8,   changeType:"increase", unit:"" },
  { label:"Conversions",       value:29,  change:-3,  changeType:"decrease", unit:"" },
  { label:"Conversion Rate",   value:67,  change:5,   changeType:"increase", unit:"%" },
  { label:"Total Revenue",     value:284000, change:18, changeType:"increase", unit:"₹" },
  { label:"Avg Deal Size",     value:9793, change:4,  changeType:"increase", unit:"₹" },
];

export const LEAD_CHART_DATA: ChartDataPoint[] = [
  { label:"Aug", value:18, secondary:8 },
  { label:"Sep", value:24, secondary:12 },
  { label:"Oct", value:31, secondary:17 },
  { label:"Nov", value:22, secondary:10 },
  { label:"Dec", value:19, secondary:9 },
  { label:"Jan", value:37, secondary:21 },
  { label:"Feb", value:42, secondary:29 },
];

export const SOURCE_CHART_DATA: ChartDataPoint[] = [
  { label:"Meta Ads", value:58 },
  { label:"WhatsApp", value:27 },
  { label:"Walk-in",  value:15 },
];

export const STAGE_FUNNEL_DATA: ChartDataPoint[] = [
  { label:"Lead Created",     value:148 },
  { label:"Call Handling",    value:112 },
  { label:"Followup",         value:87 },
  { label:"Trial Booked",     value:56 },
  { label:"Trial Done",       value:43 },
  { label:"Joined",           value:31 },
  { label:"Membership Active",value:29 },
  { label:"Renewal",          value:8 },
];
