export const BLOCKING_BOOKING_STATUSES = ["pending_payment", "Upcoming", "Active"];
export const UNAVAILABLE_VEHICLE_STATUSES = ["Unavailable", "Maintenance", "Offline", "Charging"];

export const overlapsWithExistingBooking = (
  newPickup,
  newReturn,
  existingPickup,
  existingReturn
) => {
  const newPickupMs = new Date(newPickup).getTime();
  const newReturnMs = new Date(newReturn).getTime();
  const existingPickupMs = new Date(existingPickup).getTime();
  const existingReturnMs = new Date(existingReturn).getTime();

  if (
    Number.isNaN(newPickupMs) ||
    Number.isNaN(newReturnMs) ||
    Number.isNaN(existingPickupMs) ||
    Number.isNaN(existingReturnMs)
  ) {
    return false;
  }

  return newPickupMs < existingReturnMs && newReturnMs > existingPickupMs;
};

export const getBlockingBookingStatuses = () => [...BLOCKING_BOOKING_STATUSES];

export const isVehicleBookingAllowed = (
  vehicle,
  existingBookings = [],
  newPickup,
  newReturn
) => {
  if (!vehicle) {
    return {
      allowed: false,
      message: "Vehicle not found",
    };
  }

  if (vehicle.status === "Unavailable") {
    return { allowed: false, message: "This vehicle is currently unavailable for booking." };
  }

  if (vehicle.status === "Maintenance") {
    return {
      allowed: false,
      message: "This vehicle is under maintenance and cannot be booked.",
    };
  }

  if (vehicle.status === "Offline") {
    return {
      allowed: false,
      message: "This vehicle is offline and unavailable for booking.",
    };
  }

  if (vehicle.status === "Charging") {
    return {
      allowed: false,
      message: "This vehicle is currently charging and unavailable for the selected time.",
    };
  }

  const blockingBookings = (existingBookings || []).filter((booking) => {
    const bookingStatus = booking?.bookingStatus || booking?.status;
    if (!BLOCKING_BOOKING_STATUSES.includes(bookingStatus)) {
      return false;
    }

    const existingPickup = booking?.pickupDateTime || booking?.pickupDate;
    const existingReturn = booking?.returnDateTime || booking?.returnDate;

    if (!existingPickup || !existingReturn) {
      return false;
    }

    return overlapsWithExistingBooking(
      newPickup,
      newReturn,
      existingPickup,
      existingReturn
    );
  });

  if (blockingBookings.length > 0) {
    return {
      allowed: false,
      message: "This vehicle is already booked for the selected time period",
    };
  }

  return {
    allowed: true,
    message: "Vehicle is available for the selected time.",
  };
};
