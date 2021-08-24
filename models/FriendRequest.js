const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FriendRequestSchema = new Schema(
    {
        requestee: {type:Schema.Types.ObjectId, ref:'User', required: true},
        requested: {type: Schema.Types.ObjectId, ref:'User', required: true}
    }
)

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);