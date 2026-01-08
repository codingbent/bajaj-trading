const mongoose=require("mongoose")
const {Schema} = mongoose;

const PortfolioSchema=new Schema({
    symbol:{type:String,required:true},
    quantity:{type:String,required:true},
    averageprice:{type:Number,required:true},
    currentValue:{type:Number,required:true}
})

const Portfolio=mongoose.model["Portfolio",PortfolioSchema];
module.exports=Portfolio;