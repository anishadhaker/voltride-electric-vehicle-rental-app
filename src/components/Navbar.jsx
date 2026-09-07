import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, X, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const firstLetter = (user?.name?.trim()?.[0] || "U").toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 shadow-sm shadow-lime-400/30">
            <Zap className="h-6 w-6 fill-black text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-950">
            Volt<span className="text-lime-600">Ride</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium transition ${
              isActive("/") ? "font-bold text-gray-950" : "text-gray-500 hover:text-gray-950"
            }`}
          >
            Home
          </Link>

          <Link
            to="/explore"
            className={`text-sm font-medium transition ${
              isActive("/explore") ? "font-bold text-gray-950" : "text-gray-500 hover:text-gray-950"
            }`}
          >
            Explore Fleet
          </Link>

          <Link
            to="/rides"
            className={`text-sm font-medium transition ${
              isActive("/rides") ? "font-bold text-gray-950" : "text-gray-500 hover:text-gray-950"
            }`}
          >
            My Rides
          </Link>

          <Link
            to="/profile"
            className={`text-sm font-medium transition ${
              isActive("/profile") ? "font-bold text-lime-700" : "text-gray-500 hover:text-gray-950"
            }`}
          >
            Profile
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-xs font-bold text-lime-700 transition hover:text-lime-900"
                >
                  Admin Dashboard
                </Link>
              )}
              <span className="text-xs font-semibold text-gray-700 hidden lg:inline">
                Hi, {user?.name?.split(" ")[0] || "Rider"}
              </span>

              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-sm font-extrabold text-gray-950 shadow-sm ring-2 ring-lime-200 transition hover:bg-lime-300 hover:scale-105"
                title="User Profile"
              >
                {firstLetter}
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 flex items-center gap-1"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-3 py-2 text-sm font-semibold text-gray-700 transition hover:text-black"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-lime-500 hover:text-black"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive("/") ? "bg-lime-50 font-bold text-lime-800" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive("/explore") ? "bg-lime-50 font-bold text-lime-800" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Explore Fleet
            </Link>
            <Link
              to="/rides"
              onClick={closeMenu}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive("/rides") ? "bg-lime-50 font-bold text-lime-800" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              My Rides
            </Link>
            <Link
              to="/profile"
              onClick={closeMenu}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive("/profile") ? "bg-lime-50 font-bold text-lime-800" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-lime-600" /> User Profile
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-xs font-extrabold text-gray-950">
                {firstLetter}
              </span>
            </Link>

            <div className="my-1 border-t border-gray-100" />

            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="w-full rounded-xl bg-lime-50 py-3 text-center text-sm font-bold text-lime-800"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                    navigate("/login");
                  }}
                  className="w-full rounded-xl border border-red-200 py-3 text-center text-sm font-bold text-red-600 transition hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/login");
                  }}
                  className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    navigate("/register");
                  }}
                  className="w-full rounded-xl bg-gray-950 py-3 text-center text-sm font-semibold text-white transition hover:bg-lime-500 hover:text-black"
                >
                  Create Account (Get Started)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;