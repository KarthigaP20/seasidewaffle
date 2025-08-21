export const addToCart = async (productId, qty = 1) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:5000/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, qty }),
  });

  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
};
