const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please add name"],
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "Please add a name!"],
        trim: true
    },
    uin: {
        type: String,
        required: true,
        trim: true,
        default: "UIN"
    },
    category: {
        type: String,
        required: [true, "Please add a category!"],
        trim: true
    },
    quantity: {
        type: String,
        required: [true, "Please add a number of product!"],
        trim: true
    },
    price: {
        type: String,
        required: [true, "Please enter the price!"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add description!"],
        trim: true
    },
    image: {
        type: Object,
        default: {}
    }
},{
    timestamp: true
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;