const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/cake_shop", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  orderId: String,
  name: String,
  email: String,
  phone: String,
  address: String,
  cart: [
    {
      product_name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

// Route to serve home.html as homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Save new order
app.post("/api/orders", async (req, res) => {
  try {
    const customOrderId = "ORD-" + Date.now();
    const order = new Order({ ...req.body, orderId: customOrderId });
    await order.save();
    res.status(201).json({
      message: "Order saved!",
      order: {
        orderId: order.orderId,
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        items: order.cart,
        total_amount: order.total,
        order_date: order.date.toLocaleString()
      }
    });
  } catch (err) {
    res.status(500).send({ error: "Something went wrong." });
  }
});

// Fetch order by ID
app.get("/api/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (order) {
      res.json({
        order: {
          orderId: order.orderId,
          name: order.name,
          email: order.email,
          phone: order.phone,
          address: order.address,
          items: order.cart,
          total_amount: order.total,
          order_date: order.date.toLocaleString()
        }
      });
    } else {
      res.status(404).send({ error: "Order not found" });
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch order" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});
