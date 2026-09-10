import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  GraduationCap,
  Home as HomeIcon,
  IndianRupee,
  KeyRound,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI, bookingAPI } from "../services/api";

const INITIAL_LOCATIONS = [];

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [apiRides, setApiRides] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [profile, setProfile] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    dob: user?.dob || "",
    gender: user?.gender || "Prefer not to say",
    address: user?.address || "",
    profileImage: user?.profileImage || "",
    memberSince: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Recent Rider",
  }));

  useEffect(() => {
    let isMounted = true;

    // Fetch fresh profile from backend API
    authAPI
      .getProfile()
      .then((res) => {
        const u = res?.data?.data || res?.data || res;
        if (isMounted && u && typeof u === "object") {
          setProfile((prev) => ({
            ...prev,
            name: u.name ?? prev.name,
            email: u.email ?? prev.email,
            mobile: u.mobile ?? prev.mobile,
            dob: u.dob !== undefined ? u.dob : prev.dob,
            address: u.address !== undefined ? u.address : prev.address,
            profileImage: u.profileImage !== undefined ? u.profileImage : prev.profileImage,
            memberSince: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : prev.memberSince,
          }));
        }
      })
      .catch(() => setLoadError("Unable to refresh your profile right now."));

    // Fetch real rides from backend API
    bookingAPI
      .getMyBookings()
      .then((res) => {
        const rawList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];

        if (isMounted) {
          const confirmedOnly = rawList.filter(
            (b) => b.bookingStatus !== "pending_payment" && (b.paymentStatus === "Paid" || b.bookingStatus === "Cancelled")
          );
          const mapped = confirmedOnly.map((b) => ({
            id: b.bookingId || b._id,
            vehicleName: b.vehicle?.name || "Electric Vehicle",
            vehicleType: b.vehicle?.type || "EV",
            vehicleImage: b.vehicle?.image || "",
            pickupLocation: b.pickupLocation || b.vehicle?.location || "VoltRide Hub",
            pickupDate: new Date(b.pickupDateTime).toLocaleDateString(),
            rentalHours: b.duration,
            totalAmount: (Number(b.rentalPrice) || 0) + (Number(b.serviceFee) || 0) + (Number(b.taxes) || 0),
            status: b.bookingStatus,
            paymentStatus: b.paymentStatus,
          }));
          setApiRides(mapped);
        }
      })
      .catch(() => setLoadError("Unable to load your ride history right now."));

    bookingAPI
      .getMyStats()
      .then((res) => {
        const stats = res?.data || res;
        if (isMounted && stats) setApiStats(stats);
      })
      .catch(() => setLoadError("Unable to load your ride statistics right now."));

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedRides = apiRides ?? [];
  const totalRides = displayedRides.length;
  const co2SavedKg = Math.round(totalRides * 4.2 * 10) / 10;

  const statsData = [
    { label: "Total Rides", value: String(apiStats?.totalRides ?? 0), icon: Bike, hint: "All-time bookings" },
    { label: "Upcoming Rides", value: String(apiStats?.upcomingRides ?? 0), icon: Clock3, hint: "Ready to ride" },
    { label: "Active Rides", value: String(apiStats?.activeRides ?? 0), icon: Zap, hint: "Currently active" },
    { label: "Completed Rides", value: String(apiStats?.completedRides ?? 0), icon: CheckCircle2, hint: "Safe returns" },
    { label: "Cancelled Rides", value: String(apiStats?.cancelledRides ?? 0), icon: X, hint: "Cancelled bookings" },
    { label: "Total Amount Spent", value: `₹${(apiStats?.totalAmountSpent ?? 0).toLocaleString()}`, icon: IndianRupee, hint: "Clean energy cost" },
    { label: "CO₂ Saved", value: `${co2SavedKg} kg`, icon: Leaf, hint: "Green impact" },
  ];

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [editErrors, setEditErrors] = useState({});

  // Saved locations
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [addLocationModalOpen, setAddLocationModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ title: "", address: "" });
  const [locationError, setLocationError] = useState("");

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    locationServices: true,
  });

  // Security modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Logout confirmation modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Sync draft when opening edit
  const openEditModal = () => {
    setDraftProfile({
      name: profile.name || "",
      mobile: profile.mobile || "",
      email: profile.email || "",
      dob: profile.dob || "",
      gender: profile.gender || "Prefer not to say",
      address: profile.address || "",
      profileImage: profile.profileImage || "",
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    const trimmedName = draftProfile.name?.trim() || "";
    const trimmedMobile = draftProfile.mobile?.trim() || "";
    const trimmedEmail = draftProfile.email?.trim() || "";
    const cleanMobile = trimmedMobile.replace(/\D/g, "");

    if (!trimmedName) {
      errors.name = "Name cannot be empty.";
    }

    if (!trimmedMobile) {
      errors.mobile = "Mobile number cannot be empty.";
    } else if (cleanMobile.length < 10) {
      errors.mobile = "Please provide a valid mobile number with at least 10 digits.";
    }

    if (!trimmedEmail) {
      errors.email = "Email cannot be empty.";
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = "Please provide a valid email address.";
      }
    }

    if (draftProfile.dob) {
      const selectedDate = new Date(draftProfile.dob);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(selectedDate.getTime()) || selectedDate > today) {
        errors.dob = "Date of birth cannot be in the future.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      const payload = {
        name: trimmedName,
        mobile: trimmedMobile,
        email: trimmedEmail,
        dob: draftProfile.dob ? draftProfile.dob.trim() : "",
        address: draftProfile.address ? draftProfile.address.trim() : "",
        profileImage: draftProfile.profileImage ? draftProfile.profileImage.trim() : "",
      };

      const res = await authAPI.updateProfile(payload);
      const updatedData = res?.data?.data || res?.data || res;

      if (updatedData && typeof updatedData === "object") {
        updateUser(updatedData);
        setProfile((prev) => ({
          ...prev,
          ...updatedData,
          gender: draftProfile.gender,
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          ...payload,
          gender: draftProfile.gender,
        }));
      }

      setEditModalOpen(false);
      showToast("Profile details updated successfully!");
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.message || apiErr.message || "Failed to update profile";
      setEditErrors({ api: errMsg });
    }
  };

  const handleToggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Add Location
  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocation.title.trim() || !newLocation.address.trim()) {
      setLocationError("Please enter both location name and address.");
      return;
    }
    const newEntry = {
      id: `loc-${Date.now()}`,
      title: newLocation.title.trim(),
      address: newLocation.address.trim(),
      isDefault: false,
      icon: "custom",
    };
    setLocations((prev) => [...prev, newEntry]);
    setNewLocation({ title: "", address: "" });
    setLocationError("");
    setAddLocationModalOpen(false);
    showToast(`Added "${newEntry.title}" to saved locations.`);
  };

  const handleDeleteLocation = (id) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    showToast("Location removed.");
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.current) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must contain at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPassword,
      });
      setPasswordModalOpen(false);
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
      setPasswordError("");
      showToast("Password changed successfully!");
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || "Failed to update password");
    }
  };

  // Logout handler
  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
    navigate("/login");
  };

  // Initials for avatar
  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VR";

  return (
    <main className="min-h-screen bg-[#f8faf9] px-6 pb-28 pt-32 lg:px-8">
      {loadError && (
        <div className="mx-auto mb-6 max-w-7xl rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-5 w-5 text-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-lime-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
              Verified VoltRide Account
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              User Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your credentials, ride statistics, saved locations, and account preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-500 hover:text-gray-950"
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </button>
        </div>

        {/* PROFILE HEADER CARD */}
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Profile Avatar */}
              <div className="relative flex-shrink-0">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name || "Profile avatar"}
                    className="h-24 w-24 rounded-3xl object-cover shadow-md ring-4 ring-lime-100"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-lime-400 text-3xl font-extrabold text-gray-950 shadow-md ring-4 ring-lime-100">
                    {initials}
                  </div>
                )}
                <span
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-950 text-white shadow"
                  title="KYC Verified Rider"
                >
                  <ShieldCheck className="h-4 w-4 text-lime-400" />
                </span>
              </div>

              {/* User Header Details */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                    {profile.name || "VoltRide Rider"}
                  </h2>
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-800">
                    Active Rider
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-lime-600" />
                    {profile.mobile || "Not provided"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-lime-600" />
                    {profile.email || "Not provided"}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-lime-600" />
                    {profile.address && profile.address.trim()
                      ? profile.address.split(",")[0].trim() || profile.address
                      : "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0">
              <span className="text-xs text-gray-400">Member since</span>
              <span className="text-sm font-semibold text-gray-800">{profile.memberSince}</span>
            </div>
          </div>
        </section>

        {/* RIDE STATISTICS */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-950">Ride Statistics</h2>
            <span className="text-xs font-medium text-gray-500">Live summary</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {statsData.map(({ label, value, icon: Icon, hint }) => (
              <div
                key={label}
                className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-lime-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-50 text-lime-700 transition group-hover:bg-lime-400 group-hover:text-gray-950">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-800">{label}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN 2-COLUMN SECTION: (Personal Info + Recent Rides) & (Saved Locations + Payment + Settings) */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* PERSONAL INFORMATION CARD */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">Personal Information</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Your personal profile records for bookings and insurance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-lime-500 hover:text-lime-700"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Info
                </button>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100/80">
                  <span className="text-xs font-medium text-gray-400">Full Name</span>
                  <p className="mt-1 font-semibold text-gray-900">{profile.name || "Not provided"}</p>
                </div>

                <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100/80">
                  <span className="text-xs font-medium text-gray-400">Mobile Number</span>
                  <p className="mt-1 font-semibold text-gray-900">{profile.mobile || "Not provided"}</p>
                </div>

                <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100/80">
                  <span className="text-xs font-medium text-gray-400">Email Address</span>
                  <p className="mt-1 font-semibold text-gray-900 break-all">{profile.email || "Not provided"}</p>
                </div>

                <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100/80">
                  <span className="text-xs font-medium text-gray-400">Date of Birth</span>
                  <p className="mt-1 font-semibold text-gray-900">
                    {profile.dob && profile.dob.trim() ? profile.dob : "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100/80">
                  <span className="text-xs font-medium text-gray-400">Gender</span>
                  <p className="mt-1 font-semibold text-gray-900">
                    {profile.gender && profile.gender.trim() ? profile.gender : "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100/80 sm:col-span-2">
                  <span className="text-xs font-medium text-gray-400">Current Address</span>
                  <p className="mt-1 font-semibold text-gray-900 leading-relaxed">
                    {profile.address && profile.address.trim() ? profile.address : "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            {/* RECENT RIDES CARD */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">Recent Rides</h2>
                  <p className="mt-1 text-xs text-gray-500">Your latest completed green journeys</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/rides")}
                  className="flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-800"
                >
                  View full history <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-3.5">
                {displayedRides.length > 0 ? (
                  displayedRides.slice(0, 4).map((ride) => (
                    <div
                      key={ride.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gray-50/70 p-4 border border-gray-100 transition hover:bg-gray-50 hover:border-lime-200"
                    >
                      <div className="flex items-center gap-4">
                        {ride.vehicleImage ? (
                          <img
                            src={ride.vehicleImage}
                            alt={ride.vehicleName}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-800">
                            <Bike className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-950">{ride.vehicleName}</h3>
                            <span className="rounded-md bg-gray-200/80 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                              {ride.vehicleType}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              {ride.pickupLocation}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {ride.pickupDate}
                            </span>
                            <span>Duration: {ride.rentalHours} {ride.rentalHours === 1 ? "hour" : "hours"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200/60 pt-2 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end">
                        <p className="text-base font-bold text-gray-950">₹{ride.totalAmount}</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            ride.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : ride.status === "Upcoming"
                              ? "bg-lime-100 text-lime-900"
                              : ride.status === "Active"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {ride.status === "Completed" && <Check className="h-3 w-3" />}
                          {ride.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-xs text-gray-500">
                    No rides recorded yet. Book an EV to see your journey history here!
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* SAVED LOCATIONS */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-950">Saved Locations</h2>
                  <p className="mt-1 text-xs text-gray-500">Quick pickup and drop hubs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddLocationModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-bold text-gray-950 shadow-sm transition hover:bg-lime-300"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Location
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-gray-50/80 p-4 border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-xs text-lime-700">
                          {loc.title.toLowerCase() === "home" ? (
                            <HomeIcon className="h-4 w-4" />
                          ) : loc.title.toLowerCase() === "college" ? (
                            <GraduationCap className="h-4 w-4" />
                          ) : (
                            <Building className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">{loc.title}</p>
                            {loc.isDefault && (
                              <span className="rounded-md bg-lime-100 px-1.5 py-0.5 text-[10px] font-bold text-lime-800">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{loc.address}</p>
                        </div>
                      </div>

                      {!loc.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Location"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-xs text-gray-500">
                    No saved locations yet. Add hubs or places you frequently ride from!
                  </div>
                )}
              </div>
            </section>

            {/* SETTINGS (INTERACTIVE TOGGLES) */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
              <div className="border-b border-gray-100 pb-5">
                <h2 className="text-xl font-bold text-gray-950">Settings & Preferences</h2>
                <p className="mt-1 text-xs text-gray-500">Interactive application toggles</p>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    key: "notifications",
                    label: "Notifications",
                    desc: "Push alerts on ride status & vehicle unlocks",
                    icon: Zap,
                  },
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    desc: "Ride receipts and monthly green statements",
                    icon: Mail,
                  },
                  {
                    key: "smsNotifications",
                    label: "SMS Notifications",
                    desc: "Urgent OTPs and booking confirmations",
                    icon: Smartphone,
                  },
                  {
                    key: "locationServices",
                    label: "Location Services",
                    desc: "Show nearby bikes and recommended hubs",
                    icon: MapPin,
                  },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50/70 p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-xs text-lime-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>

                    {/* Custom Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings[key]}
                      onClick={() => handleToggleSetting(key)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        settings[key] ? "bg-lime-400" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          settings[key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* SECURITY ACTIONS */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
              <div className="border-b border-gray-100 pb-5">
                <h2 className="text-xl font-bold text-gray-950">Security & Session</h2>
                <p className="mt-1 text-xs text-gray-500">Control passwords and account access</p>
              </div>

              <div className="mt-6 flex flex-col gap-3.5">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left font-semibold text-gray-800 transition hover:border-lime-500 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <KeyRound className="h-5 w-5 text-lime-600" />
                    Change Password
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4 text-left font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <LogOut className="h-5 w-5 text-red-500" />
                    Log Out
                  </span>
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-6 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950">Edit Profile</h2>
                <p className="text-xs text-gray-500">Update your account information</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close edit profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4" noValidate>
              {editErrors.api && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {editErrors.api}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={draftProfile.name}
                  onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
                {editErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  value={draftProfile.mobile}
                  onChange={(e) => setDraftProfile({ ...draftProfile, mobile: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
                {editErrors.mobile && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={draftProfile.email}
                  onChange={(e) => setDraftProfile({ ...draftProfile, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
                {editErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={draftProfile.dob}
                    onChange={(e) => setDraftProfile({ ...draftProfile, dob: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                  {editErrors.dob && (
                    <p className="mt-1 text-xs text-red-600">{editErrors.dob}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">Gender</label>
                  <select
                    value={draftProfile.gender}
                    onChange={(e) => setDraftProfile({ ...draftProfile, gender: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Current Address</label>
                <textarea
                  rows={2}
                  placeholder="Enter your address (optional)"
                  value={draftProfile.address}
                  onChange={(e) => setDraftProfile({ ...draftProfile, address: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
                {editErrors.address && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Profile Photo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg (optional)"
                  value={draftProfile.profileImage}
                  onChange={(e) => setDraftProfile({ ...draftProfile, profileImage: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-lime-500 hover:text-gray-950"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {addLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-6 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-950">Add Saved Location</h2>
              <button
                type="button"
                onClick={() => {
                  setAddLocationModalOpen(false);
                  setLocationError("");
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700">Location Label</label>
                <input
                  type="text"
                  placeholder="e.g. Work, Gym, Library"
                  value={newLocation.title}
                  onChange={(e) => setNewLocation({ ...newLocation, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Street / Hub Address</label>
                <input
                  type="text"
                  placeholder="e.g. Near Model Town Fountain, Phagwara"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-lime-500"
                />
              </div>

              {locationError && <p className="text-xs text-red-600">{locationError}</p>}

              <div className="mt-6 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddLocationModalOpen(false);
                    setLocationError("");
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-lime-400 px-5 py-2 text-sm font-bold text-gray-950 hover:bg-lime-300"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-6 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-950">Change Password</h2>
              <button
                type="button"
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordError("");
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700">Current Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">New Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Confirm New Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-lime-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}

              <div className="mt-6 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPasswordError("");
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-950 px-5 py-2 text-sm font-bold text-white hover:bg-lime-500 hover:text-gray-950"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-6 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl ring-1 ring-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <LogOut className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-950">Log out of VoltRide?</h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Are you sure you want to end your session? You will be redirected to the login page.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;

