import { useEffect, useRef } from "react";

function Chat({ messages }) {
  const messagesEndRef = useRef(null);

  // Función para desplazarse hacia abajo
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  // Efecto para desplazarse cada vez que cambien los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      ref={messagesEndRef}
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        height: "300px",
        overflowY: "auto",
        marginBottom: "1rem",
      }}
      className="lg:w-[calc(100vw_-_50rem)] bg-[#14161C]/50"
    >
      {messages.map((msg, index) => (
        <div key={index} style={{ marginBottom: "0.5rem" }}>
          <strong>{msg.username || msg.userId || "Usuario"}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}

export default Chat;
