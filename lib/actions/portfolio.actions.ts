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
export async function getPortfolioWithLivePrices(userId: string): Promise<IPortfolio> {
    if (!userId) throw new Error("Unauthorized");

    const portfolio = await getPortfolio(userId);

    if (portfolio.holdings.length === 0) {
        return {
            ...portfolio,
            holdings: [],
            totalInvested: 0,
            totalCurrentValue: 0,
            totalValue: portfolio.balance,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0,
            statsUSD: { invested: 0, currentValue: 0, profitLoss: 0, profitLossPercent: 0 },
            statsINR: { invested: 0, currentValue: 0, profitLoss: 0, profitLossPercent: 0 },
        };
    }

    // Separate Indian and US stocks
    const { isIndianStock } = await import('@/lib/utils');
    const { getMultipleIndianStocks } = await import('./indian-stock-api.actions');
    const { getStockQuote } = await import('./finnhub.actions');

    const indianStocks = portfolio.holdings.filter(h => isIndianStock(h.symbol));
    const usStocks = portfolio.holdings.filter(h => !isIndianStock(h.symbol));

    // Fetch Indian stocks in batch
    let indianPrices = new Map<string, QuoteData>();
    if (indianStocks.length > 0) {
        try {
            indianPrices = await getMultipleIndianStocks(indianStocks.map(h => h.symbol));
        } catch (error) {
            console.error('Error fetching Indian stock prices:', error);
        }
    }

    // Fetch US stocks individually (could be optimized with batch API if needed)
    const usPrices = new Map<string, QuoteData>();
    if (usStocks.length > 0) {
        await Promise.all(
            usStocks.map(async (holding) => {
                try {
                    const quote = await getStockQuote(holding.symbol);
                    usPrices.set(holding.symbol, quote);
                } catch (error) {
                    console.error(`Error fetching price for ${holding.symbol}:`, error);
                    usPrices.set(holding.symbol, { c: 0, dp: 0 });
                }
            })
        );
    }

    // Combine all prices
    const allPrices = new Map([...indianPrices, ...usPrices]);

    // Exchange rate for conversion (INR to USD)
    const INR_TO_USD = 1 / 83; // Approx rate

    // Calculate holdings with prices
    const holdingsWithPrices = portfolio.holdings.map((holding) => {
        const quote = allPrices.get(holding.symbol) || { c: 0, dp: 0 };
        const currentPrice = quote.c || holding.averagePrice;
        const isIndian = isIndianStock(holding.symbol);

        // Convert to USD for global totals
        const priceInUSD = isIndian ? (currentPrice * INR_TO_USD) : currentPrice;
        const avgPriceInUSD = isIndian ? (holding.averagePrice * INR_TO_USD) : holding.averagePrice;

        const totalValue = currentPrice * holding.quantity;
        const totalValueUSD = priceInUSD * holding.quantity;
        const totalCost = holding.averagePrice * holding.quantity;
        const totalCostUSD = avgPriceInUSD * holding.quantity;

        const profitLoss = totalValue - totalCost;
        const profitLossPercent = totalCost > 0 ? ((profitLoss / totalCost) * 100) : 0;

        return {
            ...holding,
            currentPrice,
            totalValue,
            totalValueUSD,
            totalCostUSD,
            profitLoss,
            profitLossPercent,
            currency: (isIndian ? 'INR' : 'USD') as 'INR' | 'USD'
        };
    });

    // Bucket aggregates
    const usdHoldings = holdingsWithPrices.filter(h => h.currency === 'USD');
    const inrHoldings = holdingsWithPrices.filter(h => h.currency === 'INR');

    const statsUSD: CurrencyStats = {
        invested: usdHoldings.reduce((sum, h) => sum + (h.totalCostUSD || 0), 0),
        currentValue: usdHoldings.reduce((sum, h) => sum + (h.totalValueUSD || 0), 0),
        profitLoss: 0,
        profitLossPercent: 0
    };
    statsUSD.profitLoss = statsUSD.currentValue - statsUSD.invested;
    statsUSD.profitLossPercent = statsUSD.invested > 0 ? (statsUSD.profitLoss / statsUSD.invested) * 100 : 0;

    const statsINR: CurrencyStats = {
        invested: inrHoldings.reduce((sum, h) => sum + (h.totalValue - h.profitLoss), 0),
        currentValue: inrHoldings.reduce((sum, h) => sum + h.totalValue, 0),
        profitLoss: 0,
        profitLossPercent: 0
    };
    statsINR.profitLoss = statsINR.currentValue - statsINR.invested;
    statsINR.profitLossPercent = statsINR.invested > 0 ? (statsINR.profitLoss / statsINR.invested) * 100 : 0;

    // Global totals (in USD)
    const totalInvestedUSD = holdingsWithPrices.reduce((sum, h) => sum + (h.totalCostUSD || 0), 0);
    const totalCurrentValueUSD = holdingsWithPrices.reduce((sum, h) => sum + (h.totalValueUSD || 0), 0);
    const totalProfitLossUSD = totalCurrentValueUSD - totalInvestedUSD;
    const totalProfitLossPercent = totalInvestedUSD > 0 ? (totalProfitLossUSD / totalInvestedUSD) * 100 : 0;

    return {
        ...portfolio,
        holdings: holdingsWithPrices,
        statsUSD,
        statsINR,
        totalInvested: totalInvestedUSD,
        totalCurrentValue: totalCurrentValueUSD,
        totalValue: portfolio.balance + totalCurrentValueUSD,
        totalProfitLoss: totalProfitLossUSD,
        totalProfitLossPercent,
    };
}

