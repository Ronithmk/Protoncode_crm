import { useState } from "react";
import { addComment } from "../store/ticketStore";
import type { Ticket } from "../types/ticket.types";

export default function TicketChat({
  ticket,
  refresh,
  currentUser,
}: {
  ticket: Ticket;
  refresh: () => void;
  currentUser: string;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    addComment(ticket.id, {
      id: Date.now().toString(),
      message,
      author: currentUser,
      createdAt: new Date().toISOString(),
    });

    setMessage("");
    refresh();
  };

  return (
    <div className="mt-4 border border-theme rounded-xl p-4">
      <h3 className="font-semibold mb-3 text-white">Conversation</h3>

      {/* CHAT LIST */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto mb-3">
        {(ticket.comments || []).map((c) => (
          <div
            key={c.id}
            className={`text-sm p-2 rounded ${
              c.author === currentUser
                ? "bg-indigo-500/20 text-indigo-300 ml-auto w-fit"
                : "bg-surface text-slate-300"
            }`}
          >
            <div className="text-xs text-slate-400 mb-1">
              {c.author} • {new Date(c.createdAt).toLocaleString()}
            </div>

            {c.message}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          className="flex-1 border border-theme bg-card p-2 rounded text-sm"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={handleSend}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}