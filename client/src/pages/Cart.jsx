import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
  }, [token, navigate]);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  },[token]);

  // Update quantity
  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qty: newQty }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");

      setCart((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, qty: newQty } : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to remove item");

      setCart((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  if (loading)
    return <p className="p-8 text-center text-gray-700">Loading cart...</p>;
  if (error)
    return <p className="p-8 text-center text-rose-600">{error}</p>;
  if (!cart.length)
    return <p className="p-8 text-center text-gray-700">Your cart is empty.</p>;

  return (
    <div className="min-h-screen bg-[#faeed8] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Your Cart</h1>

        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-center bg-[#fff8e7] p-4 rounded-2xl border border-yellow-800 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name || "Product"}
                  className="w-24 h-24 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-gray-700 mt-1">
                    ₹{item.price || 0} × {item.qty || 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <button
                  onClick={() =>
                    updateQuantity(item.id, (item.qty || 1) - 1)
                  }
                  className="px-3 py-1 bg-yellow-800 text-white font-bold rounded-lg hover:bg-yellow-900 transition"
                >
                  -
                </button>
                <span className="text-lg font-semibold text-gray-900">
                  {item.qty || 1}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.id, (item.qty || 1) + 1)
                  }
                  className="px-3 py-1 bg-yellow-800 text-white font-bold rounded-lg hover:bg-yellow-900 transition"
                >
                  +
                </button>
                <p className="font-bold text-gray-900">
                  ₹{(item.price || 0) * (item.qty || 1)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="px-3 py-1 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-[#fff8e7] p-4 rounded-2xl border border-yellow-800 shadow-sm">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-2xl font-extrabold text-gray-900 mt-2 sm:mt-0">
            ₹{total}
          </span>
        </div>

        <button
          className="mt-6 w-full sm:w-auto bg-yellow-800 hover:bg-yellow-900 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105"
          onClick={() =>
            navigate("/checkout", {
              state: { cart, total },
            })
          }
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
