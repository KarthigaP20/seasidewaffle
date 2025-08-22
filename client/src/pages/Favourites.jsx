import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper: decode JWT to get user id
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

export default function Favourites() {
  const [favs, setFavs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Guard: redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = token ? parseJwt(token)?.id : null;
    if (!uid) {
      navigate("/", { replace: true });
      return;
    }
  }, [navigate]);

  // Load favourites from localStorage
  const loadFavs = () => {
    const token = localStorage.getItem("token");
    const uid = token ? parseJwt(token)?.id : null;
    if (!uid) return;
    const storedFavs = localStorage.getItem(`favourites_${uid}`);
    setFavs(storedFavs ? JSON.parse(storedFavs) : []);
  };

  useEffect(() => {
    loadFavs();
    const handleStorage = () => loadFavs();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Fetch products that are in favourites
  useEffect(() => {
    if (!favs.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const allProducts = await res.json();
        const favProducts = allProducts.filter((p) => favs.includes(p._id));
        setProducts(favProducts);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [favs]);

  if (loading)
    return (
      <p className="p-8 text-center text-gray-700">Loading favourites...</p>
    );
  if (error) return <p className="p-8 text-center text-rose-600">{error}</p>;
  if (!products.length)
    return (
      <p className="p-8 text-center text-gray-600">
        You don’t have any favourites yet.
      </p>
    );

  return (
    <div className="min-h-screen bg-[#faeed8] px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        My Favourites
      </h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-[#fff8e7] rounded-2xl shadow-md overflow-hidden border border-yellow-800 hover:scale-105 transform transition cursor-pointer"
            onClick={() =>
              navigate(`/product/${p._id}`, { state: { product: p } })
            }
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h2 className="font-bold text-lg text-gray-900">{p.name}</h2>
              <p className="text-gray-700 font-semibold">₹{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
