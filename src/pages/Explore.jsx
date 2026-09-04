import { useMemo, useState } from "react";
import { MapPin, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import VehicleCard from "../components/VehicleCard";

import { vehicles } from "../data/vehicles";

const initialFilters = { type: "All", maxPrice: 100, minRating: 0, minBattery: 0 };

function FilterContent({ filters, setFilters, onReset, onApply }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-bold text-gray-900">Vehicle type</p>
        <div className="space-y-2">
          {["All", "Electric Bike", "Electric Scooter"].map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
              <input type="radio" name="vehicle-type" value={type} checked={filters.type === type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} className="h-4 w-4 accent-lime-500" />
              {type}
            </label>
          ))}
        </div>
      </div>
      <label className="block text-sm font-bold text-gray-900">
        <span className="flex items-center justify-between"><span>Maximum price per hour</span><span className="font-semibold text-lime-700">₹{filters.maxPrice}</span></span>
        <input type="range" min="40" max="100" step="1" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })} className="mt-4 w-full accent-lime-500" />
      </label>
      <label className="block text-sm font-bold text-gray-900">
        Minimum rating
        <select value={filters.minRating} onChange={(event) => setFilters({ ...filters, minRating: Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal text-gray-700 outline-none focus:border-lime-500">
          <option value="0">Any rating</option><option value="4.5">4.5+ stars</option><option value="4.8">4.8+ stars</option>
        </select>
      </label>
      <label className="block text-sm font-bold text-gray-900">
        <span className="flex items-center justify-between"><span>Minimum battery</span><span className="font-semibold text-lime-700">{filters.minBattery}%</span></span>
        <input type="range" min="0" max="100" step="5" value={filters.minBattery} onChange={(event) => setFilters({ ...filters, minBattery: Number(event.target.value) })} className="mt-4 w-full accent-lime-500" />
      </label>
      <button type="button" onClick={onReset} className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-950"><RotateCcw className="h-4 w-4" /> Reset filters</button>
      {onApply && <button type="button" onClick={onApply} className="w-full rounded-xl bg-gray-950 px-4 py-3 font-semibold text-white">Show vehicles</button>}
    </div>
  );
}

function Explore() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [nearMe, setNearMe] = useState(false);

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !query ||
        `${vehicle.name} ${vehicle.brand || ""} ${vehicle.location}`
          .toLowerCase()
          .includes(query);
      const matchesNearMe =
        !nearMe || vehicle.location.toLowerCase().includes("jalandhar");
      const hourlyPrice = vehicle.pricePerHour || vehicle.price || 0;
      return (
        matchesSearch &&
        matchesNearMe &&
        (filters.type === "All" || vehicle.type === filters.type) &&
        hourlyPrice <= filters.maxPrice &&
        vehicle.rating >= filters.minRating &&
        vehicle.battery >= filters.minBattery
      );
    });
  }, [filters, nearMe, search]);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch("");
    setNearMe(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-semibold tracking-wide text-lime-600">THE VOLTRIDE FLEET</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-6xl">Find your perfect ride</h1>
        <p className="mt-5 text-lg leading-8 text-gray-500">Rent an electric bike or scooter that fits your route, budget, and pace.</p>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm focus-within:border-lime-500"><Search className="h-5 w-5 text-gray-400" /><span className="sr-only">Search vehicles</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by vehicle or location" className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" /></label>
        <button type="button" onClick={() => setNearMe(!nearMe)} className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition ${nearMe ? "border-lime-500 bg-lime-100 text-gray-950" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}><MapPin className="h-5 w-5" /> {nearMe ? "Near Jalandhar" : "Near me"}</button>
      </div>
      <div className="mt-12 flex items-center justify-between border-b border-gray-200 pb-5"><p className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{filteredVehicles.length}</span> vehicles available</p><button type="button" onClick={() => setMobileFiltersOpen(true)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 md:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button></div>
      <div className="mt-8 grid gap-10 md:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:block"><div className="mb-7 flex items-center justify-between"><h2 className="font-bold text-gray-950">Filter rides</h2><SlidersHorizontal className="h-4 w-4 text-lime-600" /></div><FilterContent filters={filters} setFilters={setFilters} onReset={resetFilters} /></aside>
        <section aria-live="polite"><div className="grid gap-6 lg:grid-cols-2">{filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>{filteredVehicles.length === 0 && <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center"><h2 className="text-xl font-bold text-gray-950">No vehicles found</h2><p className="mt-2 text-gray-500">Try adjusting your search or filters.</p><button type="button" onClick={resetFilters} className="mt-6 font-semibold text-lime-700 underline underline-offset-4">Reset filters</button></div>}</section>
      </div>
      {mobileFiltersOpen && <div className="fixed inset-0 z-[60] md:hidden"><button aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-gray-950/40" /><div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-6"><div className="mb-8 flex items-center justify-between"><h2 className="text-xl font-bold">Filter rides</h2><button type="button" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button></div><FilterContent filters={filters} setFilters={setFilters} onReset={resetFilters} onApply={() => setMobileFiltersOpen(false)} /></div></div>}
    </main>
  );
}

export default Explore;
