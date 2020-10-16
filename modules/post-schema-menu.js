const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let menuSchema = new Schema({
    menuCode:Number,
    menu:[{
        Days:String,
        Breakfast:String,
        Lunch:String,
        Dinner:String
    }]
})

module.exports = menuSchema;