import assert from "node:assert/strict";
import {
  overlapsWithExistingBooking,
  isVehicleBookingAllowed,
  getBlockingBookingStatuses,
} from "./utils/bookingAvailability.js";

const vehicle = { status: "Available" };

assert.deepEqual(getBlockingBookingStatuses(), ["Upcoming", "Active"]);
assert.equal(
  overlapsWithExistingBooking(
    new Date("2026-09-10T10:00:00"),
    new Date("2026-09-10T14:00:00"),
    new Date("2026-09-10T11:00:00"),
    new Date("2026-09-10T13:00:00")
  ),
  true
);
assert.equal(
  overlapsWithExistingBooking(
    new Date("2026-09-10T14:00:00"),
    new Date("2026-09-10T17:00:00"),
    new Date("2026-09-10T10:00:00"),
    new Date("2026-09-10T14:00:00")
  ),
  false
);
assert.equal(
  isVehicleBookingAllowed(vehicle, [{ bookingStatus: "Cancelled" }], new Date("2026-09-10T09:00:00"), new Date("2026-09-10T11:00:00")).allowed,
  true
);
assert.equal(
  isVehicleBookingAllowed(vehicle, [{ bookingStatus: "Upcoming", pickupDateTime: new Date("2026-09-10T10:00:00"), returnDateTime: new Date("2026-09-10T14:00:00") }], new Date("2026-09-10T11:00:00"), new Date("2026-09-10T13:00:00")).allowed,
  false
);
assert.equal(
  isVehicleBookingAllowed({ status: "Maintenance" }, [], new Date("2026-09-10T09:00:00"), new Date("2026-09-10T11:00:00")).allowed,
  false
);
console.log("Availability rules tests passed");
