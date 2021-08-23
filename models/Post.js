const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PostSchema = new Schema(
    {
        author: {type:Schema.Types.ObjectId, ref='User', required:true},
        content: {type:String},
        photos: {type:String},
        likes: {type:Number, required:true, default:0},
        comments: [{
            type:Schema.Types.ObjectId, ref='User'
        }],
    }
)

module.exports = mongoose.model('Post', PostSchema)