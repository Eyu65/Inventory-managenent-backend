const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    useId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiresOn: {
        type: Date,
        required: true
    }
});

const Token = mongoose.model("Token", tokenSchema)

module.exports = Token;