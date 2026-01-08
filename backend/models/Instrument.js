const mongoose = require("mongoose");
const { Schema } = mongoose;

const InstrumentSchema = new Schema({
    symbol: { type: String, required: true, unique: true },
    exchange: { type: String, required: true },
    instrumentType: { type: String, required: true },
    lastTradedPrice: { type: Number, required: true },
});
const Instrument = mongoose.model("Instrument", InstrumentSchema);
module.exports = Instrument;
