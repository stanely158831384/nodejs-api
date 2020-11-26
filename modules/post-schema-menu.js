const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let menuSchema = new Schema({
    pictureLink: String,
    menuCode:Number,
    menuName:String,
    menu:[{
        Days:String,
        Breakfast:String,
        Lunch:String,
        Dinner:String
    }]
})

module.exports = menuSchema;