const mongoose = require("mongoose");
const mongourl = process.env.MONGO_URL;

const connectToMongo = () => {
    mongoose
        .connect(mongourl)
        .then(() => {})
        .catch((err) => {
            console.error(err);
        });
};

module.exports = connectToMongo;
