import React, { useState, useEffect } from "react";
import { API_BASE } from "../apiConfig";
export default function ProductForm({ product = {}, onSave }) {
  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState(product.price || "");
  const [category, setCategory] = useState(product.category || "");
  const [image, setImage] = useState(product.image || "");
  const [featured, setFeatured] = useState(product.featured || false);
  const [available, setAvailable] = useState(product.available ?? true);
  const [description, setDescription] = useState(product.description || "");
  const [ingredients, setIngredients] = useState(product.ingredients || []);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(product.name || "");
    setPrice(product.price || "");
    setCategory(product.category || "");
    setImage(product.image || "");
    setFeatured(product.featured || false);
    setAvailable(product.available ?? true);
    setDescription(product.description || "");
    setIngredients(product.ingredients || []);

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (res.ok) {
          const data = await res.json();
          const unique = [
            ...new Set(data.map((p) => p.category?.trim() || "Other")),
          ];
          setCategories(unique);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [product]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/upload/product`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploading(false);
      if (res.ok) return `${API_BASE}${data.path}`.replace("http://", "https://");
      else {
        alert("Upload failed");
        return null;
      }
    } catch (err) {
      setUploading(false);
      console.error(err);
      alert("Upload error");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedImage = image;
    if (file) {
      const uploadedPath = await uploadFile();
      if (uploadedPath) uploadedImage = uploadedPath;
    }

    const ingredientsArray = Array.isArray(ingredients)
      ? ingredients
      : ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    onSave({
      _id: product._id,
      name,
      price: Number(price),
      category,
      image: uploadedImage,
      featured,
      available,
      description: description || undefined,
      ingredients: ingredientsArray.length ? ingredientsArray : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto bg-yellow-800 p-6 rounded-xl"
    >
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
        required
        min="0"
        step="0.01"
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        list="category-options"
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
        required
      />
      <datalist id="category-options">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Image URL */}
      <input
        type="text"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
      />

      {/* File Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
      />
      {uploading && <p>Uploading image...</p>}

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
        rows={3}
      />
      <textarea
        placeholder="Ingredients (optional, comma-separated)"
        value={
          Array.isArray(ingredients) ? ingredients.join(", ") : ingredients
        }
        onChange={(e) => setIngredients(e.target.value)}
        className="w-full border border-yellow-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800"
        rows={2}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={() => setFeatured(!featured)}
        />
        Featured Product
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={available}
          onChange={() => setAvailable(!available)}
        />
        Available
      </label>
      <button
        type="submit"
        className="bg-yellow-800 hover:bg-yellow-700 text-gray-900 font-bold py-2 px-6 rounded-lg w-full"
      >
        Save Product
      </button>
    </form>
  );
}
