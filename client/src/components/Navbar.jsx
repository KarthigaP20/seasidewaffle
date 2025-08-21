import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaClipboardList, FaShoppingCart, FaSignInAlt, FaUser, FaBox, FaHeart, FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef(null);

  const readStoredUser = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : { name: String(parsed) };
    } catch {
      return { name: raw };
    }
  };

  const readStoredToken = () => {
    const t = localStorage.getItem("token");
    if (!t || t === "null" || t === "undefined") return null;
    return t;
  };

  const syncFromStorage = () => {
    const token = readStoredToken();
    setLoggedIn(Boolean(token));
    setUser(readStoredUser());
  };

  useEffect(() => {
    syncFromStorage();
    const onStorage = () => syncFromStorage();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const goToCart = () => {
    if (!readStoredToken()) {
      navigate("/login", { state: { message: "Please login to access your cart." } });
      return;
    }
    navigate("/cart");
  };

  const goToLogin = () => navigate("/login");

  const getDisplayName = () => {
    if (!user) return "Account";
    return user.name || user.email || user.id || "Account";
  };

  return (
<nav className="bg-[#fee8c0]/70 backdrop-blur sticky top-0 z-50 border-b shadow">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Sea Side Waffle" className="h-10 w-10 object-contain" />
          <span className="text-lg md:text-xl font-extrabold">Sea Side Waffle</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 ">
          <Link to="/menu" className="flex items-center gap-2 hover:text-yellow-700">
            <FaClipboardList /> <span>Menu</span>
          </Link>

          <button onClick={goToCart} className="flex items-center gap-2 hover:text-yellow-700">
            <FaShoppingCart /> <span>Cart</span>
          </button>

          {!loggedIn ? (
            <button onClick={goToLogin} className="flex items-center gap-2 hover:text-yellow-700">
              <FaSignInAlt /> <span>Login</span>
            </button>
          ) : (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 hover:text-yellow-700"
              >
                <FaUser /> <span>{getDisplayName()}</span>
              </button>

              {accountOpen && (
                <div className="absolute items-center right-0 mt-2 w-56 rounded-xl border bg-[#f3d59b] shadow-lg overflow-hidden ">
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <FaUser /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/orders");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <FaBox /> My Orders
                  </button>
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/favourites");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <FaHeart /> My Favourites
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-700 flex items-center gap-2 text-rose-600"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile dropdown menu (inline under navbar) */}
      {menuOpen && (
<div className="md:hidden absolute right-4 mt-2 border bg-[#f3d59b] w-fit rounded-lg shadow-lg">

          <div className="px-4 py-3 flex flex-col gap-3 ">
            <Link to="/menu" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <FaClipboardList /> Menu
            </Link>

            <button
              onClick={() => {
                setMenuOpen(false);
                goToCart();
              }}
              className="flex items-center gap-2"
            >
              <FaShoppingCart /> Cart
            </button>

            {!loggedIn ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  goToLogin();
                }}
                className="flex items-center gap-2"
              >
                <FaSignInAlt /> Login
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-2"
                >
                  <FaUser /> My Profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/orders");
                  }}
                  className="flex items-center gap-2"
                >
                  <FaBox /> My Orders
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/favourites");
                  }}
                  className="flex items-center gap-2"
                >
                  <FaHeart /> My Favourites
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 text-rose-600"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
