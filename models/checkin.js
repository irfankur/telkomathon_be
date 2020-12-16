const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var checkinSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    checkin:  {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

var Checkin = mongoose.model('Checkin', checkinSchema);

module.exports = Checkin;