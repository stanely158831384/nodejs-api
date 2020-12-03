const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let userSchema = new Schema({
    pictureLink: String,
    email: String,
    username: String,
    accountID: Number,
    password: String,
    address: String,
    accountType: Number,
    mealPlan: Number,
    language: String,
    Membership: Date,
    paymentMethod: {username: String, cardNumber: String, securityCode: String, expiredDate: Date},
    delivery:String
})

module.exports = userSchema;