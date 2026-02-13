import { Schema, model, models } from "mongoose";

const PortfolioSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    balance: {
        type: Number,
        default: 10000, // Initial virtual currency
        required: true,
    },
    holdings: [
        {
            symbol: { type: String, required: true },
            quantity: { type: Number, required: true, default: 0 },
            averagePrice: { type: Number, required: true, default: 0 },
        },
    ],
}, { timestamps: true });

const Portfolio = models.Portfolio || model("Portfolio", PortfolioSchema);

export default Portfolio;
