"use client";

import React, { useState } from "react";

const LoginForm = ({ onLogin }: { onLogin: (role: string) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Username dan password tidak boleh kosong");
    } else {
      try {
        console.log(username);
        console.log(password);
        const response = await fetch("http://127.0.0.1:5001/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || "Invalid login credentials");
        }

        const data = await response.json();
        const userRole = data.user.role;
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log(JSON.parse(localStorage.getItem("user")));

        if (userRole === "admin") {
          onLogin("admin");
        } else if (userRole === "user") {
          onLogin("user");
        } else {
          throw new Error("Role tidak valid");
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <form
      className="bg-primary flex w-full m-auto flex-col gap-5 items-center p-5 rounded-xl shadow-lg shadow-black-500/70"
      onSubmit={handleLogin}
    >
      <h1 className="font-sans font-extrabold text-3xl flex-col gap-3 mb-4">
        Login
      </h1>
      {error && (
        <div className="text-white">
          <p className="text-center">Perhatian !!</p>
          <p>{error}</p>
        </div>
      )}
      <div className="w-full">
        <input
          className="py-3 px-0 border-solid text-black w-full text-lg rounded-xl pl-4"
          value={username}
          style={{ width: "20vw" }}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
      </div>
      <div className="w-full">
        <input
          className="py-3 px-0 border-solid text-black w-full text-lg rounded-xl pl-4"
          type="password"
          value={password}
          style={{ width: "20vw" }}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        className="p-3 bg-secondary text-white border-none rounded-2xl cursor-pointer text-lg hover:bg-white hover:text-black hover:shadow-black-500/70 transition-all w-"
        style={{ width: "7vw" }}
        type="submit"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
