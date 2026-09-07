import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const EMAIL_KEY = "voltride_password_reset_email";
const TOKEN_KEY = "voltride_password_reset_token";
const COOLDOWN_SECONDS = 60;

function VerifyOtp() {
  const navigate = useNavigate();
  const [email] = useState(() => sessionStorage.getItem(EMAIL_KEY) || "");
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const verify = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyResetOtp(email, otp);
      sessionStorage.setItem(TOKEN_KEY, response.resetToken);
      navigate("/reset-password");
    } catch (requestError) {
      setError(requestError.message || "Invalid or expired reset code.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setSuccess("");
    setResending(true);
    try {
      await authAPI.forgotPassword(email);
      setSecondsLeft(600);
      setCooldown(COOLDOWN_SECONDS);
      setSuccess("A new reset code has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Unable to resend the code.");
    } finally {
      setResending(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#f8faf9] px-6 py-20 lg:px-8">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 sm:p-9">
        <div className="mb-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400"><Zap className="h-8 w-8 fill-black" /></div><h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950">Verify your code</h1><p className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-500"><Mail className="h-4 w-4" />Code sent to {email}</p></div>
        <form onSubmit={verify} className="space-y-4" noValidate>
          <label htmlFor="otp" className="block text-xs font-bold text-gray-700">6-digit OTP</label>
          <input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "")); setError(""); }} className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100" placeholder="000000" />
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500"><ShieldCheck className="h-4 w-4 text-lime-600" />Code expires in {minutes}:{seconds}</p>
          {error && <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {success && <div className="flex items-start gap-2 rounded-xl border border-lime-100 bg-lime-50 p-3 text-xs font-semibold text-lime-800"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}
          <button type="submit" disabled={loading || secondsLeft === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Verifying..." : "Verify OTP"}<ArrowRight className="h-5 w-5" /></button>
        </form>
        <button type="button" disabled={cooldown > 0 || resending} onClick={resend} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"><RefreshCw className="h-4 w-4" />{resending ? "Sending..." : cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend OTP"}</button>
        <Link to="/forgot-password" className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950"><ArrowLeft className="h-4 w-4" /> Change email</Link>
      </section>
    </main>
  );
}

export default VerifyOtp;