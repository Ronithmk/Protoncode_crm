import type { Ticket, Comment } from "../types/ticket.types";

const STORAGE_KEY = "tickets";

// ─────────────────────────────────────────────
// GET ALL TICKETS
// ─────────────────────────────────────────────
export const getTickets = (): Ticket[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  const tickets = data ? JSON.parse(data) : [];
  // ✅ FIX: ensure every ticket has a comments array (old tickets may not)
  return tickets.map((t: Ticket) => ({ ...t, comments: t.comments || [] }));
};

// ─────────────────────────────────────────────
// SAVE ALL TICKETS
// ─────────────────────────────────────────────
export const saveTickets = (tickets: Ticket[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

// ─────────────────────────────────────────────
// ADD NEW TICKET
// ─────────────────────────────────────────────
export const addTicket = (ticket: Partial<Ticket>) => {
  const tickets = getTickets();

  const newTicket: Ticket = {
    id: Date.now().toString(),
    title: ticket.title || "",
    description: ticket.description || "",

    status: "NEW",
    priority: ticket.priority || "MEDIUM",
    type: ticket.type || "general",

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    createdBy: ticket.createdBy || "customer",
    assignedTo: "",

    comments: [],
  };

  tickets.unshift(newTicket);
  saveTickets(tickets);
};

// ─────────────────────────────────────────────
// GENERIC UPDATE
// ─────────────────────────────────────────────
export const updateTicket = (
  id: string,
  updates: Partial<Ticket>
) => {
  const tickets = getTickets().map((t) =>
    t.id === id
      ? {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : t
  );

  saveTickets(tickets);
};

// ─────────────────────────────────────────────
// STATUS UPDATE
// ─────────────────────────────────────────────
export const updateTicketStatus = (
  id: string,
  status: "NEW" | "IN_PROGRESS" | "RESOLVED"
) => {
  updateTicket(id, { status });
};

// ─────────────────────────────────────────────
// ASSIGN AGENT
// ─────────────────────────────────────────────
export const assignTicket = (ticketId: string, user: string) => {
  updateTicket(ticketId, { assignedTo: user });
};

// ─────────────────────────────────────────────
// UPDATE PRIORITY
// ─────────────────────────────────────────────
export const updatePriority = (
  ticketId: string,
  priority: "LOW" | "MEDIUM" | "HIGH"
) => {
  updateTicket(ticketId, { priority });
};

// ─────────────────────────────────────────────
// UPDATE TYPE
// ─────────────────────────────────────────────
export const updateType = (ticketId: string, type: string) => {
  updateTicket(ticketId, { type });
};

// ─────────────────────────────────────────────
// ADD COMMENT (FIXED)
// ─────────────────────────────────────────────
export const addComment = (
  ticketId: string,
  comment: Comment
) => {
  const tickets = getTickets().map((t) =>
    t.id === ticketId
      ? {
          ...t,
          comments: [...(t.comments || []), comment],
          updatedAt: new Date().toISOString(),
        }
      : t
  );

  saveTickets(tickets);
};

// ─────────────────────────────────────────────
// DELETE TICKET
// ─────────────────────────────────────────────
export const deleteTicket = (ticketId: string) => {
  const tickets = getTickets().filter((t) => t.id !== ticketId);
  saveTickets(tickets);
};