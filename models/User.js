const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for users
let UserSchema = new Schema(
    {
        first_name: {type:String, required:true},
        last_name: {type:String, required:true},
        email: {type:String, required:true, unique:true},
        password: {type:String, required:true},
        bio: {type:String},
        profile_img: {type:String, required:false},
        cover_img: {type:String, required:false},  
        friends: [{type:Schema.Types.ObjectId, ref:'User'}]
    }
)

module.exports = mongoose.model('User', UserSchema);