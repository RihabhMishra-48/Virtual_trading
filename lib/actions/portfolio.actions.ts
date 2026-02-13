"use server";

import { connectToDatabase } from "@/database/mongoose";
import Portfolio from "@/database/models/portfolio.model";
import Transaction from "@/database/models/transaction.model";
import { revalidatePath } from "next/cache";

// Get user portfolio or create one if it doesn't exist
export async function getPortfolio(userId: string): Promise<IPortfolio> {
    if (!userId) throw new Error("User ID is required");

    await connectToDatabase();

    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
        portfolio = await Portfolio.create({
            userId,
            balance: 10000,
            holdings: [],
        });
    }

    // Convert to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(portfolio));
}

// Execute a trade (Buy or Sell)
export async function executeTrade(
    userId: string,
    symbol: string,
    type: 'BUY' | 'SELL',
    quantity: number,
    currentPrice: number
) {
    if (!userId) throw new Error("Unauthorized");
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (currentPrice <= 0) throw new Error("Invalid price");

    await connectToDatabase();

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) throw new Error("Portfolio not found");

    const totalCost = quantity * currentPrice;

    if (type === 'BUY') {
        if (portfolio.balance < totalCost) {
            return { success: false, error: "Insufficient funds" };
        }

        // Update balance
        portfolio.balance -= totalCost;

        // Update holdings
        const existingHoldingIndex = portfolio.holdings.findIndex((h: any) => h.symbol === symbol);

        if (existingHoldingIndex > -1) {
            const holding = portfolio.holdings[existingHoldingIndex];
            // Calculate new weighted average price
            const totalValue = (holding.quantity * holding.averagePrice) + totalCost;
            const newQuantity = holding.quantity + quantity;

            holding.averagePrice = totalValue / newQuantity;
            holding.quantity = newQuantity;
        } else {
            portfolio.holdings.push({
                symbol,
                quantity,
                averagePrice: currentPrice,
            });
        }

    } else if (type === 'SELL') {
        const existingHoldingIndex = portfolio.holdings.findIndex((h: any) => h.symbol === symbol);

        if (existingHoldingIndex === -1 || portfolio.holdings[existingHoldingIndex].quantity < quantity) {
            return { success: false, error: "Insufficient holdings" };
        }

        // Update balance
        portfolio.balance += totalCost;

        // Update holdings
        const holding = portfolio.holdings[existingHoldingIndex];
        holding.quantity -= quantity;

        if (holding.quantity === 0) {
            // Remove holding if sold out
            portfolio.holdings.splice(existingHoldingIndex, 1);
        }
    }

    await portfolio.save();

    // Log Transaction
    await Transaction.create({
        userId,
        symbol,
        type,
        quantity,
        price: currentPrice,
        totalAmount: totalCost,
        date: new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath(`/stocks/${symbol}`);

    return { success: true, newBalance: portfolio.balance };
}

// Top up balance (Simulation)
export async function topUpBalance(userId: string, amount: number) {
    if (!userId) throw new Error("Unauthorized");
    if (amount <= 0) throw new Error("Invalid amount");

    await connectToDatabase();

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) throw new Error("Portfolio not found");

    portfolio.balance += amount;
    await portfolio.save();

    await Transaction.create({
        userId,
        symbol: 'USD',
        type: 'DEPOSIT',
        quantity: 1,
        price: amount,
        totalAmount: amount,
        date: new Date(),
    });

    revalidatePath("/");

    return { success: true, newBalance: portfolio.balance };
}

// Get transaction history
export async function getTransactionHistory(userId: string, limit: number = 50): Promise<ITransaction[]> {
    if (!userId) throw new Error("Unauthorized");

    await connectToDatabase();

    const transactions = await Transaction.find({ userId })
        .sort({ date: -1 })
        .limit(limit)
        .lean();

    return JSON.parse(JSON.stringify(transactions));
}

// Get portfolio with live prices
export async function getPortfolioWithLivePrices(userId: string) {
    if (!userId) throw new Error("Unauthorized");

    const portfolio = await getPortfolio(userId);

    // Fetch live prices for all holdings
    const holdingsWithPrices = await Promise.all(
        portfolio.holdings.map(async (holding) => {
            try {
                const quote = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${holding.symbol}&token=${process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
                ).then(res => res.json());

                const currentPrice = quote.c || holding.averagePrice;
                const totalValue = currentPrice * holding.quantity;
                const totalCost = holding.averagePrice * holding.quantity;
                const profitLoss = totalValue - totalCost;
                const profitLossPercent = ((profitLoss / totalCost) * 100);

                return {
                    ...holding,
                    currentPrice,
                    totalValue,
                    profitLoss,
                    profitLossPercent,
                };
            } catch (error) {
                console.error(`Error fetching price for ${holding.symbol}:`, error);
                return {
                    ...holding,
                    currentPrice: holding.averagePrice,
                    totalValue: holding.averagePrice * holding.quantity,
                    profitLoss: 0,
                    profitLossPercent: 0,
                };
            }
        })
    );

    const totalInvested = holdingsWithPrices.reduce((sum, h) => sum + (h.averagePrice * h.quantity), 0);
    const totalCurrentValue = holdingsWithPrices.reduce((sum, h) => sum + h.totalValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return {
        ...portfolio,
        holdings: holdingsWithPrices,
        totalInvested,
        totalCurrentValue,
        totalValue: portfolio.balance + totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent,
    };
}
