import assert from "node:assert/strict";
import { SMTPServer } from "smtp-server";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5002/api";
const stamp = Date.now();
const user = {
  name: "Full Reset Test",
  email: `full-reset-${stamp}@example.com`,
  mobile: `+919003${String(stamp).slice(-6)}`,
  password: "Original@123",
};
let capturedMessage = "";

const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  onAuth(auth, session, callback) {
    callback(null, { user: auth.username });
  },
  onData(stream, session, callback) {
    let content = "";
    stream.on("data", (chunk) => { content += chunk.toString(); });
    stream.on("end", () => {
      capturedMessage = content;
      callback();
    });
  },
});

await new Promise((resolve, reject) => {
  smtp.listen(2525, "127.0.0.1", (error) => (error ? reject(error) : resolve()));
});

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  return { status: response.status, body: await response.json() };
}

try {
  const registered = await request("/auth/register", { method: "POST", body: JSON.stringify(user) });
  assert.equal(registered.status, 201);

  const requested = await request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: user.email }),
  });
  assert.equal(requested.status, 200);
  const otp = capturedMessage.match(/\b\d{6}\b/)?.[0];
  assert.match(otp || "", /^\d{6}$/);

  const verified = await request("/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify({ email: user.email, otp }),
  });
  assert.equal(verified.status, 200);
  assert.ok(verified.body.resetToken);

  const reset = await request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken: verified.body.resetToken, newPassword: "NewPassword@456", confirmPassword: "NewPassword@456" }),
  });
  assert.equal(reset.status, 200);

  const reused = await request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken: verified.body.resetToken, newPassword: "Another@456", confirmPassword: "Another@456" }),
  });
  assert.equal(reused.status, 400);

  const oldLogin = await request("/auth/login", { method: "POST", body: JSON.stringify({ identifier: user.email, password: user.password }) });
  assert.equal(oldLogin.status, 401);
  const newLogin = await request("/auth/login", { method: "POST", body: JSON.stringify({ identifier: user.email, password: "NewPassword@456" }) });
  assert.equal(newLogin.status, 200);

  console.log("Full password-reset lifecycle passed");
} finally {
  await new Promise((resolve) => smtp.close(resolve));
}