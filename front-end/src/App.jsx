import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./pages/Registration";
import Login from "./pages/Login";
import Home from "./pages/Home";

function Protected({ children }) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <nav className="w-full border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">MyApp</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}
