"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Product = {
  id: string;
  name: string;
};

type StockItem = {
  productId: string;
  quantity: number;
};

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stockProductId, setStockProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const loadProducts = () => {
    apiFetch("/products")
      .then((data) => setProducts(data.products))
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const createProduct = async () => {
    try {
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          name: productName,
          sellingPrice,
          costPrice,
          trackStock: true
        })
      });
      setMessage("Product created");
      setProductName("");
      loadProducts();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  const stockIn = async () => {
    const items: StockItem[] = [{ productId: stockProductId, quantity: stockQuantity }];
    try {
      await apiFetch("/inventory/movements", {
        method: "POST",
        body: JSON.stringify({
          type: "GRN",
          supplier: "Local",
          items
        })
      });
      setMessage("Stock received");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <section style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ fontSize: "28px" }}>Store</h1>
        <p style={{ color: "#6b7280" }}>Create products and record stock movements.</p>
      </header>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Create product</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            placeholder="Product name"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
          />
          <input
            type="number"
            placeholder="Selling price"
            value={sellingPrice}
            onChange={(event) => setSellingPrice(Number(event.target.value))}
          />
          <input
            type="number"
            placeholder="Cost price"
            value={costPrice}
            onChange={(event) => setCostPrice(Number(event.target.value))}
          />
          <button onClick={createProduct}>Create</button>
        </div>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Receive stock (GRN)</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select
            value={stockProductId}
            onChange={(event) => setStockProductId(event.target.value)}
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={stockQuantity}
            onChange={(event) => setStockQuantity(Number(event.target.value))}
          />
          <button onClick={stockIn}>Receive stock</button>
        </div>
      </section>

      {message && <div style={{ background: "#e0f2fe", padding: "12px" }}>{message}</div>}
    </section>
  );
}
