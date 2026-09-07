import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Smartphone, WalletCards } from "lucide-react";
import { bookingAPI } from "../services/api";
import { useNotifications } from "../context/NotificationContext";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: WalletCards },
];

function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [booking, setBooking] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    bookingAPI.getById(bookingId)
      .then((response) => {
        if (mounted) setBooking(response?.data || null);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Unable to load this booking.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [bookingId]);

  const payNow = async () => {
    setProcessing(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await bookingAPI.updatePaymentStatus(bookingId, "Paid");
      notify("Payment simulation successful.");
      navigate(`/booking-confirmation/${bookingId}`);
    } catch (requestError) {
      setError(requestError.message || "Payment simulation failed. Please try again.");
      notify(requestError.message || "Payment simulation failed.", "error");
      setProcessing(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-2xl px-6 pb-24 pt-36 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-lime-600" /><p className="mt-3 text-sm font-semibold text-gray-600">Loading payment details...</p></main>;
  }

  if (!booking) {
    return <main className="mx-auto max-w-2xl px-6 pb-24 pt-36 text-center"><p className="text-lg font-bold text-gray-950">Booking not found</p><Link to="/rides" className="mt-5 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white">View My Rides</Link></main>;
  }

  const vehicle = booking.vehicle || {};
  const isPaid = booking.paymentStatus === "Paid";

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8">
      <Link to={`/booking-confirmation/${bookingId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-950"><ArrowLeft className="h-4 w-4" /> Booking confirmation</Link>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100 sm:p-10">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-6">
          <div><p className="text-xs font-extrabold uppercase tracking-wider text-lime-600">SECURE CHECKOUT</p><h1 className="mt-2 text-3xl font-extrabold text-gray-950">Complete payment</h1><p className="mt-2 text-sm text-gray-500">Simulation only. No card or banking credentials are collected.</p></div>
          {isPaid && <CheckCircle2 className="h-8 w-8 shrink-0 text-lime-600" />}
        </div>
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gray-50 p-4"><img src={vehicle.image} alt={vehicle.name} className="h-20 w-24 rounded-xl object-cover" /><div><p className="text-xs font-mono font-bold text-gray-500">{booking.bookingId || booking._id}</p><h2 className="mt-1 text-xl font-bold text-gray-950">{vehicle.name || "Electric Vehicle"}</h2><p className="text-sm text-gray-500">{vehicle.type || "EV"}</p></div></div>
        <div className="mt-8 space-y-3 text-sm"><div className="flex justify-between text-gray-600"><span>Rental amount</span><strong>Rs. {booking.rentalPrice}</strong></div><div className="flex justify-between text-gray-600"><span>Service fee</span><strong>Rs. {booking.serviceFee}</strong></div><div className="flex justify-between text-gray-600"><span>Taxes</span><strong>Rs. {booking.taxes}</strong></div><div className="flex justify-between text-gray-600"><span>Security deposit</span><strong>Rs. {booking.securityDeposit}</strong></div><div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-extrabold text-gray-950"><span>Total</span><span className="text-lime-700">Rs. {booking.totalAmount}</span></div></div>
        {!isPaid && <><h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-gray-400">Payment method</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{paymentMethods.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setSelectedMethod(id)} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-bold ${selectedMethod === id ? "border-lime-500 bg-lime-50 text-gray-950" : "border-gray-200 text-gray-600"}`}><Icon className="h-4 w-4" />{label}</button>)}</div></>}
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="button" disabled={processing || isPaid} onClick={payNow} className="mt-8 w-full rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{processing ? "Processing payment..." : isPaid ? "Payment complete" : `Pay now with ${paymentMethods.find((method) => method.id === selectedMethod)?.label}`}</button>
      </div>
    </main>
  );
}

export default Payment;
