const mongoose=require("mongoose");
const {Schema} = mongoose;

const TradesSchema=new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Orders",
        required:true
    },
    intrument_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Instrument"
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Trades = mongoose.model("Trades", TradesSchema);
module.exports = Trades;