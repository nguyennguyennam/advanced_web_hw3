import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerApi, checkEmailApi } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your full name";
    if (!emailRegex.test(form.email)) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkEmail = async () => {
    if (!emailRegex.test(form.email)) return;
    try {
      setChecking(true);
      const r = await checkEmailApi(form.email.trim());
      if (r.exists) {
        setErrors((s) => ({ ...s, email: "Email is already registered" }));
      } else {
        setErrors((s) => ({ ...s, email: "" }));
      }
    } catch (err) {
        throw new Error(err);
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await registerApi({
        username: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // Save a local mapping so we can greet by name after login
      const map = JSON.parse(localStorage.getItem("userNameByEmail") || "{}");
      map[form.email.trim()] = form.name.trim();
      localStorage.setItem("userNameByEmail", JSON.stringify(map));

      alert("Registration successful. Please log in.");
      nav("/login");
    } catch (err) {
      setErrors((s) => ({ ...s, email: err.message || "Registration failed" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-sm text-gray-600 mb-6">Sign up to get started.</p>

        <form onSubmit={onSubmit}>
          <Input
            label="Full name"
            name="username"
            value={form.name}
            onChange={onChange("name")}
            placeholder="e.g., John Doe"
            error={errors.name}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            onBlur={checkEmail}
            placeholder="you@example.com"
            error={errors.email}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Password"
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={onChange("password")}
              placeholder="••••••"
              error={errors.password}
            />
            <Input
              label="Confirm password"
              name="confirm"
              type={showPwd ? "text" : "password"}
              value={form.confirm}
              onChange={onChange("confirm")}
              placeholder="••••••"
              error={errors.confirm}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" onChange={(e) => setShowPwd(e.target.checked)} />
              Show passwords
            </label>
            {checking ? <span className="text-xs text-gray-500">Checking email…</span> : null}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating…" : "Register"}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
