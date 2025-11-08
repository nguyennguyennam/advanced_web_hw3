import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { loginApi } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function deriveNameFromEmail(email) {
  const local = email.split("@")[0] || email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Please enter your email";
    if (!form.password) e.password = "Please enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await loginApi({ email: form.email.trim(), password: form.password });

      // Since backend doesn't return user data, greet by best-known name:
      const map = JSON.parse(localStorage.getItem("userNameByEmail") || "{}");
      const knownName = map[form.email.trim()];
      const username = knownName || deriveNameFromEmail(form.email.trim());

      localStorage.setItem("auth", JSON.stringify({ email: form.email.trim(), username }));
      nav("/");
    } catch (err) {
      setErrors({ general: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">Log in</h1>
        <p className="text-sm text-gray-600 mb-6">Welcome back 👋</p>

        {!!errors.general && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {errors.general}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            placeholder="you@example.com"
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={onChange("password")}
            placeholder="••••••"
            error={errors.password}
          />

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" onChange={(e) => setShowPwd(e.target.checked)} />
              Show password
            </label>
            <button type="button" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
