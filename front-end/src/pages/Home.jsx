import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  const username = auth?.username || "User";

  const logout = () => {
    localStorage.removeItem("auth");
    nav("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Welcome, {username}!</h1>
      <p className="text-gray-700">You are logged in.</p>
      <button
        onClick={logout}
        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
      >
        Log out
      </button>
    </div>
  );
}
