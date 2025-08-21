import { useState, useEffect } from "react";
import ProductForm from "../components/ProductForm"; 
import heroImg from "../assets/hero.jpg";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchProducts();
  }, []);

  const handleSave = async (productData) => {
    try {
      let response;
      if (editingProduct) {
        response = await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      const savedProduct = await response.json();
      if (!response.ok) throw new Error(savedProduct.message || "Failed to save");

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p._id === savedProduct._id ? savedProduct : p))
        );
      } else {
        setProducts((prev) => [...prev, savedProduct]);
      }

      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert(error.message || "Error deleting product");
    }
  };

  return (
    <div className="max-w-full mx-auto px-12 py-12 bg-[#EFCC89]">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
          }}
          className="mb-6 bg-yellow-800 hover:bg-yellow-700 px-4 py-2 rounded font-bold"
        >
          Add New Product
        </button>
      )}

      {showForm && <ProductForm product={editingProduct || {}} onSave={handleSave} />}

      {!showForm && (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-yellow-800 text-center">
              <th className="p-2 border ">Image</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="border p-2 text-center">
                  <img src={p.image || heroImg} alt={p.name} className="h-16 w-16 object-cover mx-auto rounded" />
                </td>
                
                <td className="border p-2 text-center">{p.name}</td>
                <td className="border p-2 text-center">₹{p.price}</td>
                <td className="border p-2 text-center">{p.category}</td>
                 {/* Actions column → center buttons */}
      <td className="border p-2 text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEdit(p)}
            className="bg-green-800 px-3 py-1 rounded text-white"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(p._id)}
            className="bg-red-800 px-3 py-1 rounded text-white"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      )}
    </div>
  );
}
