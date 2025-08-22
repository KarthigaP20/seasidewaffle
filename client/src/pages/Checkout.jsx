import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // for single product orders
  const token = localStorage.getItem("token");

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  // Determine cart / single product
  const [cart, setCart] = useState(location.state?.cart || []);
  const [totalPrice, setTotalPrice] = useState(location.state?.total || 0);

  // Fetch user profile & prefill form
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserData(data);

        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address?.line1 || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
          country: data.address?.country || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  // Fetch product if coming from single-product order and cart is empty
  useEffect(() => {
    if (cart.length || !id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        setCart([{ ...data, qty: 1 }]);
        setTotalPrice(data.price);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id, cart.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData || !cart.length) return;

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        product: item._id || item.id,
        price: item.price,
        quantity: item.qty || 1,
      }));

      const orderData = {
        user: userData._id,
        orderItems,
        shippingAddress: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          phone: formData.phone,
          pincode: formData.pincode,
          country: formData.country,
        },
        totalPrice,
        paymentMethod: "Cash on Delivery",
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order placement failed");

      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      console.error("Order error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!cart.length)
    return <p className="text-center mt-10">No product to checkout.</p>;

  return (
    <div className="min-h-screen bg-[#F0DEB7] p-12">
      <div className="max-w-3xl mx-auto p-6 bg-[#faeed8]  rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

        {/* Order Summary */}
        <div className="border rounded-xl p-4 mb-6 bg-[#fff4e8]">
          <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
          {cart.map((item) => (
            <div
              key={item.id || item._id}
              className="flex justify-between mb-2"
            >
              <span>{item.name}</span>
              <span>₹{item.price * (item.qty || 1)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 font-bold flex justify-between">
            <span>Total:</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>

        {/* Shipping Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-[#fff4e6] p-6 rounded-xl shadow-inner"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-800"
          />

          <button
            type="submit"
            className="w-full bg-yellow-700 hover:bg-yellow-800 text-gray-900 font-bold py-3 rounded-lg shadow"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
