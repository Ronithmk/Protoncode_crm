export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Comment {
  id: string;
  message: string;
  author: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;

  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: string;

  createdAt: string;
  updatedAt: string;

  createdBy: string;
  assignedTo: string;

  comments: Comment[];
}
