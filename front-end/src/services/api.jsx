const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text();
    let message = "Request failed";
    message = JSON.parse(text)?.message || message; 
    throw new Error(message);
  }
  return res.json().catch(() => ({}));
}

export async function registerApi(payload) {
  const res = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res); // { message }
}

export async function loginApi(payload) {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res); // { message }
}

export async function checkEmailApi(email) {
  const url = new URL(`${BASE_URL}/user/check-email`, window.location.origin);
  url.searchParams.set("email", email);
  const res = await fetch(url.toString(), { method: "GET" });
  return handle(res); // { exists: boolean }
}
