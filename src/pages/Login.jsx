import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [method, setMethod] = useState("mobile"); // "mobile" or "email"
  const [mobile, setMobile] = useState("9079872848");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    clearMessages();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessages();

    const identifier = method === "mobile" ? mobile.trim() : email.trim();

    if (!identifier) {
      setError(
        method === "mobile"
          ? "Please enter your mobile number."
          : "Please enter your email address."
      );
      return;
    }

    if (method === "mobile" && !/^\d{10}$/.test(identifier.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await login({
        identifier,
        password,
      });

      setSuccess("Login successful! Welcome to VoltRide.");
      const destination = location.state?.from?.pathname || "/explore";

      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to manage and reserve your electric rides.
            </p>
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
              Mobile Number
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
              Email Address
            </button>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
            {method === "mobile" ? (
              <div>
                <label
                  htmlFor="mobileInput"
                  className="block text-xs font-bold text-gray-700"
                >
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
                      className="w-full rounded-r-xl border border-gray-200 px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="emailInput"
                  className="block text-xs font-bold text-gray-700"
                >
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
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="passwordInput"
                className="block text-xs font-bold text-gray-700"
              >
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
                  className="w-full rounded-xl border border-gray-200 px-11 py-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
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

            {/* Error and Success Banners */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-lime-50 p-3.5 text-xs font-semibold text-lime-800 border border-lime-100">
                <CheckCircle2 className="h-4 w-4 text-lime-600" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white transition hover:bg-lime-500 hover:text-gray-950 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

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
