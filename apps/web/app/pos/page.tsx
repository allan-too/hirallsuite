"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type Product = {
  id: string;
  name: string;
  sellingPrice: number;
  trackStock: boolean;
};

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
};

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/products")
      .then((data) => setProducts(data.products))
      .catch((error) => setMessage(error.message));
  }, []);

  const totals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const lineTotal = item.price * item.quantity - item.discount + item.tax;
        acc.total += lineTotal;
        return acc;
      },
      { total: 0 }
    );
  }, [cart]);

  const addToCart = () => {
    const product = products.find((entry) => entry.id === selectedProduct);
    if (!product) {
      setMessage("Select a product");
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity,
        price: product.sellingPrice,
        discount: 0,
        tax: 0
      }
    ]);
    setMessage("");
  };

  const submitSale = async () => {
    if (cart.length === 0) {
      setMessage("Cart is empty");
      return;
    }
    try {
      const response = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify({
          items: cart,
          payments: [{ method: paymentMethod, amount: totals.total }]
        })
      });
      setMessage(`Sale posted. Receipt: ${response.sale.receiptNumber}`);
      setCart([]);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <section style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ fontSize: "28px" }}>POS</h1>
        <p style={{ color: "#6b7280" }}>
          Add items, take payment, and post the sale. Open a shift in the Cashier module first.
        </p>
      </header>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Add to cart</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select
            value={selectedProduct}
            onChange={(event) => setSelectedProduct(event.target.value)}
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
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
          <button onClick={addToCart}>Add</button>
        </div>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Cart</h2>
        {cart.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={`${item.productId}-${index}`}>
                {item.name} × {item.quantity} @ {item.price}
              </li>
            ))}
          </ul>
        )}
        <p>Total: {totals.total.toFixed(2)}</p>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
          </select>
          <button onClick={submitSale}>Post Sale</button>
        </div>
      </section>

      {message && (
        <div style={{ background: "#e0f2fe", padding: "12px", borderRadius: "8px" }}>
          {message}
        </div>
      )}
    </section>
  );
}
