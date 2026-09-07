import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bike, CalendarDays, Clock3, Loader2, MapPin } from "lucide-react";
import { bookingAPI } from "../services/api";

const statusStyles = {
  Upcoming: "bg-lime-100 text-lime-900",
  Active: "bg-blue-100 text-blue-900",
  Completed: "bg-emerald-100 text-emerald-900",
  Cancelled: "bg-gray-100 text-gray-700",
};

function BookingDetails() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    bookingAPI.getById(bookingId)
      .then((response) => { if (mounted) setBooking(response?.data || null); })
      .catch((requestError) => { if (mounted) setError(requestError.message || "Unable to load booking details."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [bookingId]);

  if (loading) return <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-lime-600" /><p className="mt-3 text-sm font-semibold text-gray-600">Loading booking details...</p></main>;
  if (error || !booking) return <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 text-center"><p className="text-lg font-bold text-gray-950">{error || "Booking not found"}</p><Link to="/rides" className="mt-5 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white">Back to My Rides</Link></main>;

  const vehicle = booking.vehicle || {};
  const formatDate = (value) => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32 lg:px-8">
      <Link to="/rides" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-950"><ArrowLeft className="h-4 w-4" /> My Rides</Link>
      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-wider text-lime-600">BOOKING DETAILS</p><h1 className="mt-2 text-3xl font-extrabold text-gray-950">{booking.bookingId || booking._id}</h1></div><div className="flex gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.bookingStatus] || "bg-gray-100 text-gray-700"}`}>{booking.bookingStatus}</span><span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-bold text-white">Payment: {booking.paymentStatus}</span></div></div>
      <div className="mt-8 space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center"><img src={vehicle.image} alt={vehicle.name} className="h-28 w-full rounded-2xl object-cover sm:w-40" /><div><p className="text-sm text-gray-500">{vehicle.type}</p><h2 className="text-2xl font-bold text-gray-950">{vehicle.name || "Electric Vehicle"}</h2><p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-4 w-4 text-lime-600" />{booking.pickupLocation}</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-gray-50 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"><CalendarDays className="h-4 w-4" /> Pickup</p><p className="mt-2 font-bold text-gray-950">{formatDate(booking.pickupDateTime)}</p></div><div className="rounded-2xl bg-gray-50 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"><Clock3 className="h-4 w-4" /> Return</p><p className="mt-2 font-bold text-gray-950">{formatDate(booking.returnDateTime)}</p></div></div>
        <div className="grid gap-3 text-sm sm:grid-cols-2"><p className="rounded-xl border border-gray-100 p-4 text-gray-600">Duration <strong className="float-right text-gray-950">{booking.duration} hours</strong></p><p className="rounded-xl border border-gray-100 p-4 text-gray-600">Rental price <strong className="float-right text-gray-950">Rs. {booking.rentalPrice}</strong></p><p className="rounded-xl border border-gray-100 p-4 text-gray-600">Service fee and taxes <strong className="float-right text-gray-950">Rs. {(booking.serviceFee || 0) + (booking.taxes || 0)}</strong></p><p className="rounded-xl border border-gray-100 p-4 text-gray-600">Security deposit <strong className="float-right text-gray-950">Rs. {booking.securityDeposit}</strong></p></div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-5"><span className="text-lg font-bold text-gray-950">Total amount</span><span className="text-2xl font-extrabold text-lime-700">Rs. {booking.totalAmount}</span></div>
        <div className="flex flex-wrap gap-3"><Link to={`/booking-confirmation/${bookingId}`} className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white"><Bike className="h-4 w-4" /> Confirmation</Link>{booking.paymentStatus === "Pending" && booking.bookingStatus === "Upcoming" && <Link to={`/payment/${bookingId}`} className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-gray-950">Complete payment</Link>}</div>
      </div>
    </main>
  );
}

export default BookingDetails;
