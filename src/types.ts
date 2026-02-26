export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  campaign: string;
  stage: 'New Lead' | 'Contacted' | 'Trial Scheduled' | 'Attempted Call' | 'Disqualified' | 'Joined';
  manager: string;
  managerAvatar: string;
  lastActivity: string;
  lastActivityType: string;
  initials: string;
  color: string;
}

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Marcus Wright',
    email: 'marcus.w@example.com',
    phone: '+1 (555) 123-4567',
    source: 'Meta Ads',
    campaign: 'Kickstart Pro',
    stage: 'Trial Scheduled',
    manager: 'Sarah Connor',
    managerAvatar: 'https://i.pravatar.cc/150?u=sarah',
    lastActivity: '2 hours ago',
    lastActivityType: 'Inbound Message',
    initials: 'MW',
    color: 'bg-blue-500/20 text-blue-500',
  },
  {
    id: '2',
    name: 'Elena Lopez',
    email: 'elopez.arts@gmail.com',
    phone: '+1 (555) 234-5678',
    source: 'Meta Ads',
    campaign: 'Summer Kids',
    stage: 'New Lead',
    manager: 'David Lee',
    managerAvatar: 'https://i.pravatar.cc/150?u=david',
    lastActivity: '5 mins ago',
    lastActivityType: 'Lead Form Submission',
    initials: 'EL',
    color: 'bg-purple-500/20 text-purple-500',
  },
  {
    id: '3',
    name: 'Brandon Taylor',
    email: 'b.taylor@outlook.com',
    phone: '+1 (555) 345-6789',
    source: 'Organic Website',
    campaign: 'Organic Website',
    stage: 'Attempted Call',
    manager: 'Sarah Connor',
    managerAvatar: 'https://i.pravatar.cc/150?u=sarah',
    lastActivity: '1 day ago',
    lastActivityType: 'Outbound Call (No Ans)',
    initials: 'BT',
    color: 'bg-amber-500/20 text-amber-500',
  },
  {
    id: '4',
    name: 'Sophia Kim',
    email: 'sophia.k@edu.com',
    phone: '+1 (555) 456-7890',
    source: 'Meta Ads',
    campaign: 'Kickstart Pro',
    stage: 'Disqualified',
    manager: 'Unassigned',
    managerAvatar: '',
    lastActivity: '3 days ago',
    lastActivityType: 'Status Changed',
    initials: 'SK',
    color: 'bg-rose-500/20 text-rose-500',
  },
];

export const STATS = [
  { label: 'New Meta Leads', value: '128', trend: '+12.5%', subtext: 'from last 30 days', color: 'border-l-primary' },
  { label: 'Contacted', value: '84', trend: '0%', subtext: '65% outreach rate', color: 'border-l-indigo-500' },
  { label: 'Trial Booked', value: '42', trend: '+18.2%', subtext: '50% conversion from contact', color: 'border-l-purple-500' },
  { label: 'Joined', value: '15', trend: '+4.2%', subtext: 'Lifetime member value: $1.2k', color: 'border-l-emerald-500' },
];

export const FUNNEL_DATA = [
  { label: 'Leads Captured', value: 128, percentage: 100, color: 'bg-primary' },
  { label: 'Initial Contact Made', value: 84, percentage: 65.6, color: 'bg-indigo-500' },
  { label: 'Trials Completed', value: 42, percentage: 32.8, color: 'bg-purple-500' },
  { label: 'New Memberships', value: 15, percentage: 11.7, color: 'bg-emerald-500' },
];
