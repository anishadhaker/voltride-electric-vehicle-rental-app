export const PAST_DATE_TIME_ERROR =
  "You can't book a ride for this time because it has already passed.";

/**
 * Returns YYYY-MM-DD in local time
 */
export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns HH:mm in local time
 */
export const getLocalTimeString = (d = new Date()) => {
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Parses date string (YYYY-MM-DD) and time string (HH:mm) into a local Date object
 */
export const parseLocalDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Checks if the selected date and time are in the past (<= now)
 */
export const isPastDateTime = (dateStr, timeStr) => {
  const dt = parseLocalDateTime(dateStr, timeStr);
  if (!dt) return false;
  return dt.getTime() <= Date.now();
};

/**
 * Converts local date and time strings into a standardized ISO string
 */
export const createLocalISOString = (dateStr, timeStr) => {
  const dt = parseLocalDateTime(dateStr, timeStr);
  return dt ? dt.toISOString() : `${dateStr}T${timeStr}:00`;
};

/**
 * Calculates initial booking times in the future (next hour and +4 hours)
 */
export const getInitialBookingTimes = () => {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  return {
    pickupDate: getLocalDateString(start),
    pickupTime: getLocalTimeString(start),
    returnDate: getLocalDateString(end),
    returnTime: getLocalTimeString(end),
  };
};