const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrdersSchema = new Schema({
    type: { type: String, required: true, enum: ["BUY", "SELL"] },
    style: { type: String, required: true, enum: ["MARKET", "LIMIT"] },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number },
    status: {
        type: String,
        required: true,
        enum: ["NEW", "PLACED", "EXECUTED", "CANCELLED"],
    },
});
    
const Orders = mongoose.model("Orders", OrdersSchema);
module.exports = Orders;
