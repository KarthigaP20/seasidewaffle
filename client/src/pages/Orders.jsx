import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../apiConfig";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");

    // Decode token to get current user info
    const payload = JSON.parse(atob(token.split(".")[1]));
    setCurrentUser({ name: payload.name, email: payload.email });
  }, [token, navigate]);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      const res = await fetch(`${API_BASE}/api/orders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      // Ensure shippingAddress has full fallback info
      const formattedData = data.map((order) => {
        const sa = order.shippingAddress || {};
        const ua = order.user?.address || {};
        return {
          ...order,
          shippingAddress: {
            name: sa.name || order.user?.name || currentUser?.name || "",
            phone: sa.phone || order.user?.phone || "",
            address: sa.address || ua.line1 || "",
            city: sa.city || ua.city || "",
            state: sa.state || ua.state || "",
            pincode: sa.pincode || ua.pincode || "",
            country: sa.country || ua.country || "",
          },
        };
      });

      setOrders(formattedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  });

  if (loading)
    return <p className="p-8 text-center text-gray-700">Loading orders...</p>;
  if (error) return <p className="p-8 text-center text-rose-600">{error}</p>;
  if (!orders.length)
    return <p className="p-8 text-center text-gray-700">No orders found.</p>;

  return (
    <div className="min-h-screen bg-[#f0deb7] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
          My Orders
        </h1>
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#fff8e7] p-6 rounded-2xl border border-yellow-800 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-gray-900">
                  Order ID: <span className="font-normal">{order._id}</span>
                </p>
                <p className="font-bold text-gray-900">
                  Total:{" "}
                  <span className="font-normal">₹{order.totalPrice}</span>
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800">Shipping Info:</p>
                <p className="text-gray-700">
                  {order.shippingAddress.name} | {order.shippingAddress.phone}
                  <br />
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode},{" "}
                  {order.shippingAddress.country}
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-gray-800 mb-2">Items:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center gap-3 bg-[#fff4e6] p-2 rounded-lg shadow-sm"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-white font-bold ${
                    order.deliveryStatus === "Delivered"
                      ? "bg-green-600"
                      : order.deliveryStatus === "Shipped"
                        ? "bg-yellow-800"
                        : order.deliveryStatus === "Out for Delivery"
                          ? "bg-blue-600"
                          : "bg-gray-500"
                  }`}
                >
                  {order.deliveryStatus || "Pending"}
                </span>
                <button
                  className="ml-auto px-4 py-1 bg-yellow-800 text-white rounded-xl hover:bg-yellow-900 transition"
                  onClick={() =>
                    alert(
                      `Your order is currently: ${order.deliveryStatus || "Pending"}`
                    )
                  }
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
