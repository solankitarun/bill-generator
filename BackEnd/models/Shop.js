const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    ShopName: { type: String, required: true },
    Tagline: { type: String },
    Address: { type: String },
    Phone: { type: String },
    TaxRate: { type: Number, default: 0 }
});

module.exports = mongoose.model('Shop', shopSchema, 'ShopMaster');
