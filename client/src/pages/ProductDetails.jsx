import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [p, setP] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [err, setErr] = useState("");
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");

  const token = localStorage.getItem("token");

  // Check if product is already in cart
  useEffect(() => {
    if (!token) return;
    const checkCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const exists = data.some((item) => item.id === (p?._id || p?.id));
        if (exists) setAdded(true);
      } catch (err) {
        console.error(err);
      }
    };
    checkCart();
  }, [token, p]);

  // Fetch product if not passed via state
  useEffect(() => {
    if (p) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        if (data.ingredients) {
          data.ingredients = Array.isArray(data.ingredients)
            ? data.ingredients
            : data.ingredients.split(",").map((item) => item.trim());
        }
        setP(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, p]);

  // --- FIXED Add to Cart logic ---
  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login", { state: { message: "Please signup/login first." } });
      return;
    }

    try {
      // Fetch current cart
      const cartRes = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await cartRes.json();
      const existingItem = cartData.find((item) => item.id === p._id);

      if (existingItem) {
        // If item already exists, just redirect to cart
        setAdded(true);
        navigate("/cart");
        return;
      }

      // Add new item with selected quantity
      const addRes = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: p._id, qty: quantity }),
      });
      if (!addRes.ok) {
        const data = await addRes.json();
        throw new Error(data.message || "Failed to add to cart");
      }

      setAdded(true);
      alert(`${p.name} (${quantity}) added to cart`);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleOrder = () => {
    if (!token) {
      navigate("/login", { state: { from: `/checkout/${p._id}`, product: p } });
      return;
    }
    navigate(`/checkout/${p._id}`, {
      state: {
        cart: [{ ...p, qty: quantity }],
        total: p.price * quantity,
      },
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-700">Loading...</div>;
  if (err) return <div className="p-8 text-center text-rose-600">{err}</div>;
  if (!p) return null;

  return (
    <div className="min-h-screen bg-[#f0deb7] px-6 py-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="rounded-2xl overflow-hidden bg-[#fff8e7] border border-yellow-800 p-4 transform transition hover:scale-105">
          <img src={p.image} alt={p.name} className="w-full h-full object-contain rounded-xl" />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-yellow-900 font-semibold mb-2">{p.category || "Other"}</p>
            <h1 className="text-4xl font-extrabold text-gray-900">{p.name}</h1>
            <p className="mt-3 text-gray-700 text-lg">{p.description || "Freshly prepared and delicious."}</p>

            <div className="mt-4 text-gray-800 space-y-1">
              {p.size && <p>Size / Weight: <span className="font-semibold">{p.size}</span></p>}
              {p.ingredients && (
                <p>
                  Ingredients: <span className="font-semibold">{p.ingredients.join(", ")}</span>
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center gap-6">
              <p className="text-3xl font-extrabold text-gray-900">₹{p.price * quantity}</p>
              <div className="flex items-center border border-yellow-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-yellow-800 text-white font-bold hover:bg-yellow-900 transition"
                >
                  -
                </button>
                <span className="px-4 py-2 bg-[#fff8e7] text-gray-900 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 bg-yellow-800 text-white font-bold hover:bg-yellow-900 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-4 border-b border-yellow-800">
              <button
                onClick={() => setTab("description")}
                className={`py-2 px-4 font-semibold ${tab === "description" ? "border-b-2 border-yellow-800" : ""}`}
              >
                Description
              </button>
              <button
                onClick={() => setTab("ingredients")}
                className={`py-2 px-4 font-semibold ${tab === "ingredients" ? "border-b-2 border-yellow-800" : ""}`}
              >
                Ingredients
              </button>
            </div>
            <div className="mt-3 text-gray-700">
              {tab === "description" && <p>{p.description || "No description available."}</p>}
              {tab === "ingredients" && (
  <ul className="list-disc list-inside">
    {p.ingredients?.length
      ? p.ingredients.map((item, idx) => <li key={idx}>{item}</li>)
      : <li>No ingredients listed.</li>}
  </ul>
)}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {!added ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-yellow-800 hover:bg-yellow-700 text-gray-900 font-bold py-3 rounded-xl transition transform hover:scale-105"
              >
                Add to Cart
              </button>
            ) : (
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 bg-yellow-800 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
              >
                Go to Cart
              </button>
            )}
            <button
              onClick={handleOrder}
              className="flex-1 bg-yellow-900 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105"
            >
              Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
