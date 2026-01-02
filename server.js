const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/cake_shop", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const orderSchema = new mongoose.Schema({
  orderId: String,
  name: String,
  email: String,
  phone: String,
  address: String,
  cart: [
    {
      product_name: String,
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  date: { type: Date, default: Date.now },
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);
const Contact = mongoose.model("Contact", contactSchema);

// Routes
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const orderId = "ORD-" + Date.now();
    const newOrder = new Order({ ...req.body, orderId });
    await newOrder.save();
    res.status(201).json({ message: "Order saved!", orderId: newOrder.orderId });
  } catch (err) {
    console.error("Order saving error:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

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
          order_date: order.date.toLocaleString(),
        },
      });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json({ message: "Your message has been sent!" });
  } catch (err) {
    console.error("Contact saving error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
