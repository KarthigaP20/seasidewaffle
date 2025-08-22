import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, showToast }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleAddToCart = async () => {
    if (!token) return navigate("/login");

    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: product._id }),
      });
      const data = await res.json();

      if (data.message === "exists") {
        navigate("/cart"); // Redirect if already in cart
      } else {
        if (showToast) showToast(`${product.name} added to cart!`);
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to add item to cart.");
    }
  };
  const handleOrderNow = () => {
    if (!token) {
      // Redirect to login, pass state to remember product for checkout
      navigate("/login", {
        state: { from: `/checkout/${product._id}`, product },
      });
      return;
    }

    navigate(`/checkout/${product._id}`, { state: { product } });
  };

  return (
    <div className="relative border rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="font-bold mt-2">{product.name}</h3>
      <p className="text-gray-600 mt-1">₹{product.price}</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 px-4 py-2 rounded font-bold bg-yellow-400 hover:bg-yellow-500 text-gray-900"
        >
          Add to Cart
        </button>
        <button
          onClick={handleOrderNow}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}
