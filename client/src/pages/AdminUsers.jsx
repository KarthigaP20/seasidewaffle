import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all users (public temporary route)
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/all");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Something went wrong while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user (admin only, token required)
  const token = localStorage.getItem("token");
  const deleteUser = async (id) => {
    if (!token) {
      alert("Unauthorized. Only admins can delete users.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
  method: "DELETE",
  headers: { 
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  },
});

      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message || "Error deleting user");
    }
  };

  if (loading)
    return <p className="text-center py-6 text-gray-700">Loading users...</p>;

  if (error)
    return <p className="text-center py-6 text-red-600 font-medium">{error}</p>;

  if (!users.length)
    return (
      <p className="text-center py-6 text-gray-500 italic">No users found.</p>
    );

  return (
        <div className="min-h-screen bg-[#EFCC89]">
    <div className="max-w-7xl mx-auto px-4 py-12 ">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-900">
        Manage Customers
      </h1>

      <div className="overflow-x-auto ">
        <table className="min-w-full border border-gray-800 rounded-lg shadow-sm bg-yellow-50 text-center">
          <thead>
            <tr className="bg-yellow-800 text-gray-800 ">
              <th className="p-3 border text-center ">Name</th>
              <th className="p-3 border text-center">Email</th>
              {/* <th className="p-3 border text-center">Orders</th> */}
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-yellow-50 transition-colors text-gray-700"
              >
                <td className="border p-3">{u.name}</td>
                <td className="border p-3">{u.email}</td>
               {/* <td className="border p-3 text-center">{u.orders || 0}</td> */}
                <td className="border p-3 text-center">
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    
  );
}
