export const vehicles = [
  {
    id: "ather-450x",
    name: "Ather 450X",
    brand: "Ather Energy",
    model: "Gen 3 Pro",
    type: "Electric Scooter",
    image: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1200&q=85",
    location: "Phagwara City Hub",
    battery: 94,
    range: 111,
    topSpeed: 90,
    chargingTime: "5.4 hrs",
    pricePerHour: 59,
    pricePerDay: 999,
    rating: 4.8,
    reviews: 128,
    availability: "Available",
    about:
      "The Ather 450X is India's premier high-performance electric scooter with instant throttle response, Warp Mode acceleration, and integrated Google Maps navigation for seamless city rides.",
    specifications: {
      motor: "6.4 kW PMSM Motor",
      batteryCapacity: "3.7 kWh Lithium-ion (IP67)",
      charging: "Ather Grid Fast Charging (1.5 km/min)",
      brakes: "Combined Braking System with Regenerative Braking",
      features: "7-inch Touchscreen, Warp Mode, AutoHold, Bluetooth Music & Call Alerts",
    },
  },
  {
    id: "ola-s1-pro",
    name: "Ola S1 Pro",
    brand: "Ola Electric",
    model: "Gen 2",
    type: "Electric Scooter",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
    location: "Jalandhar Central Station",
    battery: 92,
    range: 180,
    topSpeed: 120,
    chargingTime: "6.5 hrs",
    pricePerHour: 65,
    pricePerDay: 1099,
    rating: 4.7,
    reviews: 142,
    availability: "Available",
    about:
      "The Ola S1 Pro delivers unmatched highway and urban electric performance with hyper-acceleration, cruise control, party mode with built-in speakers, and expansive under-seat boot capacity.",
    specifications: {
      motor: "11 kW Peak Power Motor",
      batteryCapacity: "4.0 kWh Lithium-ion",
      charging: "Hypercharger (50 km range in 15 mins)",
      brakes: "Front & Rear Disc Brakes with ABS",
      features: "MoveOS 4, Proximity Unlock, Cruise Control, Dual Built-in Speakers",
    },
  },
  {
    id: "tvs-iqube",
    name: "TVS iQube",
    brand: "TVS Motor",
    model: "ST Edition",
    type: "Electric Scooter",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=85",
    location: "Ludhiana Mall Road Hub",
    battery: 91,
    range: 100,
    topSpeed: 82,
    chargingTime: "4.5 hrs",
    pricePerHour: 55,
    pricePerDay: 899,
    rating: 4.7,
    reviews: 86,
    availability: "Available",
    about:
      "The TVS iQube offers a whisper-quiet, ultra-smooth and reliable commute. Engineered with legendary TVS build quality, it is the ideal daily commuter for students and professionals.",
    specifications: {
      motor: "4.4 kW BLDC Hub Motor",
      batteryCapacity: "3.4 kWh Lithium-ion",
      charging: "Home Fast Charger (80% in 4.5 hrs)",
      brakes: "Front Disc & Rear Drum with CBS",
      features: "TVS SmartXonnect, Q-Park Reverse Assist, Turn-by-Turn Navigation",
    },
  },
  {
    id: "bajaj-chetak",
    name: "Bajaj Chetak Electric",
    brand: "Bajaj Auto",
    model: "Premium 2026",
    type: "Electric Scooter",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
    location: "Phagwara University Hub",
    battery: 89,
    range: 126,
    topSpeed: 73,
    chargingTime: "4.0 hrs",
    pricePerHour: 52,
    pricePerDay: 849,
    rating: 4.6,
    reviews: 78,
    availability: "Available",
    about:
      "A modern electric rebirth of India's most beloved scooter brand. Features an all-metal steel body, horseshoe LED headlight, feather-touch switches, and dependable all-weather battery protection.",
    specifications: {
      motor: "4.2 kW Electric Motor",
      batteryCapacity: "3.2 kWh IP67 Water Resistant",
      charging: "Standard 5A Home Socket (100% in 4 hrs)",
      brakes: "Front Disc with Combined Braking System",
      features: "All-Steel Body, Horseshoe LED Headlamp, Keyless Ignition, Reverse Mode",
    },
  },
  {
    id: "revolt-rv400",
    name: "Revolt RV400",
    brand: "Revolt Motors",
    model: "BRZ Stealth Edition",
    type: "Electric Bike",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85",
    location: "Jalandhar Central Station",
    battery: 88,
    range: 150,
    topSpeed: 85,
    chargingTime: "4.5 hrs",
    pricePerHour: 69,
    pricePerDay: 1199,
    rating: 4.9,
    reviews: 115,
    availability: "Available",
    about:
      "India's leading AI-enabled electric motorcycle. Designed with sporty ergonomics, lightweight chassis, customizable digital exhaust sounds, and removable swappable battery tech.",
    specifications: {
      motor: "3.0 kW Mid-Drive Motor",
      batteryCapacity: "3.24 kWh Swappable Lithium-ion",
      charging: "0 to 100% in 4.5 hrs / Quick Battery Swap",
      brakes: "240mm Front & Rear Disc with CBS",
      features: "MyRevolt App Connectivity, Geofencing, 4 Synthetic Exhaust Sounds, Sport Mode",
    },
  },
];

export const getAllVehicles = () => vehicles;

export const getVehicleById = (id) => {
  if (!id) return null;
  const cleanId = id.toLowerCase().trim();
  return (
    vehicles.find(
      (v) =>
        v.id.toLowerCase() === cleanId ||
        v.name.toLowerCase().replaceAll(" ", "-") === cleanId
    ) || null
  );
};
