import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AlertCircle, BarChart3, Bike, CalendarDays, LayoutDashboard, Loader2, Plus, Users } from "lucide-react";
import { adminAPI } from "../services/api";

const sections = [
  ["/admin/dashboard", "Dashboard", LayoutDashboard],
  ["/admin/vehicles", "Vehicles", Bike],
  ["/admin/bookings", "Bookings", CalendarDays],
  ["/admin/users", "Users", Users],
  ["/admin/analytics", "Analytics", BarChart3],
];

function Admin() {
  const location = useLocation();
  const section = location.pathname === "/admin" || location.pathname === "/admin/" ? "dashboard" : location.pathname.split("/").pop();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ name: "", brand: "", model: "", type: "Electric Scooter", registrationNumber: "", image: "", location: "", battery: 100, range: 0, topSpeed: 0, chargingTime: "", pricePerHour: 0, pricePerDay: 0 });

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

  const createVehicle = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await adminAPI.createVehicle({ ...vehicleForm, battery: Number(vehicleForm.battery), range: Number(vehicleForm.range), topSpeed: Number(vehicleForm.topSpeed), pricePerHour: Number(vehicleForm.pricePerHour), pricePerDay: Number(vehicleForm.pricePerDay) });
      setShowForm(false);
      await loadSection();
    } catch (requestError) {
      setError(requestError.message || "Unable to create vehicle.");
    }
  };

  const rows = data?.data || [];
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
              <button type="button" onClick={() => setShowForm(!showForm)} className="flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-bold text-white">
                <Plus className="h-4 w-4" /> Add vehicle
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {showForm && section === "vehicles" && (
            <form onSubmit={createVehicle} className="mt-6 grid gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:grid-cols-2">
              {Object.entries(vehicleForm).map(([field, value]) => (
                <label key={field} className="text-xs font-bold capitalize text-gray-700">
                  {field.replace(/([A-Z])/g, " $1")}
                  <input
                    required={!['image', 'battery', 'range', 'topSpeed', 'pricePerHour', 'pricePerDay'].includes(field)}
                    type={typeof value === "number" ? "number" : "text"}
                    value={value}
                    onChange={(event) => setVehicleForm({ ...vehicleForm, [field]: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-lime-500"
                  />
                </label>
              ))}
              <button type="submit" className="rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-gray-950 sm:col-span-2">Create vehicle</button>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((item) => (
                    <tr key={item._id}>
                      <td className="px-5 py-4 font-bold text-gray-950">{item.name}</td>
                      <td className="px-5 py-4 text-gray-600">{item.location}</td>
                      <td className="px-5 py-4 font-semibold text-lime-700">{item.status}</td>
                      <td className="px-5 py-4 text-gray-600">₹{item.pricePerDay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No vehicles found.</p>}
            </div>
          ) : section === "bookings" ? (
            <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Booking</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((item) => (
                    <tr key={item._id || item.bookingId}>
                      <td className="px-5 py-4 font-bold text-gray-950">{item.bookingId || item._id}</td>
                      <td className="px-5 py-4 text-gray-600">{item.user?.name || item.customerName || "Unknown"}</td>
                      <td className="px-5 py-4 text-gray-600">{item.vehicle?.name || item.vehicleName || "Unknown"}</td>
                      <td className="px-5 py-4 font-semibold text-lime-700">{item.bookingStatus || item.status || "-"}</td>
                      <td className="px-5 py-4 text-gray-600">₹{item.totalAmount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No bookings found.</p>}
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
