const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    image: { type: String }
});

module.exports = mongoose.model('Contact', contactSchema);
