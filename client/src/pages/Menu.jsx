import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category?.trim() || "Other")),
    ];
    return ["all", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !query || p.name?.toLowerCase().includes(query);
      const matchesCategory =
        category === "all" || (p.category || "Other") === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, category]);

  return (
    <div className="min-h-screen bg-[#f0deb7] px-6 py-8">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-6xl mx-auto mb-8 sticky top-4 bg-[#f0d8a5] p-4 rounded-xl border border-yellow-800 z-10">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search waffles, Mojito, Coffee, Snacks..."
          className="flex-1 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-800 transition duration-150 hover:bg-yellow-100"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-800 transition duration-150 hover:bg-yellow-100"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      {loading ? (
        <p className="text-center text-gray-700">Loading products...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-700">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="flex flex-col items-center p-4 rounded-2xl bg-[#f0deb7] border border-yellow-800 transform transition duration-200 hover:scale-105"
            >
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="w-full h-48 object-contain"
              />
              <h3 className="mt-3 font-bold text-gray-900 text-center">
                {product.name}
              </h3>
              <p className="mt-2 font-semibold text-gray-900 text-center">
                ₹{product.price}
              </p>
              <button
                onClick={() => navigate(`/product/${product._id}`)}
                className="mt-4 w-full bg-yellow-700 hover:bg-yellow-900 text-gray-900 font-bold py-2 rounded-xl"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
