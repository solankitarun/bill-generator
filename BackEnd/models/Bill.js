const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    ItemName: String,
    Quantity: Number,
    UnitPrice: Number,
    TotalPrice: Number
}, { _id: false });

const billSchema = new mongoose.Schema({
    InvoiceNumber: { type: String },
    CustomerName: { type: String },
    CustomerPhone: { type: String },
    CustomerTown: { type: String },
    ReturnDate: { type: Date },
    SubTotal: { type: Number },
    TaxAmount: { type: Number },
    GrandTotal: { type: Number },
    BillDate: { type: Date, default: Date.now },
    PaymentStatus: { type: String, default: 'Pending' },
    items: [billItemSchema]
});

module.exports = mongoose.model('Bill', billSchema, 'Bills');
