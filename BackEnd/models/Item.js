const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    ItemName: { type: String, required: true },
    DefaultPrice: { type: Number, required: true },
    IsActive: { type: Number, default: 1 } // 1 for active, 0 for inactive
});

module.exports = mongoose.model('Item', itemSchema, 'LaundryItemMaster');
