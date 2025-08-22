import { useEffect, useState,useCallback } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setCurrentUser({ name: payload.name, email: payload.email });
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      // Fill missing user/shipping info
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, currentUser]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center py-6">Loading orders...</p>;
  if (error) return <p className="text-center text-red-600 py-6">{error}</p>;

  return (
    <div className="p-6 min-h-screen bg-[#EFCC89]">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-900">
        Orders
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-yellow-800 rounded-xl shadow-lg bg-[#fff8f0] border-collapse">
          <thead>
            <tr className="bg-yellow-700 text-gray-800">
              <th className="py-3 px-4 border text-center">Order ID</th>
              <th className="py-3 px-4 border text-center">User</th>
              <th className="py-3 px-4 border text-center">Shipping Info</th>
              <th className="py-3 px-4 border text-center">Items</th>
              <th className="py-3 px-4 border text-center">Total</th>
              <th className="py-3 px-4 border text-center">Status</th>
              <th className="py-3 px-4 border text-center">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-[#fff0da] transition-all text-center"
                >
                  <td className="py-3 px-4 border">{order._id}</td>
                  <td className="py-3 px-4 border">
                    <div className="font-medium">
                      {order.user?.name || currentUser?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.user?.email || currentUser?.email}
                    </div>
                  </td>
                  <td className="py-3 px-4 border text-left">
                    <div className="font-medium">
                      {order.shippingAddress.name}
                    </div>
                    <div className="text-sm text-gray-700">
                      {order.shippingAddress.phone}
                      <br />
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode},{" "}
                      {order.shippingAddress.country}
                    </div>
                  </td>
                  {/* Items Column */}
                  <td className="py-3 px-4 border text-left align-top">
                    <ul className="space-y-2">
                      {order.orderItems?.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 flex-wrap max-w-[220px]"
                        >
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="text-sm leading-snug">
                            <p className="font-medium break-words">
                              {item.product?.name}
                            </p>
                            <p className="text-gray-600">
                              Qty: {item.quantity} | ₹{item.price}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-4 border font-semibold">
                    ₹{order.totalPrice}
                  </td>
                  <td className="py-3 px-4 border">
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Out for Delivery</option>
                      <option>Delivered</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 border">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
