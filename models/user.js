const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    fullname: {
        type: String
    },
    email: {
        type: String
    },
    phoneNum: {
        type: String
    },
    foodType: {
        type: Number
    },
    paidForThisMonth: {
        type: Boolean
    },
    paymentMethod: {
        type: Number
    },
    isOwner: {
        type: Boolean
    }
})

module.exports = mongoose.model('User', userSchema);