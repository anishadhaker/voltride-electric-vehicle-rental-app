import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5001/api";
const stamp = Date.now();

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return {
    status: response.status,
    body: await response.json(),
  };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const customerA = {
  name: "Isolation Customer A",
  email: `isolation-a-${stamp}@example.com`,
  mobile: `+919000${String(stamp).slice(-6)}`,
  password: "Password@123",
};
const customerB = {
  name: "Isolation Customer B",
  email: `isolation-b-${stamp}@example.com`,
  mobile: `+919001${String(stamp).slice(-6)}`,
  password: "Password@123",
};

const registeredA = await request("/auth/register", {
  method: "POST",
  body: JSON.stringify(customerA),
});
const registeredB = await request("/auth/register", {
  method: "POST",
  body: JSON.stringify(customerB),
});
assert.equal(registeredA.status, 201);
assert.equal(registeredB.status, 201);

const mobileLogin = await request("/auth/login", {
  method: "POST",
  body: JSON.stringify({ identifier: customerB.mobile, password: customerB.password }),
});
assert.equal(mobileLogin.status, 200);
assert.equal(mobileLogin.body.user.email, customerB.email);

const tokenA = registeredA.body.token;
const tokenB = mobileLogin.body.token;
const vehicleResponse = await request("/vehicles");
assert.equal(vehicleResponse.status, 200);
const vehicle = vehicleResponse.body.data.find((item) => item.status === "Available") || vehicleResponse.body.data[0];
assert.ok(vehicle?._id, "an available test vehicle is required");
const pickup = new Date(
  Date.now() + (365 + Math.floor(Math.random() * 365)) * 24 * 60 * 60 * 1000
);
const returnTime = new Date(pickup.getTime() + 3 * 60 * 60 * 1000);

async function createBooking(token, start, end) {
  return request("/bookings", {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify({
      vehicle: vehicle._id,
      pickupLocation: "Phagwara City Hub",
      pickupDateTime: start.toISOString(),
      returnDateTime: end.toISOString(),
    }),
  });
}

const bookingA = await createBooking(tokenA, pickup, returnTime);
assert.equal(bookingA.status, 201);
assert.equal(bookingA.body.data.paymentStatus, "Pending");
const bookingId = bookingA.body.data.bookingId;

assert.equal((await request(`/bookings/${bookingId}`, { headers: auth(tokenA) })).status, 200);
assert.equal((await request(`/bookings/${bookingId}`, { headers: auth(tokenB) })).status, 403);
assert.equal(
  (await request(`/bookings/${bookingId}/payment-status`, {
    method: "PUT",
    headers: auth(tokenB),
    body: JSON.stringify({ paymentStatus: "Paid" }),
  })).status,
  403
);

const overlapping = await createBooking(
  tokenB,
  new Date(pickup.getTime() + 60 * 60 * 1000),
  new Date(returnTime.getTime() + 60 * 60 * 1000)
);
assert.equal(overlapping.status, 409);

const nonOverlapping = await createBooking(
  tokenB,
  returnTime,
  new Date(returnTime.getTime() + 2 * 60 * 60 * 1000)
);
assert.equal(nonOverlapping.status, 201);

const payment = await request(`/bookings/${bookingId}/payment-status`, {
  method: "PUT",
  headers: auth(tokenA),
  body: JSON.stringify({ paymentStatus: "Paid" }),
});
assert.equal(payment.status, 200);
assert.equal(payment.body.data.paymentStatus, "Paid");

const cancelledPaymentBooking = await createBooking(
  tokenB,
  new Date(returnTime.getTime() + 3 * 60 * 60 * 1000),
  new Date(returnTime.getTime() + 5 * 60 * 60 * 1000)
);
assert.equal(cancelledPaymentBooking.status, 201);
const cancelledPaymentId = cancelledPaymentBooking.body.data.bookingId;
assert.equal(
  (await request(`/bookings/${cancelledPaymentId}/cancel`, {
    method: "PUT",
    headers: auth(tokenB),
  })).status,
  200
);
assert.equal(
  (await request(`/bookings/${cancelledPaymentId}/payment-status`, {
    method: "PUT",
    headers: auth(tokenB),
    body: JSON.stringify({ paymentStatus: "Paid" }),
  })).status,
  400
);

const restoredUser = await request("/auth/me", { headers: auth(tokenB) });
assert.equal(restoredUser.status, 200);
assert.equal(restoredUser.body.data.email, customerB.email);

const adminAccess = await request("/admin/dashboard", { headers: auth(tokenB) });
assert.equal(adminAccess.status, 403);

console.log("Isolation, ownership, payment, availability, and session checks passed");