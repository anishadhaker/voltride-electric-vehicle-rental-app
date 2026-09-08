import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AlertCircle, BarChart3, Bike, CalendarDays, Image, LayoutDashboard, Loader2, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { adminAPI } from "../services/api";

const sections = [
  ["/admin/dashboard", "Dashboard", LayoutDashboard],
  ["/admin/vehicles", "Vehicles", Bike],
  ["/admin/bookings", "Bookings", CalendarDays],
  ["/admin/users", "Users", Users],
  ["/admin/analytics", "Analytics", BarChart3],
];

const emptyVehicle = { name: "", brand: "", model: "", type: "Electric Scooter", registrationNumber: "", image: "", imagePublicId: "", location: "", battery: 100, range: 0, topSpeed: 0, chargingTime: "", pricePerHour: 0, pricePerDay: 0, rating: 4.8, status: "Available" };

function Admin() {
  const location = useLocation();
  const section = location.pathname === "/admin" || location.pathname === "/admin/" ? "dashboard" : location.pathname.split("/").pop();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [bookingTab, setBookingTab] = useState("confirmed");

  const loadSection = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = section === "dashboard"
        ? await adminAPI.getDashboard()
        : section === "vehicles"
          ? await adminAPI.getVehicles()
          : section === "bookings"
            ? await adminAPI.getBookings()
            : section === "users"
              ? await adminAPI.getUsers()
              : await adminAPI.getAnalytics();
      setData(response);
    } catch (requestError) {
      setError(requestError.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    const timer = setTimeout(() => { loadSection(); }, 0);
    return () => clearTimeout(timer);
  }, [loadSection]);

  const saveVehicle = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      let image = vehicleForm.image;
      let imagePublicId = vehicleForm.imagePublicId;
      if (selectedImage) {
        const upload = await adminAPI.uploadVehicleImage(selectedImage);
        image = upload?.imageUrl || "";
        imagePublicId = upload?.publicId || "";
      }
      if (!image) throw new Error("Please select an image before creating the vehicle.");
      const payload = { ...vehicleForm, image, imagePublicId, battery: Number(vehicleForm.battery), range: Number(vehicleForm.range), topSpeed: Number(vehicleForm.topSpeed), pricePerHour: Number(vehicleForm.pricePerHour), pricePerDay: Number(vehicleForm.pricePerDay) };
      if (editingVehicle) {
        await adminAPI.updateVehicle(editingVehicle._id, payload);
      } else {
        await adminAPI.createVehicle(payload);
      }
      setShowForm(false);
      setEditingVehicle(null);
      setSelectedImage(null);
      setImagePreview("");
      setVehicleForm(emptyVehicle);
      setSuccess(editingVehicle ? "Vehicle updated successfully." : "Vehicle created successfully.");
      await loadSection();
    } catch (requestError) {
      setError(requestError.message || "Unable to create vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  const startCreate = () => {
    setEditingVehicle(null);
    setVehicleForm(emptyVehicle);
    setSelectedImage(null);
    setImagePreview("");
    setShowForm(true);
  };

  const startEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({ ...emptyVehicle, ...vehicle });
    setSelectedImage(null);
    setImagePreview(vehicle.image || "");
    setShowForm(true);
    setError("");
  };

  const deleteVehicle = async (vehicle) => {
    if (!window.confirm(`Delete ${vehicle.name}? This cannot be undone.`)) return;
    setError("");
    setSuccess("");
    try {
      await adminAPI.deleteVehicle(vehicle._id);
      setSuccess(`${vehicle.name} deleted successfully.`);
      await loadSection();
    } catch (requestError) {
      setError(requestError.message || "Unable to delete vehicle.");
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const rows = Array.isArray(data?.data) ? data.data : [];
  const counts = data?.data?.counts || {};
  const analytics = data?.data || {};

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl bg-gray-950 p-4 text-white">
          <p className="px-3 pb-4 text-xs font-bold tracking-widest text-lime-400">OPERATIONS</p>
          <nav className="space-y-1">
            {sections.map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? "bg-lime-400 text-gray-950" : "text-gray-300 hover:bg-gray-800"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold text-lime-600">ADMINISTRATION</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight capitalize">{section}</h1>
            </div>
            {section === "vehicles" && (
              <button type="button" onClick={showForm ? () => setShowForm(false) : startCreate} className="flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-bold text-white">
                <Plus className="h-4 w-4" /> Add vehicle
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && <p className="mt-6 rounded-xl border border-lime-100 bg-lime-50 p-4 text-sm font-semibold text-lime-800">{success}</p>}

          {showForm && section === "vehicles" && (
            <form onSubmit={saveVehicle} className="mt-6 grid gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:grid-cols-2">
              {Object.entries(vehicleForm).filter(([field]) => !["image", "imagePublicId"].includes(field)).map(([field, value]) => (
                <label key={field} className="text-xs font-bold capitalize text-gray-700">
                  {field.replace(/([A-Z])/g, " $1")}
                  {field === "status" ? (
                    <select value={value} onChange={(event) => setVehicleForm({ ...vehicleForm, [field]: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-lime-500">
                      <option value="Available">Available</option><option value="Unavailable">Unavailable</option><option value="Maintenance">Maintenance</option><option value="Charging">Charging</option><option value="Offline">Offline</option><option value="Booked">Booked</option><option value="In Use">In Use</option>
                    </select>
                  ) : (
                    <input required={!['image', 'battery', 'range', 'topSpeed', 'pricePerHour', 'pricePerDay'].includes(field)} type={typeof value === "number" ? "number" : "text"} value={value} onChange={(event) => setVehicleForm({ ...vehicleForm, [field]: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-lime-500" />
                  )}
                </label>
              ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Vehicle image
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" />
                  </label>
                  {imagePreview && (
                    <div className="relative mt-3 w-fit">
                      <img src={imagePreview} alt="Selected vehicle preview" className="h-40 w-56 rounded-xl object-cover ring-1 ring-gray-200" />
                      <button type="button" onClick={removeImage} aria-label="Remove selected image" className="absolute right-2 top-2 rounded-full bg-gray-950 p-1.5 text-white"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                  {!imagePreview && <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400"><Image className="mr-2 h-4 w-4" /> No image selected</div>}
                </div>
                <button type="submit" disabled={submitting} className="rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-gray-950 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{submitting ? "Saving vehicle..." : editingVehicle ? "Save changes" : "Create vehicle"}</button>
            </form>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-500"><Loader2 className="mr-3 h-6 w-6 animate-spin text-lime-600" /> Loading admin data...</div>
          ) : section === "dashboard" ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[[counts.activeVehicles || 0, "Active vehicles"], [counts.todaysRides || 0, "Today's rides"], [counts.bookings || 0, "Total bookings"], [counts.users || 0, "Registered users"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <p className="text-4xl font-bold">{value}</p>
                  <p className="mt-2 text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          ) : section === "vehicles" ? (
            <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Price / Day</th>
                                      <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((item) => (
                    <tr key={item._id}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-12 w-16 overflow-hidden rounded-lg bg-gray-100">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-gray-400">No image</div>}</div><div><p className="font-bold text-gray-950">{item.name}</p><p className="text-xs text-gray-500">{item.type}</p></div></div></td>
                      <td className="px-5 py-4 text-gray-600">{item.location}</td>
                      <td className={`px-5 py-4 font-semibold ${item.status === "Available" ? "text-lime-700" : "text-red-600"}`}>{item.status === "Available" ? "Available" : "Unavailable"}</td>
                      <td className="px-5 py-4 text-gray-600">₹{item.pricePerDay}</td>
                      <td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-bold text-gray-700 hover:border-lime-500"><Pencil className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => deleteVehicle(item)} className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No vehicles found.</p>}
            </div>
          ) : section === "bookings" ? (
            <div>
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBookingTab("confirmed")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    bookingTab === "confirmed"
                      ? "bg-gray-950 text-white shadow-xs"
                      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Confirmed Bookings ({rows.filter((b) => b.bookingStatus !== "pending_payment" && b.paymentStatus === "Paid").length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingTab("pending")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    bookingTab === "pending"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Pending Payments (Unpaid) ({rows.filter((b) => b.bookingStatus === "pending_payment" || b.paymentStatus === "Pending").length})
                </button>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Booking Ref</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Vehicle</th>
                      <th className="px-5 py-4">Booking Status</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows
                      .filter((item) =>
                        bookingTab === "confirmed"
                          ? item.bookingStatus !== "pending_payment" && item.paymentStatus === "Paid"
                          : item.bookingStatus === "pending_payment" || item.paymentStatus === "Pending"
                      )
                      .map((item) => (
                        <tr key={item._id || item.bookingId}>
                          <td className="px-5 py-4 font-bold font-mono text-gray-950">{item.bookingId || item._id}</td>
                          <td className="px-5 py-4 text-gray-600">{item.user?.name || item.customerName || "Unknown"}</td>
                          <td className="px-5 py-4 text-gray-600">{item.vehicle?.name || item.vehicleName || "Unknown"}</td>
                          <td className="px-5 py-4 font-semibold text-gray-900">{item.bookingStatus || item.status || "-"}</td>
                          <td className="px-5 py-4">
                            {item.paymentStatus === "Paid" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-bold text-lime-900">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                                Pending Payment
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-950">₹{item.totalAmount || 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {rows.filter((item) =>
                  bookingTab === "confirmed"
                    ? item.bookingStatus !== "pending_payment" && item.paymentStatus === "Paid"
                    : item.bookingStatus === "pending_payment" || item.paymentStatus === "Pending"
                ).length === 0 && (
                  <p className="p-10 text-center text-sm text-gray-500">
                    {bookingTab === "confirmed"
                      ? "No confirmed bookings found."
                      : "No pending payment bookings found."}
                  </p>
                )}
              </div>
            </div>
          ) : section === "users" ? (
            <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Mobile</th>
                    <th className="px-5 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((item) => (
                    <tr key={item.id || item._id}>
                      <td className="px-5 py-4 font-bold text-gray-950">{item.name}</td>
                      <td className="px-5 py-4 text-gray-600">{item.email}</td>
                      <td className="px-5 py-4 text-gray-600">{item.mobile}</td>
                      <td className="px-5 py-4 font-semibold text-lime-700">{item.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No users found.</p>}
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Total Revenue", `₹${Number(analytics.totalRevenue || 0).toLocaleString("en-IN")}`],
                  ["Bookings", analytics.totalBookings || 0],
                  ["Customers", analytics.totalUsers || 0],
                  ["Vehicles", analytics.totalVehicles || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-3 text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <h2 className="text-lg font-bold text-gray-950">Bookings by Status</h2>
                  <div className="mt-4 space-y-3">
                    {Object.entries(analytics.bookingStatusCounts || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-semibold text-gray-950">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <h2 className="text-lg font-bold text-gray-950">Vehicle Status</h2>
                  <div className="mt-4 space-y-3">
                    {Object.entries(analytics.vehicleStatusCounts || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-semibold text-gray-950">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-lg font-bold text-gray-950">Most Booked Vehicles</h2>
                <div className="mt-4 space-y-3">
                  {(analytics.mostBookedVehicles || []).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-semibold text-gray-950">{item.count} bookings</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Admin;
