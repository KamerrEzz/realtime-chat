import React, { useEffect, useState } from "react";
import axios from "axios";
import Chat from "./Chat";

const ChatRoom = ({ token, room }) => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [disconed, setDisconed] = useState(1)

  useEffect(() => {
    const socket = new WebSocket(
      `wss://apichat.kamerrezz.test?room=${room}&token=${token}`
    );

    socket.onopen = () => {
      console.log("Conectado", disconed);
      setWs(socket);
      setDisconed(2)
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "user_list") {
        setConnectedUsers(data.users);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onclose = () => {
      if(disconed == 2) {
        setDisconed(3)
      }
      console.log("desconectado", disconed);
    };

    return () => {
      socket.close();
    };
  }, [room, token]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await axios.post(
        "https://apichat.kamerrezz.test/send",
        { content: input, room },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInput("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div>
        <h2>Sala: {room}</h2>

        <div className="h-28 lg:h-96 overflow-auto">
          <strong>Usuarios conectados:</strong>
          <ul className="list-inside list-disc" >
            {connectedUsers.map((user) => (
              <li key={user.id}>{user.username}</li>
            ))}
          </ul>
        </div>

        {disconed == 3 && <p>Reinicia, parece que fuistes desconectado</p>}
      </div>

      <div>
        <Chat messages={messages} />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="bg-[#14161C] outline-none cursor-pointer w-full rounded-md px-3 py-1"
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
