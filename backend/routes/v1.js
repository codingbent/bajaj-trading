const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Instrument= require("../models/Instrument");
const Orders = require("../models/Orders");
const Portfolio = require("../models/Portfolio");

//Instrument
router.post(
    "/instruments",
    [
        body("symbol").notEmpty(),
        body("exchange").notEmpty(),
        body("intrumentType").notEmpty(),
        body("lastTradedPrice").isNumeric(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
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
            });
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ message: "Server Error" });
        }
    }
);

//Fetch order ID
router.get(
    "/orders/:orderId",
    async (req, res) => {
        try{
            const order=await Orders.findById(req.params.orderId);
            if(order!=null)
                res.status(200).json(order);
            else
                res.status(404).json({message:"Order not found"})
        }
        catch(error){
            res.status(500).json({ message: "Server Error" });
        }
    }
)
module.exports = router;
