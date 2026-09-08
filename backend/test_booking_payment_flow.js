import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5001/api";
const stamp = Date.now();
const testUser = {
  name: "Flow Tester",
  email: `flow-tester-${stamp}@example.com`,
  mobile: `+919011${String(stamp).slice(-6)}`,
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

console.log("=== Running Booking & Payment Flow Test Suite ===");

// 1. Register test customer
const reg = await request("/auth/register", {
  method: "POST",
  body: JSON.stringify(testUser),
});
assert.equal(reg.status, 201, "User registration failed");
const token = reg.body.token;
const authHeaders = { Authorization: `Bearer ${token}` };
console.log("✅ Customer registered and authenticated");

// 2. Fetch an available vehicle
const vehiclesRes = await request("/vehicles");
assert.equal(vehiclesRes.status, 200, "Vehicles fetch failed");
const vehicles = vehiclesRes.body.data || vehiclesRes.body || [];
assert.ok(vehicles.length > 0, "No vehicles found in database");

let vehicle = null;
let pickupDate = null;
let returnDate = null;

// Find a future slot that is available
for (let h = 8; h <= 120; h += 6) {
  const candidatePickup = new Date(Date.now() + h * 60 * 60 * 1000);
  const candidateReturn = new Date(candidatePickup.getTime() + 4 * 60 * 60 * 1000);
  for (const candVeh of vehicles) {
    const chk = await request(`/vehicles/${candVeh._id || candVeh.id}/check-availability`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        pickupDateTime: candidatePickup.toISOString(),
        returnDateTime: candidateReturn.toISOString(),
      }),
    });
    if (chk.status === 200 && chk.body.available) {
      vehicle = candVeh;
      pickupDate = candidatePickup;
      returnDate = candidateReturn;
      break;
    }
  }
  if (vehicle) break;
}

assert.ok(vehicle, "Could not find an available vehicle and slot");
const vehicleId = vehicle._id || vehicle.id;
console.log(`✅ Selected vehicle: ${vehicle.name} (${vehicleId})`);

// 3. Create a booking -> should be created with pending_payment
const createRes = await request("/bookings", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    vehicle: vehicleId,
    pickupLocation: vehicle.location || "VoltRide Hub",
    pickupDateTime: pickupDate.toISOString(),
    returnDateTime: returnDate.toISOString(),
  }),
});

assert.equal(createRes.status, 201, `Booking creation should return 201: ${JSON.stringify(createRes.body)}`);
assert.equal(createRes.body.success, true);
const newBooking = createRes.body.data;
assert.ok(newBooking.bookingId, "Booking must have a bookingId reference");
assert.equal(newBooking.bookingStatus, "pending_payment", "New booking must have bookingStatus: pending_payment");
assert.equal(newBooking.paymentStatus, "Pending", "New booking must have paymentStatus: Pending");
console.log(`✅ Booking created with bookingStatus: 'pending_payment' and paymentStatus: 'Pending' (Ref: ${newBooking.bookingId})`);

// 4. Verify that unconfirmed booking does NOT appear in getMyBookings
const myBookingsBefore = await request("/bookings/my-bookings", {
  headers: authHeaders,
});
assert.equal(myBookingsBefore.status, 200);
const bookingsListBefore = myBookingsBefore.body.data || [];
const foundInUpcomingBefore = bookingsListBefore.find((b) => b.bookingId === newBooking.bookingId);
assert.equal(foundInUpcomingBefore, undefined, "Unpaid booking MUST NOT appear in customer my-bookings");
console.log("✅ Verified: Unpaid booking does NOT appear in My Rides / getMyBookings");

// 5. Verify that unconfirmed booking does NOT increment upcomingRides in getMyStats
const statsBefore = await request("/bookings/my-stats", {
  headers: authHeaders,
});
assert.equal(statsBefore.status, 200);
assert.equal(statsBefore.body.data.upcomingRides, 0, "upcomingRides must be 0 for unpaid booking");
console.log("✅ Verified: upcomingRides in getMyStats is 0 for unpaid booking");

// 6. Confirm payment via PUT /api/bookings/:id/payment-status
const payRes = await request(`/bookings/${newBooking.bookingId}/payment-status`, {
  method: "PUT",
  headers: authHeaders,
  body: JSON.stringify({ paymentStatus: "Paid" }),
});

assert.equal(payRes.status, 200, `Payment confirmation should succeed: ${JSON.stringify(payRes.body)}`);
assert.equal(payRes.body.success, true);
const confirmedBooking = payRes.body.data;
assert.equal(confirmedBooking.paymentStatus, "Paid", "Payment status must be Paid");
assert.equal(confirmedBooking.bookingStatus, "Upcoming", "Booking status must be upgraded to Upcoming");
console.log("✅ Payment confirmed: bookingStatus upgraded to Upcoming, paymentStatus updated to Paid");

// 7. Verify that confirmed booking NOW appears in getMyBookings
const myBookingsAfter = await request("/bookings/my-bookings", {
  headers: authHeaders,
});
assert.equal(myBookingsAfter.status, 200);
const bookingsListAfter = myBookingsAfter.body.data || [];
const foundInUpcomingAfter = bookingsListAfter.find((b) => b.bookingId === newBooking.bookingId);
assert.ok(foundInUpcomingAfter, "Confirmed booking MUST appear in customer my-bookings");
assert.equal(foundInUpcomingAfter.bookingStatus, "Upcoming");
assert.equal(foundInUpcomingAfter.paymentStatus, "Paid");
console.log("✅ Verified: Confirmed booking NOW appears in My Rides (Upcoming)");

// 8. Verify that confirmed booking NOW increments upcomingRides in getMyStats
const statsAfter = await request("/bookings/my-stats", {
  headers: authHeaders,
});
assert.equal(statsAfter.status, 200);
assert.equal(statsAfter.body.data.upcomingRides, 1, "upcomingRides must be 1 after payment confirmation");
console.log("✅ Verified: upcomingRides in getMyStats is now 1");

console.log("\n🎉 ALL BOOKING & PAYMENT FLOW TESTS PASSED SUCCESSFULLY!");
