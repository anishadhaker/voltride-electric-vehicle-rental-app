import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import VehicleCard from "../components/VehicleCard";

import { vehicles } from "../data/vehicles";

function Home() {
  return (
    <>
      <Hero />
      <section id="vehicles" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-lime-600">OUR FLEET</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Find your perfect ride
            </h2>
            <p className="mt-4 max-w-xl text-gray-500">
              Choose from our growing collection of electric bikes and scooters,
              ready whenever you are.
            </p>
          </div>
          <Link to="/explore" className="font-semibold text-gray-900 underline underline-offset-4 hover:text-lime-700">
            View all vehicles &rarr;
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.name} vehicle={vehicle} />
          ))}
        </div>
      </section>
      <section id="how-it-works" className="bg-gray-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-lime-400">SIMPLE PROCESS</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
            Your ride is just four steps away.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              ["01", "Find", "Choose an electric vehicle near you."],
              ["02", "Book", "Select your time and confirm your ride."],
              ["03", "Unlock", "Unlock your vehicle and start riding."],
              ["04", "Ride", "Enjoy a cleaner, smarter journey."],
            ].map(([number, title, description]) => (
              <div key={number} className="border-t border-gray-700 pt-6">
                <span className="text-sm font-bold text-lime-400">{number}</span>
                <h3 className="mt-5 text-2xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="about" className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-lime-400 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-semibold text-gray-700">MOVE BETTER</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Better rides.<br />Better planet.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-gray-800">
                VoltRide makes everyday transportation cleaner by helping people
                choose electric mobility instead of traditional fuel-powered vehicles.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[["10K+", "Electric rides"], ["25K+", "CO2 kg saved"], ["4.9", "Average rating"], ["24/7", "Ride availability"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white p-6">
                  <p className="text-4xl font-bold">{value}</p>
                  <p className="mt-2 text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
