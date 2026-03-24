import { useParams } from "react-router-dom";
import { getTickets, updateTicketStatus, assignTicket } from "../store/ticketStore";
import { useState } from "react";
import TicketChat from "../components/TicketChat";
import { useRole } from "../../../store/useAuthStore";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const role = useRole();
  const [, setRefresh] = useState(0);

  const ticket = getTickets().find((t) => t.id === id);

  if (!ticket) return <div className="p-6">Ticket not found</div>;

  const reload = () => setRefresh((p) => p + 1);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{ticket.title}</h1>
      <p className="text-slate-400">{ticket.description}</p>

      <p>Status: <b>{ticket.status}</b></p>
      <p>Assigned: <b>{ticket.assignedTo || "Unassigned"}</b></p>

      {/* 👨‍💼 ADMIN ACTIONS */}
      {(role === "ADMIN" || role === "SUPER_ADMIN") && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              assignTicket(ticket.id, "Admin");
              reload();
            }}
            className="bg-blue-500 px-3 py-1 rounded text-white"
          >
            Assign to me
          </button>

          <button
            onClick={() => {
              updateTicketStatus(ticket.id, "IN_PROGRESS");
              reload();
            }}
            className="bg-yellow-500 px-3 py-1 rounded text-white"
          >
            Start
          </button>

          <button
            onClick={() => {
              updateTicketStatus(ticket.id, "RESOLVED");
              reload();
            }}
            className="bg-green-600 px-3 py-1 rounded text-white"
          >
            Resolve
          </button>
        </div>
      )}

      {/* 💬 CHAT */}
      <TicketChat
        ticket={ticket}
        refresh={reload}
        currentUser={role}
      />
    </div>
  );
}