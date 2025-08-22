import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: "Total Orders", value: 0 },
    { label: "Total Products", value: 0 },
    { label: "Total Customers", value: 0 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        console.log("Stats:", data);

        // Map backend data into your UI format
        setStats([
          { label: "Total Orders", value: data.orders || 0 },
          { label: "Total Products", value: data.products || 0 },
          { label: "Total Customers", value: data.users || 0 },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-[#EFCC89]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-yellow-600 text-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{stat.label}</h2>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/products"
            className="bg-yellow-700 hover:bg-yellow-800 px-6 py-3 rounded font-bold shadow"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="bg-yellow-700 hover:bg-yellow-800 px-6 py-3 rounded font-bold shadow"
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/users"
            className="bg-yellow-700 hover:bg-yellow-800 px-6 py-3 rounded font-bold shadow"
          >
            Manage Customers
          </Link>
        </div>
      </div>
    </div>
  );
}
