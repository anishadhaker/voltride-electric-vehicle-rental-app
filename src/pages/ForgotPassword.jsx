import { useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const EMAIL_KEY = "voltride_password_reset_email";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(normalizedEmail);
      sessionStorage.setItem(EMAIL_KEY, normalizedEmail);
      setSuccess("If an account exists for that email, a reset code has been sent.");
      setTimeout(() => navigate("/verify-otp"), 700);
    } catch (requestError) {
      setError(requestError.message || "Unable to request a reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#f8faf9] px-6 py-20 lg:px-8">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400">
            <Zap className="h-8 w-8 fill-black" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your registered email to receive a secure reset code.</p>
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <label htmlFor="reset-email" className="block text-xs font-bold text-gray-700">Email Address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
            <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="w-full rounded-xl border border-gray-200 px-3.5 py-3 pl-11 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100" />
          </div>
          {error && <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {success && <div className="flex items-start gap-2 rounded-xl border border-lime-100 bg-lime-50 p-3 text-xs font-semibold text-lime-800"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white disabled:cursor-wait disabled:opacity-70">{loading ? "Sending code..." : "Send OTP"}<ArrowRight className="h-5 w-5" /></button>
        </form>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950"><ArrowLeft className="h-4 w-4" /> Back to Login</Link>
      </section>
    </main>
  );
}

export default ForgotPassword;