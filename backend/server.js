const express = require('express');
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRoute = require("./routes/productRoute");
const contactUsRoute = require("./routes/contactUsRoute");
const userRoute = require("./routes/userRoute");
const errorHandler = require('./middlewares/errorMiddleware');
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use("/file-upload", express.static(path.join(__dirname, "file-upload")));
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contact-us", contactUsRoute);


app.get("/", (req, res) => {
    res.send("Home")
})

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`app listening on port ${PORT}!`))
    })
    .catch((err) => {
        console.log(err);
})
