import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  // Calculate password strength score (0 to 4)
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-600" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
      case 3:
        return { score: 3, label: "Good", color: "bg-lime-500", text: "text-lime-700" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-700" };
      default:
        return { score: 0, label: "", color: "", text: "" };
    }
  };

  const strength = calculateStrength(form.password);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Please enter a valid full name.";
    }

    if (!form.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(form.mobile.trim())) {
      nextErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters long.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.terms) {
      nextErrors.terms = "You must agree to the Terms & Conditions to register.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      // Simulate account registration
      setTimeout(() => {
        setLoading(false);
        setCreated(true);
        // Save mock profile in localStorage for continuity
        try {
          const userPayload = {
            name: form.name.trim(),
            mobile: `+91 ${form.mobile.slice(0, 5)} ${form.mobile.slice(5)}`,
            email: form.email.trim().toLowerCase(),
            dob: "01 Jan 2000",
            gender: "Not specified",
            address: "Phagwara, Punjab",
          };
          localStorage.setItem("voltride_demo_user", JSON.stringify(userPayload));
        } catch {
          // ignore localStorage issues in sandbox
        }
      }, 700);
    }
  };

  // SUCCESS STATE VIEW
  if (created) {
    return (
      <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#f8faf9] px-6 py-20 lg:px-8">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 sm:p-12">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-100 ring-8 ring-lime-50">
            <CheckCircle2 className="h-10 w-10 text-lime-600" />
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-xs font-bold text-gray-950">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
          </div>

          <p className="mt-6 text-xs font-bold tracking-widest text-lime-600 uppercase">
            Account Created
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Welcome to VoltRide!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Your VoltRide account for <span className="font-semibold text-gray-800">{form.name}</span> has been created successfully. You can now log in and explore electric rides.
          </p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left text-xs text-gray-600 space-y-1.5 border border-gray-100">
            <p className="flex justify-between">
              <span className="text-gray-400">Mobile:</span>
              <span className="font-medium text-gray-900">+91 {form.mobile}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="font-medium text-gray-900">{form.email}</span>
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-lime-500 hover:text-gray-950"
            >
              Continue to Login <ArrowRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  // REGISTRATION FORM VIEW
  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#f8faf9] px-6 py-20 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 transition hover:opacity-80">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 shadow-sm shadow-lime-400/30">
              <Zap className="h-7 w-7 fill-black text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-950">
              Volt<span className="text-lime-600">Ride</span>
            </span>
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Join VoltRide for eco-friendly, effortless urban mobility.
          </p>
        </div>

        {/* Form Card */}
        <section className="rounded-3xl bg-white p-7 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative mt-2">
                <User className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Anisha Sharma"
                  className={`w-full rounded-xl border px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                    errors.name ? "border-red-300 bg-red-50/20" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Mobile Number with +91 Country Code */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700">
                Mobile Number
              </label>
              <div className="mt-2 flex">
                <span className="flex items-center gap-1 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3.5 text-sm font-semibold text-gray-700 select-none">
                  🇮🇳 +91
                </span>
                <div className="relative flex-1">
                  <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, ""))}
                    placeholder="90798 72848"
                    className={`w-full rounded-r-xl border px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                      errors.mobile ? "border-red-300 bg-red-50/20" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>
              {errors.mobile && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full rounded-xl border px-3.5 py-3 pl-11 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                    errors.email ? "border-red-300 bg-red-50/20" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a strong password"
                  className={`w-full rounded-xl border px-11 py-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                    errors.password ? "border-red-300 bg-red-50/20" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Password strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          strength.score >= step ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Use 8+ characters, mixed case letters, numbers & symbols.
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-xl border px-11 py-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-100 ${
                    errors.confirmPassword ? "border-red-300 bg-red-50/20" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => updateField("terms", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-lime-500 transition focus:ring-lime-400"
                />
                <span className="text-xs leading-relaxed text-gray-600">
                  I agree to the{" "}
                  <span className="font-semibold text-gray-900 underline underline-offset-2">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-gray-900 underline underline-offset-2">
                    Privacy Policy
                  </span>{" "}
                  for electric vehicle rentals.
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-lime-500 hover:text-gray-950 disabled:cursor-wait disabled:opacity-75"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-bold text-gray-950 underline underline-offset-4 hover:text-lime-600"
              >
                Log in
              </button>
            </p>
          </div>
        </section>

        {/* Security Assurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4 text-lime-600" />
          <span>256-bit SSL encrypted & secure EV rental registration</span>
        </div>
      </div>
    </main>
  );
}

export default Register;

