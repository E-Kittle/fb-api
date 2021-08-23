const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        first_name: {type:String, required:true},
        last_name: {type:String, required:true},
        email: {type:String, required:true, unique:true},
        password: {type:String, required:true},
        bio: {type:String},
        profile_img: {type:String},
        profile_banner: {type:String},
        friend_requests: {type: Schema.Types.ObjectId, ref:'User'},
        friends: {type:Schema.Types.ObjectId, ref:'User'}
    }
)

UserSchema.virtual('temp_img').get(function() {
    return first_name.slice(0,1) + second_name.slice(0,1);
})

module.exports = mongoose.model('User', UserSchema);