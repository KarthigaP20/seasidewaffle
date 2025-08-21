const Order = require("../models/Order");
const nodemailer = require("nodemailer");

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    // Ensure shippingAddress contains all required fields with fallback to user profile
    const fullShipping = {
      name: shippingAddress?.name || req.user.name || "N/A",
      phone: shippingAddress?.phone || req.user.phone || "N/A",
      address: shippingAddress?.address || req.user.address?.line1 || "N/A",
      city: shippingAddress?.city || req.user.address?.city || "N/A",
      state: shippingAddress?.state || req.user.address?.state || "N/A",
      country: shippingAddress?.country || req.user.address?.country || "N/A",
      pincode: shippingAddress?.pincode || req.user.address?.pincode || "N/A",
    };

    const order = new Order({
      user: req.user.id,
      orderItems: orderItems.map(item => ({
        product: item.product,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      shippingAddress: fullShipping,
      totalPrice,
      paymentMethod: paymentMethod || "Cash on Delivery",
    });

    const savedOrder = await order.save();

    // Send confirmation email asynchronously
    if (savedOrder && req.user.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"Sea Side Waffle" <${process.env.EMAIL_USER}>`,
          to: req.user.email,
          subject: "Order Confirmation - Sea Side Waffle",
          html: `
            <h2>Thank you for your order!</h2>
            <p>Your order has been placed successfully.</p>
            <p><strong>Order ID:</strong> ${savedOrder._id}</p>
          `,
        };

        transporter.sendMail(mailOptions).then(info => {
          console.log("Email sent:", info.response);
        }).catch(error => console.error("Email error:", error));
      } catch (mailErr) {
        console.error("Nodemailer setup error:", mailErr);
      }
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

// Get orders for user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const orders = await Order.find({ user: userId })
      .populate("user", "name email phone address") 
      .populate("orderItems.product") // product details
      .sort({ createdAt: -1 });

    // Ensure shippingAddress.name is always filled
    const formattedOrders = orders.map(order => ({
      ...order._doc,
      shippingAddress: {
        ...order.shippingAddress,
        name: order.shippingAddress?.name || order.user?.name || "N/A",
      },
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone address")
      .populate("orderItems.product", "name price image");

    // Ensure shippingAddress.name is always filled
    const formattedOrders = orders.map(order => ({
      ...order._doc,
      shippingAddress: {
        ...order.shippingAddress,
        name: order.shippingAddress?.name || order.user?.name || "N/A",
      },
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.deliveryStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};
