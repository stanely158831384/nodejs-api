const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: String,
    username: String,
    accountID: Number,
    password: String,
    address: String,
    accountType: Number,
    mealPlan: [{day: String, breakFast: String, lunch: String, dinner: String}],
    language: String,
    Membership: Date,
    paymentMethod: {username: String, cardNumber: String, securityCode: String, expiredDate: Date}
})

module.exports = userSchema;