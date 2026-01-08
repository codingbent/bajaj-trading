require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const port = 5001;
connectToMongo();
require("./models/Instrument");
require("./models/Orders");
require("./models/Portfolio");

const app=express();

app.use("/api/v1",require("./routes/v1"));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
