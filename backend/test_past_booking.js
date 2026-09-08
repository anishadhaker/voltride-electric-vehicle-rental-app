import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5001/api";
const stamp = Date.now();
const testUser = {
  name: "Past Booking Test",
  email: `past-booking-${stamp}@example.com`,
  mobile: `+919004${String(stamp).slice(-6)}`,
  password: "Password@123",
};

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  let body = null;
  try {
    body = await response.json();
  } catch {}
  return { status: response.status, body };
}

console.log("=== Testing Prevent Booking for Past Date or Time ===");

// 0. Register user & get token
const reg = await request("/auth/register", {
  method: "POST",
  body: JSON.stringify(testUser),
});
assert.equal(reg.status, 201, "User registration failed");
const token = reg.body.token;
const authHeaders = { Authorization: `Bearer ${token}` };

// Get a vehicle
const vehiclesRes = await request("/vehicles");
assert.equal(vehiclesRes.status, 200, "Failed to get vehicles");
const vehicles = vehiclesRes.body.data || vehiclesRes.body || [];
assert.ok(vehicles.length > 0, "No vehicles found");

const futureSlot = new Date(Date.now() + 2 * 60 * 60 * 1000);
let vehicle = vehicles[0];
for (const candidate of vehicles) {
  const check = await request(`/vehicles/${candidate._id || candidate.id}/check-availability`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      pickupDateTime: futureSlot.toISOString(),
      returnDateTime: new Date(futureSlot.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    }),
  });
  if (check.status === 200 && check.body.available) {
    vehicle = candidate;
    break;
  }
}
const vehicleId = vehicle._id || vehicle.id;

const EXPECTED_ERROR = "You can't book a ride for this time because it has already passed.";

// 1. Yesterday -> booking rejected
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const res1 = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: yesterday.toISOString(),
    returnDateTime: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res1.status, 400, "Yesterday booking should be rejected with 400");
assert.equal(res1.body.message, EXPECTED_ERROR, "Yesterday error message mismatch");
console.log("✅ Case 1: Yesterday -> booking rejected (400)");

// 2. Earlier date this month -> rejected
const earlierDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const res2 = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: earlierDate.toISOString(),
    returnDateTime: new Date(earlierDate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res2.status, 400, "Earlier date this month should be rejected with 400");
assert.equal(res2.body.message, EXPECTED_ERROR, "Earlier date error message mismatch");
console.log("✅ Case 2: Earlier date this month -> rejected (400)");

// 3. Today with a time 1 hour ago -> rejected
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const res3 = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: oneHourAgo.toISOString(),
    returnDateTime: new Date(oneHourAgo.getTime() + 4 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res3.status, 400, "Today with a time 1 hour ago should be rejected with 400");
assert.equal(res3.body.message, EXPECTED_ERROR, "1 hour ago error message mismatch");
console.log("✅ Case 3: Today with a time 1 hour ago -> rejected (400)");

// 4. Today with current time or already-passed minute -> rejected
const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
const res4 = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: oneMinuteAgo.toISOString(),
    returnDateTime: new Date(oneMinuteAgo.getTime() + 4 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res4.status, 400, "Past minute should be rejected with 400");
assert.equal(res4.body.message, EXPECTED_ERROR, "Past minute error message mismatch");
console.log("✅ Case 4: Today with current time/already-passed minute -> rejected (400)");

// 5. Today with a future time -> allowed
let futureToday = new Date(Date.now() + 4 * 60 * 60 * 1000);
for (let h = 2; h <= 20; h++) {
  const candidatePickup = new Date(Date.now() + h * 60 * 60 * 1000);
  const candidateReturn = new Date(candidatePickup.getTime() + 2 * 60 * 60 * 1000);
  const chk = await request(`/vehicles/${vehicleId}/check-availability`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      pickupDateTime: candidatePickup.toISOString(),
      returnDateTime: candidateReturn.toISOString(),
    }),
  });
  if (chk.status === 200 && chk.body.available) {
    futureToday = candidatePickup;
    break;
  }
}
const res5 = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: futureToday.toISOString(),
    returnDateTime: new Date(futureToday.getTime() + 2 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res5.status, 201, `Today with a future time should be created with 201: ${JSON.stringify(res5.body)}`);
assert.equal(res5.body.success, true);
console.log("✅ Case 5: Today with a future time -> allowed (201)");

// 6. Tomorrow with any valid time -> allowed
let tomorrow = new Date(Date.now() + 26 * 60 * 60 * 1000);
for (let d = 26; d <= 60; d += 4) {
  const candidate = new Date(Date.now() + d * 60 * 60 * 1000);
  const chk = await request(`/vehicles/${vehicleId}/check-availability`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      pickupDateTime: candidate.toISOString(),
      returnDateTime: new Date(candidate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    }),
  });
  if (chk.status === 200 && chk.body.available) {
    tomorrow = candidate;
    break;
  }
}
const res6 = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: tomorrow.toISOString(),
    returnDateTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res6.status, 201, `Tomorrow should be created with 201: ${JSON.stringify(res6.body)}`);
assert.equal(res6.body.success, true);
console.log("✅ Case 6: Tomorrow with any valid time -> allowed (201)");

// 7. Direct API request with a past date/time -> rejected
// 7a: checkAvailability with past date
const res7a = await request(`/vehicles/${vehicleId}/check-availability`, {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    pickupDateTime: yesterday.toISOString(),
    returnDateTime: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000).toISOString(),
  }),
});
assert.equal(res7a.status, 400, "Direct check-availability with past date should return 400");
assert.equal(res7a.body.message, EXPECTED_ERROR);

// 7b: direct createBooking with naive past string
const res7b = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupDateTime: "2026-09-08T10:00:00",
    returnDateTime: "2026-09-08T14:00:00",
  }),
});
assert.equal(res7b.status, 400, "Direct create with naive past string should return 400");
assert.equal(res7b.body.message, EXPECTED_ERROR);
console.log("✅ Case 7: Direct API request with past date/time -> rejected (400)");

// 8. User stays on payment page until selected booking time passes -> payment confirmation rejected
const verySoonPickup = new Date(Date.now() + 2000);
const verySoonReturn = new Date(verySoonPickup.getTime() + 60 * 60 * 1000);

let vehicle8 = null;
for (const candidate of vehicles) {
  const check = await request(`/vehicles/${candidate._id || candidate.id}/check-availability`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      pickupDateTime: verySoonPickup.toISOString(),
      returnDateTime: verySoonReturn.toISOString(),
    }),
  });
  if (check.status === 200 && check.body.available) {
    vehicle8 = candidate;
    break;
  }
}
assert.ok(vehicle8, "No available vehicle found for verySoon slot");
const vehicleId8 = vehicle8._id || vehicle8.id;

const res8Booking = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId8,
    pickupLocation: vehicle8.location || "Hub",
    pickupDateTime: verySoonPickup.toISOString(),
    returnDateTime: verySoonReturn.toISOString(),
  }),
});
assert.equal(res8Booking.status, 201, `Very soon booking should be created: ${JSON.stringify(res8Booking.body)}`);
const bookingId8 = res8Booking.body.data.bookingId || res8Booking.body.data._id;

console.log("Waiting for booking start time to elapse (3 seconds)...");
await new Promise((resolve) => setTimeout(resolve, 3000));

const res8Payment = await request(`/bookings/${bookingId8}/payment-status`, {
  method: "PUT",
  headers: authHeaders,
  body: JSON.stringify({ paymentStatus: "Paid" }),
});
assert.equal(res8Payment.status, 400, "Payment confirmation after start time elapsed must return 400");
assert.equal(res8Payment.body.message, EXPECTED_ERROR, "Payment revalidation error message mismatch");
console.log("✅ Case 8: Payment confirmation after booking time passes -> rejected (400)");

console.log("\n🎉 ALL 8 PAST DATE/TIME TEST CASES PASSED SUCCESSFULLY!");
