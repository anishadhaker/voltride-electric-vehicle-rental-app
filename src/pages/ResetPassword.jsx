import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const TOKEN_KEY = "voltride_password_reset_token";
const EMAIL_KEY = "voltride_password_reset_email";

function PasswordField({ id, value, onChange, visible, onToggle, label }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-700">{label}</label>
      <div className="relative mt-1.5">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
        <input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-200 px-11 py-3 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100" />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={onToggle} className="absolute right-3.5 top-3 rounded-lg text-gray-400 hover:text-gray-900">
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const [resetToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!resetToken) {
      setError("Your reset session is missing or expired. Please request a new code.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(resetToken, password, confirmPassword);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(EMAIL_KEY);
      setSuccess("Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (requestError) {
      setError(requestError.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#f8faf9] px-6 py-20 lg:px-8">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 sm:p-9">
        <div className="mb-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400"><Zap className="h-8 w-8 fill-black" /></div><h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950">Create a new password</h1><p className="mt-2 text-sm text-gray-500">Choose a password with at least 6 characters.</p></div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <PasswordField id="new-password" label="New Password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />
          <PasswordField id="confirm-password" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} />
          {error && <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {success && <div className="flex items-start gap-2 rounded-xl border border-lime-100 bg-lime-50 p-3 text-xs font-semibold text-lime-800"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}
          <button type="submit" disabled={loading || Boolean(success)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 font-bold text-white disabled:cursor-wait disabled:opacity-70">{loading ? "Updating password..." : "Reset Password"}<ArrowRight className="h-5 w-5" /></button>
        </form>
      </section>
    </main>
  );
}

export default ResetPassword;