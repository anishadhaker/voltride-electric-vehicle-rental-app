import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BatteryCharging,
  CalendarDays,
  Clock3,
  FileCheck,
  Loader2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllVehicles, getVehicleById } from "../data/vehicles";
import { bookingAPI, vehicleAPI } from "../services/api";
import {
  PAST_DATE_TIME_ERROR,
  getLocalDateString,
  getLocalTimeString,
  isPastDateTime,
  createLocalISOString,
  getInitialBookingTimes,
} from "../utils/dateTimeUtils";

const today = getLocalDateString();

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const passedState = location.state || {};

  const [vehicle, setVehicle] = useState(() => {
    const all = getAllVehicles();
    return getVehicleById(id) || all[0];
  });

  useEffect(() => {
    let isMounted = true;
    if (id) {
      vehicleAPI
        .getById(id)
        .then((res) => {
          if (isMounted && res?.data?.data) {
            setVehicle(res.data.data);
          }
        })
        .catch(() => {
          // Gracefully fallback
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const [form, setForm] = useState(() => {
    const initialTimes = getInitialBookingTimes();
    return {
      pickupDate: passedState.pickupDate || initialTimes.pickupDate,
      pickupTime: passedState.pickupTime || initialTimes.pickupTime,
      returnDate: passedState.returnDate || initialTimes.returnDate,
      returnTime: passedState.returnTime || initialTimes.returnTime,
      customerName: user?.name || "Anisha Dhaker",
      customerMobile: user?.mobile || "+91 90798 72848",
      customerEmail: user?.email || "anisha@example.com",
      helmetCount: "1",
      terms: false,
    };
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({
    loading: false,
    available: null,
    message: "",
  });

  const start =
    form.pickupDate && form.pickupTime
      ? new Date(`${form.pickupDate}T${form.pickupTime}`)
      : null;
  const end =
    form.returnDate && form.returnTime
      ? new Date(`${form.returnDate}T${form.returnTime}`)
      : null;

  const isPickupPast = isPastDateTime(form.pickupDate, form.pickupTime);
  const isTimeOrderInvalid = Boolean(start && end && end <= start);

  const handleCheckAvailability = async () => {
    const vehicleId = vehicle?._id || vehicle?.id;
    if (!vehicleId) {
      setAvailabilityStatus({
        loading: false,
        available: false,
        message: "Vehicle not found.",
      });
      return;
    }

    if (!start || !end) {
      setAvailabilityStatus({
        loading: false,
        available: false,
        message: "Please select a valid pickup and return time.",
      });
      return;
    }

    if (isPickupPast) {
      setAvailabilityStatus({
        loading: false,
        available: false,
        message: PAST_DATE_TIME_ERROR,
      });
      return;
    }

    if (isTimeOrderInvalid) {
      setAvailabilityStatus({
        loading: false,
        available: false,
        message: "Return date and time must be later than the pickup date and time.",
      });
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityStatus({
      loading: true,
      available: null,
      message: "Checking availability...",
    });

    try {
      const response = await vehicleAPI.checkAvailability(vehicleId, {
        pickupDateTime: createLocalISOString(form.pickupDate, form.pickupTime),
        returnDateTime: createLocalISOString(form.returnDate, form.returnTime),
      });

      const available = Boolean(response?.available);
      setAvailabilityStatus({
        loading: false,
        available,
        message:
          response?.message ||
          (available
            ? "Vehicle is available for the selected time."
            : "Vehicle is already booked for the selected time period"),
      });
    } catch (apiErr) {
      const errorMessageText =
        apiErr?.message || apiErr?.data?.message || "Unable to check availability. Please try again.";
      setAvailabilityStatus({
        loading: false,
        available: false,
        message: errorMessageText,
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const rawHours =
    start && end && !isTimeOrderInvalid
      ? Math.ceil((end - start) / (1000 * 60 * 60))
      : 0;
  const rentalHours = Math.max(1, rawHours);

  const pricePerHour = vehicle.pricePerHour || vehicle.price || 59;
  const rentalPrice = rentalHours * pricePerHour;
  const serviceFee = 10;
  const taxes = Math.round(rentalPrice * 0.05);
  const totalAmount = rentalPrice + serviceFee + taxes;

  const isValid =
    form.pickupDate &&
    form.pickupTime &&
    form.returnDate &&
    form.returnTime &&
    form.customerName.trim() &&
    form.customerMobile.trim() &&
    form.terms &&
    !isTimeOrderInvalid &&
    !isPickupPast &&
    availabilityStatus.available === true &&
    !checkingAvailability &&
    !availabilityStatus.loading;

  const updateForm = (field, value) => {
    setErrorMessage("");
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (isPastDateTime(next.pickupDate, next.pickupTime)) {
        setErrorMessage(PAST_DATE_TIME_ERROR);
        setAvailabilityStatus({
          loading: false,
          available: false,
          message: PAST_DATE_TIME_ERROR,
        });
      } else if (availabilityStatus.message === PAST_DATE_TIME_ERROR) {
        setAvailabilityStatus({
          loading: false,
          available: null,
          message: "",
        });
      }
      return next;
    });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (isPickupPast) {
      setErrorMessage(PAST_DATE_TIME_ERROR);
      return;
    }
    if (isTimeOrderInvalid) {
      setErrorMessage("Return date and time must be after pickup date and time.");
      return;
    }
    if (!form.terms) {
      setErrorMessage("Please agree to the rental terms and conditions to proceed.");
      return;
    }
    if (checkingAvailability || availabilityStatus.loading) {
      setErrorMessage("Checking availability. Please wait a moment and try again.");
      return;
    }
    if (availabilityStatus.available === false) {
      setErrorMessage(availabilityStatus.message || "This vehicle is not available for the selected time.");
      return;
    }
    if (!isValid) {
      setErrorMessage("Please fill in all required fields accurately.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    let apiBookingRef = null;
    try {
      const pickupISO = createLocalISOString(form.pickupDate, form.pickupTime);
      const returnISO = createLocalISOString(form.returnDate, form.returnTime);

      const res = await bookingAPI.create({
        vehicle: vehicle._id || vehicle.id,
        pickupLocation: vehicle.location,
        pickupDateTime: pickupISO,
        returnDateTime: returnISO,
        duration: rentalHours,
        rentalPrice,
        serviceFee,
        taxes,
        totalAmount,
      });

      const bookingData = res?.data?.bookingId ? res.data : (res?.data?.data || res?.data || res);
      apiBookingRef = bookingData?.bookingId || bookingData?._id || res?.bookingId || res?._id;

      if (!apiBookingRef) {
        throw new Error("Reservation created, but failed to retrieve booking reference. Please check your rides.");
      }

      setIsSubmitting(false);
      navigate(`/payment/${apiBookingRef}`);
      return;
    } catch (apiErr) {
      const backendMessage = apiErr?.data?.message || apiErr?.message || "Booking request failed.";
      setErrorMessage(backendMessage);
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8">
      {/* Back Button */}
      <Link
        to={vehicle ? `/vehicle/${vehicle._id || vehicle.id}` : "/explore"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-950"
      >
        <ArrowLeft className="h-4 w-4" /> Back to vehicle details
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-wider text-lime-600">
          SECURE RESERVATION
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
          Complete Your Booking
        </h1>
        <p className="mt-3 text-sm text-gray-500 sm:text-base">
          Confirm your schedule, review safety precautions, and reserve your ride instantly.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        {/* Left: Booking Form */}
        <form onSubmit={handleSubmitBooking} className="space-y-8">
          {/* Selected Vehicle Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-7">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Selected Vehicle
            </h2>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="h-28 w-full rounded-2xl object-cover sm:w-36"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-lime-100 px-2.5 py-0.5 text-xs font-bold text-lime-800">
                    {vehicle.type}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {vehicle.brand}
                  </span>
                </div>
                <h3 className="mt-1 text-2xl font-bold text-gray-950">{vehicle.name}</h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-lime-600" />
                    {vehicle.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {vehicle.rating} ({vehicle.reviews} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="h-3.5 w-3.5 text-lime-600" />
                    {vehicle.battery}% battery
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Form */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Rental Period</h2>
                <p className="text-xs text-gray-500">
                  Select when you want to pick up and return the vehicle
                </p>
              </div>
              <CalendarDays className="h-5 w-5 text-lime-600" />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Pickup Date
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.pickupDate}
                    onChange={(e) => updateForm("pickupDate", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Pickup Time
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="time"
                    required
                    min={form.pickupDate === today ? getLocalTimeString() : undefined}
                    value={form.pickupTime}
                    onChange={(e) => updateForm("pickupTime", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Return Date
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="date"
                    required
                    min={form.pickupDate || today}
                    value={form.returnDate}
                    onChange={(e) => updateForm("returnDate", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Return Time
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="time"
                    required
                    min={form.returnDate === form.pickupDate ? form.pickupTime : undefined}
                    value={form.returnTime}
                    onChange={(e) => updateForm("returnTime", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
              </div>
            </div>

            {isPickupPast && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-100">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {PAST_DATE_TIME_ERROR}
              </div>
            )}

            {isTimeOrderInvalid && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-100">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Return date & time must be strictly after the pickup date & time.
              </div>
            )}

            {!isTimeOrderInvalid && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold ${
                  availabilityStatus.loading
                    ? "border-blue-100 bg-blue-50 text-blue-700"
                    : availabilityStatus.available === false
                      ? "border-red-100 bg-red-50 text-red-700"
                      : availabilityStatus.available === true
                        ? "border-lime-100 bg-lime-50 text-lime-800"
                        : "border-gray-100 bg-gray-50 text-gray-700"
                }`}
              >
                <Clock3 className="h-4 w-4 shrink-0" />
                {availabilityStatus.loading
                  ? "Checking availability..."
                  : availabilityStatus.message || "Select your rental period to check availability."}
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={checkingAvailability || !start || !end || isTimeOrderInvalid}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-bold text-lime-800 transition hover:bg-lime-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500"
            >
              {checkingAvailability ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking Availability...
                </>
              ) : (
                <>Check Availability</>
              )}
            </button>

            <div className="mt-5 rounded-2xl bg-lime-50/70 p-4 border border-lime-100 flex items-center justify-between text-xs text-lime-900">
              <span className="flex items-center gap-2 font-semibold">
                <Clock3 className="h-4 w-4 text-lime-700" /> Calculated Duration:
              </span>
              <strong className="text-sm font-bold">
                {rentalHours} {rentalHours === 1 ? "Hour" : "Hours"}
              </strong>
            </div>
          </div>

          {/* Rider Details */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Rider Contact Information</h2>
                <p className="text-xs text-gray-500">
                  Used for verification and booking communication
                </p>
              </div>
              <User className="h-5 w-5 text-lime-600" />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => updateForm("customerName", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={form.customerMobile}
                  onChange={(e) => updateForm("customerMobile", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => updateForm("customerEmail", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions Agreement */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => updateForm("terms", e.target.checked)}
                className="mt-1 h-4 w-4 rounded-md accent-lime-500 cursor-pointer"
              />
              <span className="text-xs leading-relaxed text-gray-600">
                I agree to the VoltRide Rental Terms and certify that I possess a valid driving license.
              </span>
            </label>

            {errorMessage && (
              <p className="mt-3 text-xs font-semibold text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-6 py-4 text-base font-bold text-gray-950 shadow-md transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 fill-current" /> Confirm & Reserve Ride
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right: Sticky Price Breakdown & Summary */}
        <aside className="sticky top-28 space-y-6">
          <div className="rounded-3xl bg-gray-950 p-6 text-white shadow-xl sm:p-8">
            <h2 className="text-lg font-bold">Fare Breakdown</h2>
            <p className="mt-1 text-xs text-gray-400">
              Transparent, all-inclusive pricing
            </p>

            <div className="mt-6 space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>
                  Base Rental ({rentalHours} {rentalHours === 1 ? "hr" : "hrs"} &times; ₹{pricePerHour})
                </span>
                <span className="font-semibold text-white">₹{rentalPrice}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span className="flex items-center gap-1">
                  Service Platform Fee
                </span>
                <span className="font-semibold text-white">₹{serviceFee}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>GST / Taxes (5%)</span>
                <span className="font-semibold text-white">₹{taxes}</span>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-base font-bold text-white">Total Payable</p>
                    <p className="text-[11px] text-gray-400">Rental, service fee, and taxes</p>
                  </div>
                  <p className="text-2xl font-extrabold text-lime-400">₹{totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-xs text-gray-300 flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
              <span>
                Zero hidden charges. No fuel cost — battery comes pre-charged above 85%.
              </span>
            </div>
          </div>

          {/* Guarantee Highlights */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 text-xs text-gray-600 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-lime-600 shrink-0" />
              <span>Free instant cancellation up to 1 hour before pickup.</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-lime-600 shrink-0" />
              <span>Digital key generated immediately on booking.</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Booking;
