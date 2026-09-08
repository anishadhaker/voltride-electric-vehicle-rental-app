import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  MapPin,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

function Hero({ vehicle }) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#f5f8f4] pt-32">

      {/* Background decoration */}
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-lime-300/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 lg:grid-cols-2 lg:px-8">

        {/* LEFT */}
        <div className="relative z-10">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-lime-500" />
            Electric mobility made simple
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
            Ride smarter.
            <br />
            <span className="text-lime-500">Go electric.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
            Discover, book and ride electric bikes and scooters whenever you
            need them. Simple, affordable and better for the planet.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="group flex items-center justify-center gap-2 rounded-full bg-gray-950 px-7 py-4 font-semibold text-white transition hover:bg-lime-500 hover:text-black"
            >
              Explore vehicles
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </button>

            <a
              href="#how-it-works"
              className="flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-4 font-semibold text-gray-800 transition hover:border-gray-950"
            >
              How it works
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-lime-600" />
              Verified vehicles
            </div>

            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-lime-600" />
              Easy booking
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">

          {/* Main vehicle visual */}
          <div className="relative mx-auto max-w-xl">

            <div className="absolute inset-10 rounded-full bg-lime-300/30 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 shadow-2xl">

              {vehicle?.image ? <img src={vehicle.image} alt={vehicle.name} className="h-[480px] w-full object-cover" /> : <div className="flex h-[480px] items-center justify-center text-sm text-gray-400">Vehicle image unavailable</div>}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Battery card */}
              <div className="absolute right-5 top-5 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-5 w-5 text-lime-600" />
                  <span className="text-sm font-semibold">92%</span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Battery
                </p>
              </div>

              {/* Vehicle info */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-2xl bg-white/95 p-5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        {vehicle?.type || "Electric vehicle"}
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-gray-950">
                        {vehicle?.name || "Explore electric rides"}
                      </h3>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-gray-950">
                        ₹{vehicle?.pricePerHour || "--"}
                        <span className="text-sm font-medium text-gray-500">
                          /hr
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Booking search */}
      <div className="relative z-20 mx-auto -mb-10 max-w-6xl px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-xl">

          <div className="grid gap-3 md:grid-cols-4">

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-lime-600" />

                <div>
                  <p className="text-xs text-gray-500">
                    Pickup location
                  </p>

                  <p className="font-semibold text-gray-900">
                    Select location
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Pickup date
              </p>

              <p className="font-semibold text-gray-900">
                Today
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Vehicle type
              </p>

              <p className="font-semibold text-gray-900">
                Any vehicle
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 font-bold text-gray-950 transition hover:bg-lime-300"
            >
              <Search className="h-5 w-5" />
              Find a ride
            </button>

          </div>
        </div>
      </div>

    </section>
  );
}

export default Hero;