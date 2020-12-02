const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let receiptSchema = new Schema({
   receiptDate: Date,
   user: String,
   receiptDetail: String,
   paymentByCredit: String
})

module.exports = receiptSchema;