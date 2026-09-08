import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5001/api";
const stamp = Date.now();
const user = {
  name: "Password Reset Test",
  email: `password-reset-${stamp}@example.com`,
  mobile: `+919002${String(stamp).slice(-6)}`,
  password: "Original@123",
};

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  return { status: response.status, body: await response.json() };
}

const registered = await request("/auth/register", {
  method: "POST",
  body: JSON.stringify(user),
});
assert.equal(registered.status, 201);

const emailLogin = await request("/auth/login", {
  method: "POST",
  body: JSON.stringify({ identifier: user.email, password: user.password }),
});
assert.equal(emailLogin.status, 200);

const mobileLogin = await request("/auth/login", {
  method: "POST",
  body: JSON.stringify({ identifier: user.mobile, password: user.password }),
});
assert.equal(mobileLogin.status, 200);

const invalidEmail = await request("/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email: "not-an-email" }),
});
assert.equal(invalidEmail.status, 400);

const unknownEmail = await request("/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email: "unknown@example.com" }),
});
assert.equal(unknownEmail.status, 200);

const otpRequest = await request("/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email: user.email }),
});
assert.equal(otpRequest.status, 200);
assert.equal(otpRequest.body.success, true);
assert.equal("otp" in otpRequest.body, false);
assert.equal("password" in otpRequest.body, false);

const invalidOtp = await request("/auth/verify-reset-otp", {
  method: "POST",
  body: JSON.stringify({ email: user.email, otp: "000000" }),
});
assert.equal(invalidOtp.status, 400);

const invalidReset = await request("/auth/reset-password", {
  method: "POST",
  body: JSON.stringify({
    resetToken: "invalid-reset-token",
    newPassword: "NewPassword@123",
    confirmPassword: "Different@123",
  }),
});
assert.equal(invalidReset.status, 400);

console.log("Existing login and password-reset validation checks passed");