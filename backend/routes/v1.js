const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const Instrument = require("../models/Instrument");
const Orders = require("../models/Orders");
const User = require("../models/User");
const Trades = require("../models/Trades");

//Instrument
router.post(
    "/instruments",
    [
        body("symbol").notEmpty(),
        body("exchange").notEmpty(),
        body("instrumentType").notEmpty(),
        body("lastTradedPrice").isNumeric(),
        body("quantity").isNumeric(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const existing = await Instrument.findOne({
                symbol: req.body.symbol,
            });
            if (existing) {
                return res
                    .status(400)
                    .json({ message: "Symbol already exists" });
            }
            let instrument = await Instrument.create({
                symbol: req.body.symbol,
                exchange: req.body.exchange,
                instrumentType: req.body.instrumentType,
                lastTradedPrice: req.body.lastTradedPrice,
                quantity: req.body.quantity,
            });
            res.status(201).json(instrument);
        } catch (error) {
            res.status(500).json({ message: "Server Error" });
        }
    }
);

//Instrument get
router.get("/fetchallinstruments", async (req, res) => {
    try {
        const instruments = await Instrument.find();
        res.status(200).json(instruments);
    } catch (error) {
        res.status(500).json(error);
    }
});

//Placing new order
router.post(
    "/orders",
    [
        body("userId").isMongoId(),
        body("instrumentId").isMongoId(),
        body("type").notEmpty().isIn(["BUY", "SELL"]),
        body("style").notEmpty().isIn(["MARKET", "LIMIT"]),
        body("quantity").isInt({ min: 1 }),
        body("price").optional().isFloat({ gt: 0 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            if (
                req.body.style === "LIMIT" &&
                (req.body.price == null || req.body.price <= 0)
            ) {
                return res.status(400).json({
                    message: "Price is required for LIMIT orders",
                });
            }
            let order = await Orders.create({
                user_id: req.body.userId,
                instrument_id: req.body.instrumentId,
                type: req.body.type,
                style: req.body.style,
                quantity: req.body.quantity,
                price: req.body.style === "MARKET" ? null : req.body.price,
                status: "NEW",
            });
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error });
        }
    }
);

router.post(
    "/createuser",
    [
        body("username").notEmpty(),
        body("name").notEmpty(),
        body("number").isNumeric(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        body("cpassword").notEmpty(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, name, number, email, password, cpassword } =
                req.body;
            if (password !== cpassword) {
                return res.status(400).json({
                    message: "Passwords do not match",
                });
            }

            const existingUser = await User.findOne({
                $or: [{ email }, { number }, { username }],
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "User already exists",
                });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = await User.create({
                username,
                name,
                number,
                email,
                password: hashedPassword,
            });

            res.status(201).json({
                message: "User created successfully",
                user: {
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }
);

//fetch user trades
router.put("/orders/:orderId/execute", async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.body.userId;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID" });
        }
        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status === "EXECUTED") {
            return res.status(400).json({ message: "Order already executed" });
        }
        const instrument = await Instrument.findById(order.instrument_id);
        if (!instrument) {
            return res.status(404).json({ message: "Instrument not found" });
        }
        const executionPrice =
            order.style === "MARKET" ? instrument.lastTradedPrice : order.price;

        const trade = await Trades.create({
            user_id: userId,
            order_id: order._id,
            instrument_id: order.instrument_id,
            quantity: order.quantity,
            price: executionPrice,
        });

        order.status = "EXECUTED";
        await order.save();

        res.status(200).json({
            message: "Order executed successfully",
            order,
            trade,
        });
    } catch (error) {
        console.error("EXECUTE ORDER ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

//Fetch order ID
router.get("/orders/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID" });
        }
        const order = await Orders.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = "PLACED";
        res.status(201).json({ order });
    } catch (error) {
        console.error("GET ORDER ERROR:", error);
        res.status(500).json({ error });
    }
});
module.exports = router;
