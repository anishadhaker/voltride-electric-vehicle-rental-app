import { Battery, MapPin, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

function VehicleCard({ vehicle }) {
  const vehicleId =
    vehicle.id || vehicle.name.toLowerCase().replaceAll(" ", "-");
  const price = vehicle.pricePerHour || vehicle.price || 59;

  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">
              {vehicle.type}
            </span>
            {vehicle.availability && (
              <span className="rounded-full bg-lime-400 px-2.5 py-1 text-[11px] font-extrabold text-gray-950 shadow-sm">
                {vehicle.availability}
              </span>
            )}
          </div>

          {vehicle.brand && (
            <span className="absolute right-4 top-4 rounded-full bg-gray-950/80 backdrop-blur-xs px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              {vehicle.brand}
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-950">{vehicle.name}</h3>

              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 text-lime-600 shrink-0" />
                <span>{vehicle.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-900">
                {vehicle.rating}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-gray-50 p-2.5">
              <div className="flex items-center gap-1.5">
                <Battery className="h-3.5 w-3.5 text-lime-600" />
                <span className="text-[11px] font-medium text-gray-500">Battery</span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-950">{vehicle.battery}%</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-lime-600" />
                <span className="text-[11px] font-medium text-gray-500">Range</span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-950">{vehicle.range} km</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-xl font-extrabold text-gray-950">₹{price}</span>
            <span className="text-xs text-gray-500"> / hour</span>
          </div>

          <Link
            to={`/vehicle/${vehicleId}`}
            className="rounded-full bg-gray-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-lime-500 hover:text-black"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VehicleCard;