import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editPersonal, setEditPersonal] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  const [personalForm, setPersonalForm] = useState({ name: "", email: "", phone: "" });
  const [addressForm, setAddressForm] = useState({ line1: "", city: "", state: "", pincode: "", country: "" });

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/"); // redirect to home page
      return;
    }
    fetchProfile();
    
  }, [token]);

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMe(data);
        setPersonalForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
        setAddressForm({
          line1: data.address?.line1 || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
          country: data.address?.country || "",
        });
      } else {
        navigate("/"); // invalid/expired token → redirect
      }
    } catch (err) {
      console.error(err);
      navigate("/"); // error → redirect
    } finally {
      setLoading(false);
    }
  };

  // Save personal details
  const handleSavePersonal = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/update-personal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(personalForm),
      });
      if (res.ok) {
        fetchProfile();
        setEditPersonal(false);
        alert("Personal details updated!");
      } else {
        alert("Error updating personal details");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating personal details");
    }
  };

  // Save shipping address
  const handleSaveAddress = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/update-address", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addressForm),
      });
      if (res.ok) {
        fetchProfile();
        setEditAddress(false);
        alert("Shipping address updated!");
      } else {
        alert("Error updating address");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating address");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-700 font-medium">Loading profile...</div>
    );

  if (!me)
    return (
      <div className="p-8 text-center text-rose-600 font-semibold">Profile not available.</div>
    );

  return (
    <div className="min-h-screen bg-[#F0DEB7] px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Personal Details */}
        <div className="bg-[#FEEFD3] rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
          {editPersonal ? (
            <div className="space-y-3">
              <input
                type="text"
                value={personalForm.name}
                onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                placeholder="Name"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <input
                type="email"
                value={personalForm.email}
                onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                placeholder="Email"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <input
                type="text"
                value={personalForm.phone}
                onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                placeholder="Phone"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSavePersonal}
                  className="bg-yellow-800 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditPersonal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-6 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-600">Name:</span> {personalForm.name}</p>
              <p><span className="font-semibold text-gray-600">Email:</span> {personalForm.email}</p>
              <p><span className="font-semibold text-gray-600">Phone:</span> {personalForm.phone || "-"}</p>
              <button
                onClick={() => setEditPersonal(true)}
                className="bg-yellow-800 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg mt-2"
              >
                Edit Personal Details
              </button>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-[#FEEFD3] rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Shipping Address</h2>
          {editAddress ? (
            <div className="space-y-3">
              <input
                type="text"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                placeholder="Address Line 1"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                placeholder="City"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                placeholder="State"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <input
                type="text"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                placeholder="Pincode"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <input
                type="text"
                value={addressForm.country}
                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                placeholder="Country"
                className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAddress}
                  className="bg-yellow-800 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditAddress(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-6 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {addressForm.line1 ? (
                <>
                  <p>{addressForm.line1}</p>
                  <p>{addressForm.city}, {addressForm.state} {addressForm.pincode}</p>
                  <p>{addressForm.country}</p>
                </>
              ) : (
                <p className="text-gray-400">No shipping address added yet.</p>
              )}
              <button
                onClick={() => setEditAddress(true)}
                className="bg-yellow-800 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg mt-2"
              >
                Edit Shipping Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
