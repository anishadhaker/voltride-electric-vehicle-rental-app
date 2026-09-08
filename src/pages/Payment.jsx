import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bike,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Info,
  Loader2,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import { bookingAPI } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import { PAST_DATE_TIME_ERROR } from "../utils/dateTimeUtils";

const CONFIGURED_UPI_ID = "voltride@okhdfcbank";

function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [booking, setBooking] = useState(null);
  const [activeMethod, setActiveMethod] = useState("upi"); // "upi" | "qr"
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!bookingId || bookingId === "undefined" || bookingId === "null") {
      setError("Invalid booking reference. Please return and select a vehicle to book.");
      setLoading(false);
      return;
    }

    bookingAPI
      .getById(bookingId)
      .then((response) => {
        if (mounted) {
          const b = response?.data || response;
          setBooking(b);
          if (b.paymentStatus === "Paid" && b.bookingStatus !== "pending_payment") {
            setPaymentSuccess(true);
            setConfirmedBooking(b);
          }
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message || "Unable to load booking details for payment.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const totalAmount =
    (Number(booking?.rentalPrice) || 0) +
    (Number(booking?.serviceFee) || 0) +
    (Number(booking?.taxes) || 0);

  // Generate UPI QR Code
  useEffect(() => {
    if (booking && totalAmount > 0) {
      const ref = booking.bookingId || booking._id;
      const upiUri = `upi://pay?pa=${CONFIGURED_UPI_ID}&pn=VoltRide&am=${totalAmount}&cu=INR&tr=${ref}&tn=VoltRide%20Booking%20${ref}`;
      QRCode.toDataURL(upiUri, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => {
          console.error("Failed to generate UPI QR code:", err);
        });
    }
  }, [booking, totalAmount]);

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(CONFIGURED_UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // Fallback
    }
  };

  const isPickupPast = Boolean(
    booking?.pickupDateTime && new Date(booking.pickupDateTime).getTime() <= Date.now()
  );

  const handleConfirmPayment = async () => {
    if (!booking) return;

    // 1. Validate start time has not passed
    if (new Date(booking.pickupDateTime).getTime() <= Date.now()) {
      setError(PAST_DATE_TIME_ERROR);
      notify(PAST_DATE_TIME_ERROR, "error");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const targetId = booking.bookingId || booking._id;
      const response = await bookingAPI.updatePaymentStatus(targetId, "Paid");
      const updated = response?.data || response;

      setConfirmedBooking(updated);
      setPaymentSuccess(true);
      notify("Payment confirmed successfully! Your ride is booked.");
    } catch (requestError) {
      const msg =
        requestError?.data?.message ||
        requestError?.message ||
        "Payment confirmation failed. Please try again.";
      setError(msg);
      notify(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-36 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-lime-600" />
        <p className="mt-4 text-base font-semibold text-gray-700">
          Loading secure payment details...
        </p>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-36 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
          <h2 className="mt-3 text-xl font-bold text-red-950">Unable to Proceed to Payment</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/explore"
              className="inline-flex rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-lime-500 hover:text-gray-950 transition"
            >
              Explore Vehicles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const vehicle = booking?.vehicle || {};
  const currentBookingRef = booking?.bookingId || booking?._id || bookingId;

  // Format dates for display
  const pickupDateFormatted = booking?.pickupDateTime
    ? new Date(booking.pickupDateTime).toLocaleDateString([], {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const pickupTimeFormatted = booking?.pickupDateTime
    ? new Date(booking.pickupDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const returnTimeFormatted = booking?.returnDateTime
    ? new Date(booking.returnDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  // SUCCESS VIEW: Shown once payment is confirmed
  if (paymentSuccess) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-32 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="bg-gradient-to-br from-lime-500 to-emerald-600 px-8 py-10 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-lime-100">
              PAYMENT SUCCESSFUL
            </p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Ride Booked Successfully</h1>
            <p className="mt-2 text-sm text-lime-50">
              Your electric vehicle reservation has been confirmed and saved to MongoDB.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="rounded-2xl bg-gray-50 p-5">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Booking Reference
                </span>
                <span className="font-mono text-sm font-extrabold text-lime-700">
                  {currentBookingRef}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="font-bold text-gray-950">{vehicle.name || "VoltRide EV"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="font-bold text-gray-950">₹{totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pickup Date & Time</p>
                  <p className="font-bold text-gray-950">
                    {pickupDateFormatted} at {pickupTimeFormatted}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Return Time</p>
                  <p className="font-bold text-gray-950">{returnTimeFormatted}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/booking-confirmation/${currentBookingRef}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-lime-500 hover:text-gray-950"
              >
                <Bike className="h-4 w-4" /> View Confirmation Details
              </Link>
              <Link
                to="/rides"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
              >
                Go to My Rides <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // MAIN PAYMENT VIEW
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32 lg:px-8">
      {/* Back Button */}
      <Link
        to={vehicle._id ? `/booking/${vehicle._id}` : "/explore"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-950 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to reservation details
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* Left Column: Payment Details Summary */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-lime-600">
                PAYMENT DETAILS
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-gray-950">Complete Your Payment</h1>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
              Payment Pending
            </span>
          </div>

          {/* Vehicle Card */}
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
            {vehicle.image ? (
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="h-20 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-gray-200 text-xs font-bold text-gray-400">
                EV Image
              </div>
            )}
            <div>
              <span className="inline-flex items-center gap-1 rounded-md bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-900">
                <Zap className="h-3 w-3 fill-lime-700" /> {vehicle.type || "EV"}
              </span>
              <h2 className="mt-1 text-lg font-bold text-gray-950">{vehicle.name || "VoltRide EV"}</h2>
              <p className="text-xs font-mono text-gray-500">Ref: {currentBookingRef}</p>
            </div>
          </div>

          {/* Schedule Breakdown */}
          <div className="mt-6 space-y-3 rounded-2xl border border-gray-100 p-4 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Booking Date
              </span>
              <span className="font-semibold text-gray-950">{pickupDateFormatted}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" /> Start Time (Pickup)
              </span>
              <span className="font-semibold text-gray-950">{pickupTimeFormatted}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" /> End Time (Return)
              </span>
              <span className="font-semibold text-gray-950">{returnTimeFormatted}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Rental Duration</span>
              <span className="font-semibold text-gray-950">{booking.duration} hours</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mt-6 space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Rental Charge</span>
              <span>₹{booking.rentalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service & Cleaning Fee</span>
              <span>₹{booking.serviceFee}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes (5% GST)</span>
              <span>₹{booking.taxes}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-lg font-extrabold text-gray-950">
              <span>Total Amount</span>
              <span className="text-2xl text-lime-700 font-extrabold">₹{totalAmount}</span>
            </div>
          </div>

          {isPickupPast && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">Time Expired</p>
                <p className="mt-1">{PAST_DATE_TIME_ERROR}</p>
              </div>
            </div>
          )}

          {error && !isPickupPast && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Payment Method Selection & Action */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
            SELECT PAYMENT METHOD
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-950">Choose Payment Method</h2>

          {/* Tab Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveMethod("upi")}
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 px-4 text-sm font-bold transition ${
                activeMethod === "upi"
                  ? "border-lime-500 bg-lime-50 text-gray-950 ring-2 ring-lime-400/50"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Smartphone className="h-4 w-4 text-lime-600" /> Pay with UPI
            </button>
            <button
              type="button"
              onClick={() => setActiveMethod("qr")}
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 px-4 text-sm font-bold transition ${
                activeMethod === "qr"
                  ? "border-lime-500 bg-lime-50 text-gray-950 ring-2 ring-lime-400/50"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <QrCode className="h-4 w-4 text-lime-600" /> Pay with QR Code
            </button>
          </div>

          {/* TAB 1: PAY WITH UPI */}
          {activeMethod === "upi" && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    UPI ID
                  </span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-gray-700 shadow-xs ring-1 ring-gray-200 hover:bg-gray-100"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-lime-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-gray-500" /> Copy UPI ID
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl bg-white p-3 font-mono text-base font-extrabold text-gray-950 border border-gray-200">
                  {CONFIGURED_UPI_ID}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-xs text-gray-500">Amount</span>
                    <p className="text-lg font-extrabold text-lime-700">₹{totalAmount}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Booking Reference</span>
                    <p className="font-mono text-sm font-bold text-gray-950">{currentBookingRef}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-lime-200 bg-lime-50/60 p-4 text-xs text-gray-700">
                <p className="font-bold text-lime-950 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-lime-700 shrink-0" /> Instructions:
                </p>
                <p className="mt-1 leading-relaxed text-gray-600">
                  Open any UPI application (Google Pay, PhonePe, Paytm, CRED) and make the payment
                  to the UPI ID shown above.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PAY WITH QR CODE */}
          {activeMethod === "qr" && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-6 text-center">
                <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-gray-100">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="VoltRide UPI Payment QR Code"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
                  )}
                </div>

                <p className="mt-4 text-xs font-semibold text-gray-600">
                  Scan this QR code using Google Pay, PhonePe, Paytm, or another UPI app.
                </p>

                <div className="mt-4 flex items-center justify-center gap-6 border-t border-gray-200 pt-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Amount</span>
                    <p className="text-lg font-extrabold text-lime-700">₹{totalAmount}</p>
                  </div>
                  <div className="border-l border-gray-200 pl-6 text-left">
                    <span className="text-xs text-gray-500">Booking Ref</span>
                    <p className="font-mono text-sm font-bold text-gray-950">{currentBookingRef}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEMO CONFIRMATION BANNER */}
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" /> Demo Payment Confirmation
            </p>
            <p className="mt-1 leading-relaxed">
              In this development/demo environment, click below to confirm your payment simulation.
              No actual banking charge will occur.
            </p>
          </div>

          {/* CONFIRMATION BUTTON */}
          <button
            type="button"
            disabled={processing || isPickupPast}
            onClick={handleConfirmPayment}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-4 text-base font-extrabold text-white transition hover:bg-lime-500 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Confirming Payment...
              </>
            ) : isPickupPast ? (
              "Booking Expired"
            ) : (
              "I Have Completed Payment"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Payment;
