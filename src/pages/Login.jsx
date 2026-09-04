import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, MessageSquare, Phone, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUCCESS_MESSAGE = "Login successful! Welcome to VoltRide.";

function Login() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("mobile");
  const [mobile, setMobile] = useState("9079872848");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const selectMethod = (nextMethod) => {
    setMethod(nextMethod);
    setOtpSent(false);
    setOtp("");
    clearMessages();
  };

  const completeLogin = () => {
    setSuccess(SUCCESS_MESSAGE);
    window.setTimeout(() => navigate("/profile"), 700);
  };

  const sendOtp = (event) => {
    event.preventDefault();
    clearMessages();
    if (!/^\d{10}$/.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSent(true);
    setSuccess("6-digit verification code sent to your mobile device.");
  };

  const verifyOtp = (event) => {
    event.preventDefault();
    clearMessages();
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    completeLogin();
  };

  const signIn = (event) => {
    event.preventDefault();
    clearMessages();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      completeLogin();
    }, 800);
  };

  const resendOtp = () => {
    clearMessages();
    setOtp("");
    setSuccess("A new verification code has been dispatched to your mobile.");
  };

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#f8faf9] px-6 py-20 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400 shadow-sm shadow-lime-400/30">
            <Zap className="h-8 w-8 fill-black" />
          </div>
          <p className="mt-4 text-xl font-bold tracking-tight text-gray-950">
            Volt<span className="text-lime-600">Ride</span>
          </p>
        </div>

        {/* Card */}
        <section className="rounded-3xl bg-white p-7 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 sm:p-9">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to continue your VoltRide journey.</p>
          </div>

          {/* Login Mode Toggle */}
          <div className="mt-7 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => selectMethod("mobile")}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                method === "mobile"
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => selectMethod("email")}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                method === "email"
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Email & Password
            </button>
          </div>

          {method === "mobile" ? (
            <form onSubmit={otpSent ? verifyOtp : sendOtp} className="mt-6 space-y-4" noValidate>
              {!otpSent ? (
                <div>
                  <label htmlFor="mobileInput" className="block text-xs font-bold text-gray-700">
                    Mobile Number
                  </label>
                  <div className="mt-1.5 flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3.5 text-sm font-semibold text-gray-700 select-none">
                      🇮🇳 +91
                    </span>
                    <div className="relative flex-1">
                      <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        id="mobileInput"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobile}
                        onChange={(event) => {
                          setMobile(event.target.value.replace(/\D/g, ""));
                          clearMessages();
                        }}
                        placeholder="90798 72848"
                        className={`w-full rounded-r-xl border px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                          error ? "border-red-300 bg-red-50/20" : "border-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* SMS Dispatch Confirmation Notice */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/90 p-4 text-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Verification code sent to</p>
                        <p className="text-sm font-bold text-gray-950">
                          +91 {mobile.slice(0, 5)} {mobile.slice(5)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          clearMessages();
                        }}
                        className="text-xs font-bold text-lime-700 underline hover:text-black"
                      >
                        Edit Number
                      </button>
                    </div>
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600">
                      <MessageSquare className="h-3.5 w-3.5 text-lime-600" />
                      Please check your device's SMS message inbox for the 6-digit code.
                    </p>
                  </div>

                  {/* 6-Digit OTP input */}
                  <div>
                    <label htmlFor="otpInput" className="block text-xs font-bold text-gray-700">
                      Enter 6-Digit OTP from your device
                    </label>
                    <div className="relative mt-1.5">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        id="otpInput"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => {
                          setOtp(event.target.value.replace(/\D/g, ""));
                          clearMessages();
                        }}
                        placeholder="••••••"
                        className={`w-full rounded-xl border px-3.5 py-3 pl-11 text-center font-mono text-lg font-bold tracking-[0.35em] text-gray-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                          error ? "border-red-300 bg-red-50/20" : "border-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}
              {success && (
                <p className="flex items-center gap-2 rounded-xl bg-lime-50 px-4 py-3 text-xs font-semibold text-lime-800">
                  <CheckCircle2 className="h-4 w-4" /> {success}
                </p>
              )}

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white transition hover:bg-lime-500 hover:text-gray-950"
              >
                {otpSent ? (
                  <>
                    Verify & Login <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Send OTP <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {otpSent && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-xs font-semibold text-lime-700 hover:text-gray-950 underline underline-offset-2"
                  >
                    Didn't receive OTP? Generate New Code
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={signIn} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="emailInput" className="block text-xs font-bold text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="emailInput"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearMessages();
                    }}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl border px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                      error ? "border-red-300 bg-red-50/20" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="passwordInput" className="block text-xs font-bold text-gray-700">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="passwordInput"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearMessages();
                    }}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border px-11 py-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                      error ? "border-red-300 bg-red-50/20" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 rounded-lg text-gray-400 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded accent-lime-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setError("Demo hint: Use Mobile OTP or enter any 6+ character password.")}
                  className="font-semibold text-lime-700 hover:text-gray-950"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}
              {success && (
                <p className="flex items-center gap-2 rounded-xl bg-lime-50 px-4 py-3 text-xs font-semibold text-lime-800">
                  <CheckCircle2 className="h-4 w-4" /> {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white transition hover:bg-lime-500 hover:text-gray-950 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? "Signing in..." : <>Sign In <ArrowRight className="h-5 w-5" /></>}
              </button>
            </form>
          )}

          <p className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold text-gray-950 underline underline-offset-4 hover:text-lime-600"
            >
              Create account
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;

