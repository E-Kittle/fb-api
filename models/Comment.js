const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for the comments
// Each comment must reference either a post or another comment as a parent
let CommentSchema = new Schema(
    {
        author: {type: Schema.Types.ObjectId, ref: 'User', default: null},
        content: {type: String, required: true, maxLength: 300},
        date: {type: Date, required: true},
        likes: [{type:Schema.Types.ObjectId, ref:'User', default: []}],
        commentRef: {type: Schema.Types.ObjectId, ref: 'Comment', default: null}
    }
)

module.exports = mongoose.model('Comment', CommentSchema);