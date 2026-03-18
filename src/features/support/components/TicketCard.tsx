import { useNavigate } from "react-router-dom";
import { updateTicketStatus } from "../store/ticketStore";

export default function TicketCard({ ticket, refresh }: any) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/support/${ticket.id}`)}
      className="border border-theme p-4 rounded-xl cursor-pointer hover:bg-surface transition"
    >
      <h4 className="font-semibold text-white">{ticket.title}</h4>
      <p className="text-sm text-slate-400">{ticket.description}</p>

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs">
          Status: <b>{ticket.status}</b>
        </span>

        {/* prevent click bubbling */}
        <div
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              updateTicketStatus(ticket.id, "IN_PROGRESS");
              refresh();
            }}
            className="bg-yellow-500 text-white px-2 py-1 text-xs rounded"
          >
            Start
          </button>

          <button
            onClick={() => {
              updateTicketStatus(ticket.id, "RESOLVED");
              refresh();
            }}
            className="bg-green-600 text-white px-2 py-1 text-xs rounded"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}