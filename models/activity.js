const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var activitySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    activity:  {
        type: String
    }
}, {
    timestamps: true
});

var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;