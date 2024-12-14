import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://apichat.kamerrezz.test/login", {
        username,
        password,
      });

      const { token } = response.data;

      // Guarda el token en localStorage
      localStorage.setItem("authToken", token);

      // Limpia el error y llama a la función de onLogin
      setError("");
      onLogin(token);
    } catch (err) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <div className="w-[100vw_-_5rem] lg:w-96">
      <h2 className="text-2xl font-bold text-center mb-2">Iniciar Sesión</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          required
          className="bg-[#14161C] outline-none cursor-pointer w-full border-[#14161C] rounded-sm border-4 px-3 py-1"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className="bg-[#14161C] outline-none cursor-pointer w-full border-[#14161C] rounded-sm border-4 px-3 py-1"
        />
        {error && <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>}
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
