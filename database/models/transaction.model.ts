import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    symbol: {
        type: String, // 'USD' for deposits
        required: true,
    },
    type: {
        type: String,
        enum: ['BUY', 'SELL', 'DEPOSIT'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number, // quantity * price
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Transaction = models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
