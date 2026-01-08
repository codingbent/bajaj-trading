const mongoose = require("mongoose");
const { Schema } = mongoose;

const InstrumentSchema = new Schema({
    symbol: { type: String, required:true },
    exchange: { type: String, required:true },
    intrumentType: { type: String, required:true },
    lastTradedPrice:{type:String,required:true},
});
const Instrument = mongoose.model("Instrument", InstrumentSchema);
module.exports=Instrument;
