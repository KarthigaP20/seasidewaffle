import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpg";
import { API_BASE } from "../apiConfig";
import About from "../components/About";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaUtensils,
  FaBoxOpen,
} from "react-icons/fa";

// Helper: decode JWT (to get user id)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // NOTE: keep existing shape but we’ll load from per-user key
  const [favs, setFavs] = useState([]);

  const navigate = useNavigate();

  // Load favourites for the currently logged-in user
  const loadFavsForCurrentUser = () => {
    const token = localStorage.getItem("token");
    const uid = token ? parseJwt(token)?.id : null;
    if (!uid) {
      setFavs([]); // not logged in -> no personal favourites
      return;
    }
    const stored = localStorage.getItem(`favourites_${uid}`);
    setFavs(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    loadFavsForCurrentUser();
    const onStorage = () => loadFavsForCurrentUser();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    (async () => {
      try {
       const res = await fetch(`${API_BASE}/api/products/featured`);
        if (!res.ok) throw new Error("Failed to load featured products");
        const data = await res.json();
        setFeatured(data.slice(0, 10));
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFav = (id) => {
    // Require login
    const token = localStorage.getItem("token");
    const uid = token ? parseJwt(token)?.id : null;

    if (!uid) {
      // Not logged in -> go to login, ask to come back to Favourites
      navigate("/login", {
        state: { redirectTo: "/Favourites" },
        replace: true,
      });
      return;
    }

    setFavs((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];

      // Store per-user
      localStorage.setItem(`favourites_${uid}`, JSON.stringify(updated));
      // (Optional compatibility: mirror to generic key so existing components relying on it still work)
      localStorage.setItem("favourites", JSON.stringify(updated));

      return updated;
    });
  };

  return (
    <div className="flex flex-col bg-[#faeed8] ">
      {/* Hero Section */}
      <section className="relative w-full bg-[#fcf3e0] overflow-hidden">
        {/* Top chocolate drip */}
        <div className="absolute top-0 w-full -translate-y-1">
          <svg
            viewBox="0 0 500 150"
            preserveAspectRatio="none"
            className="w-full h-32"
          >
            <path
              d="M0,50 C150,150 350,-50 500,50 L500,0 L0,0 Z"
              fill="#8B4513"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col-reverse md:flex-row items-center gap-10 relative">
          {/* Left Text */}
          <div className="flex flex-col md:w-1/2 space-y-6 z-20 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              <span className="block text-yellow-600">Indulge</span> in the
              Coastal Sweetness
            </h1>
            <p className="text-gray-700 md:text-lg max-w-md mx-auto md:mx-0">
              Handcrafted Belgian waffles, topped with creamy chocolate, fresh
              fruits, and a sprinkle of seaside magic. Taste happiness in every
              bite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
              {/* Modern glass style button */}
              <button
                onClick={() => navigate("/menu")}
                className="bg-yellow-400/80 backdrop-blur-md hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full shadow-lg flex items-center gap-3 transition transform hover:-translate-y-1 hover:scale-105"
              >
                <FaUtensils /> Explore Menu
              </button>

              {/* Outline alternative button */}
              <button
                onClick={() => navigate("/orders")}
                className="border-2 border-yellow-700 text-yellow-700 hover:bg-yellow-700 hover:text-white font-bold px-8 py-3 rounded-full shadow-md flex items-center gap-3 transition transform hover:-translate-y-1 hover:scale-105"
              >
                <FaBoxOpen /> Track Orders
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative md:w-1/2 w-full flex justify-center md:justify-end z-10">
            {/* Main image with rotate + clip */}
            <img
              src={heroImg}
              alt="Sea Side Waffle"
              className="rounded-[40px_0_40px_40px] shadow-2xl object-cover w-4/5 sm:w-full h-[300px] sm:h-[400px] md:h-[520px] rotate-3 md:rotate-6 -translate-y-4 md:-translate-y-8 transition-transform hover:scale-105"
            />

            {/* Floating decorative waffles */}
            <div className="absolute -top-6 -left-6 text-yellow-400 text-3xl animate-bounce">
              🧇
            </div>
            <div className="absolute bottom-8 right-8 text-yellow-500 text-4xl animate-pulse">
              🧇
            </div>
            <div className="absolute top-1/2 -right-10 text-yellow-300 text-2xl animate-bounce">
              🧇
            </div>

            {/* Floating cream blobs */}
            <div className="absolute -top-10 right-20 w-12 h-12 bg-white/80 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-16 left-10 w-16 h-16 bg-white/70 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-24 left-1/2 w-10 h-10 bg-white/60 rounded-full blur-xl animate-bounce" />
          </div>
        </div>

        {/* Chocolate wave bottom */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 500 150"
            preserveAspectRatio="none"
            className="w-full h-32"
          >
            <path
              d="M0.00,49.98 C150.00,150.00 349.95,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
              fill="#8B4513"
            ></path>
          </svg>
        </div>
      </section>

      {/* Best Products Showcase */}
      <section className="max-w-7xl mx-auto px-12 py-12 bg-[#f0deb7] rounded-xl mt-10 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Best of Sea Side Waffle
          </h2>
          <button
            onClick={() => navigate("/menu")}
            className="text-yellow-700 font-semibold hover:underline"
          >
            View Full Menu →
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-yellow-800">Loading...</p>
        ) : err ? (
          <p className="mt-6 text-rose-600">{err}</p>
        ) : (
          // Wrapper hides scrollbar
          <div className="overflow-x-hidden">
            <Slider
              items={featured}
              favs={favs}
              toggleFav={toggleFav}
              className="py-4"
            />
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/menu")}
            className="px-6 py-3 rounded-full bg-yellow-800 hover:bg-yellow-700 font-bold text-gray-900 shadow-lg transform transition hover:-translate-y-1 hover:scale-105"
          >
            See All Products
          </button>
        </div>
      </section>

        
    {/* About Section */}
    <About />
      </div>
  );
}

function Slider({ items, favs, toggleFav }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-6">
      <button
        aria-label="prev"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
        onClick={() => scroll("left")}
      >
        <FaChevronLeft size={20} />
      </button>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-10"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((p) => (
          <div
            key={p._id}
            className="relative flex-shrink-0 w-[80%] sm:w-[60%] md:w-[45%] lg:w-[30%] rounded-2xl overflow-hidden shadow border bg-white"
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
            {/* Heart Icon */}
            <button
              onClick={() => toggleFav(p._id)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:scale-110 transition"
            >
              <FaHeart
                size={20}
                className={
                  favs.includes(p._id) ? "text-red-500" : "text-gray-600"
                }
              />
            </button>
          </div>
        ))}
      </div>

      <button
        aria-label="next"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
        onClick={() => scroll("right")}
      >
        <FaChevronRight size={20} />
      </button>
    </div>
  );
}
