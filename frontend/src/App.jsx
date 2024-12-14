import React, { useState } from "react";
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setToken("");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {token ? (
        <div>
          <button
            onClick={handleLogout}
            style={{
              margin: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            className="absolute top-2 left-2"
          >
            Cerrar Sesión
          </button>
          <ChatRoom token={token} room="general" />
        </div>
      ) : isRegistering ? (
        <div>
          <Register />
          <button
            onClick={() => setIsRegistering(false)}
            className="bg-[#14161C] px-4 py-2 rounded-md text-white flex gap-3 items-center cursor-pointer"
          >
            Ya tengo una cuenta
          </button>
        </div>
      ) : (
        <div>
          <Login onLogin={handleLogin} />
          <button
            onClick={() => setIsRegistering(true)}
            className="text-[#14161C] px-4 py-2 rounded-md hover:text-white flex gap-3 items-center cursor-pointer"
          >
            Crear una cuenta
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
