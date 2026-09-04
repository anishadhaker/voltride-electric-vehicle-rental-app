// Test script for VoltRide Backend Authentication & Protected APIs

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING VOLTRIDE BACKEND PHASE 2 VERIFICATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "GET /api/health returns 200 & success: true");
  } catch (e) {
    assert(false, "GET /api/health", e.message);
  }

  // 2. Register with missing fields -> expect 400
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete User" }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, "POST /api/auth/register validates required fields (400)");
  } catch (e) {
    assert(false, "POST /api/auth/register validation", e.message);
  }

  // 3. Register with invalid email -> expect 400
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "notanemail",
        mobile: "9079872848",
        password: "Password@123",
      }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.message.includes("valid email"), "POST /api/auth/register rejects invalid email format");
  } catch (e) {
    assert(false, "POST /api/auth/register email format", e.message);
  }

  // 4. Register with short password -> expect 400
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        mobile: "9079872848",
        password: "123",
      }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.message.includes("at least 6 characters"), "POST /api/auth/register enforces min password length");
  } catch (e) {
    assert(false, "POST /api/auth/register password length", e.message);
  }

  // 5. Login with missing identifier/password -> expect 400
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, "POST /api/auth/login validates required fields (400)");
  } catch (e) {
    assert(false, "POST /api/auth/login validation", e.message);
  }

  // 6. Access protected profile without token -> expect 401
  try {
    const res = await fetch(`${BASE_URL}/users/profile`);
    const data = await res.json();
    assert(res.status === 401 && data.message.includes("no token"), "GET /api/users/profile rejects request without token (401)");
  } catch (e) {
    assert(false, "GET /api/users/profile without token", e.message);
  }

  // 7. Access protected profile with invalid token -> expect 401
  try {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: "Bearer fake_invalid_jwt_token_xyz" },
    });
    const data = await res.json();
    assert(res.status === 401 && data.message.includes("token is invalid"), "GET /api/users/profile rejects invalid token (401)");
  } catch (e) {
    assert(false, "GET /api/users/profile with invalid token", e.message);
  }

  // 8. Access /api/bookings/my-bookings without token -> expect 401
  try {
    const res = await fetch(`${BASE_URL}/bookings/my-bookings`);
    const data = await res.json();
    assert(res.status === 401, "GET /api/bookings/my-bookings requires authentication (401)");
  } catch (e) {
    assert(false, "GET /api/bookings/my-bookings auth check", e.message);
  }

  // 9. Update profile without token -> expect 401
  try {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker" }),
    });
    const data = await res.json();
    assert(res.status === 401, "PUT /api/users/profile requires authentication (401)");
  } catch (e) {
    assert(false, "PUT /api/users/profile auth check", e.message);
  }

  // 10. Change password without token -> expect 401
  try {
    const res = await fetch(`${BASE_URL}/users/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: "old", newPassword: "new" }),
    });
    const data = await res.json();
    assert(res.status === 401, "PUT /api/users/change-password requires authentication (401)");
  } catch (e) {
    assert(false, "PUT /api/users/change-password auth check", e.message);
  }

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed}/${total} tests passed.`);
  console.log(`==================================================`);
}

runTests();
