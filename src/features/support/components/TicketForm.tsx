import { useState } from "react";
import { addTicket } from "../store/ticketStore";

export default function TicketForm({ refresh }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title || !description) return;

    addTicket({
      id: Date.now().toString(),
      title,
      description,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    });

    setTitle("");
    setDescription("");
    refresh();
  };

  return (
    <div className="p-4 border rounded mb-4">
      <h3 className="font-semibold mb-2">Create Ticket</h3>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}
