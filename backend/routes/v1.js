const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Instrument = require("../models/Instrument");
const Orders = require("../models/Orders");
const Portfolio = require("../models/Portfolio");

//Instrument
router.post(
    "/instruments",
    [
        body("symbol").notEmpty(),
        body("exchange").notEmpty(),
        body("instrumentType").notEmpty(),
        body("lastTradedPrice").isNumeric(),
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
        body("type").notEmpty().isIn(["BUY", "SELL"]),
        body("style").notEmpty().isIn(["MARKET", "LIMIT"]),
        body("quantity").isInt({ min: 1 }),
        body("price"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            if (req.body.style === "LIMIT" && !req.body.price) {
                return res.status(400).json({
                    message: "Price is required for LIMIT orders",
                });
            }
            let order = await Orders.create({
                type: req.body.type,
                style: req.body.style,
                quantity: req.body.quantity,
                price: req.body.price,
                status: "NEW",
            });
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error });
        }
    }
);

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
