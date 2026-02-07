import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "hirall-api-node" });
});

app.get("/modules", (req, res) => {
  res.json({
    modules: ["POS", "Cashier", "Store", "Manager"],
    phase: "HIRALL POS v1"
  });
});

app.listen(port, () => {
  console.log(`HIRALL Node API listening on ${port}`);
});
