"use client";

import { useState } from "react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPortfolioWithLivePrices, getTransactionHistory } from "@/lib/actions/portfolio.actions";
import PortfolioOverview from "@/components/VirtualTrading/PortfolioOverview";
import HoldingsTable from "@/components/VirtualTrading/HoldingsTable";
import TransactionHistory from "@/components/VirtualTrading/TransactionHistory";
import QuickTradePanel from "@/components/VirtualTrading/QuickTradePanel";

interface TradingClientProps {
    userId: string;
    initialPortfolio: any;
    initialTransactions: any[];
}

export default function TradingClient({ userId, initialPortfolio, initialTransactions }: TradingClientProps) {
    const [portfolio, setPortfolio] = useState(initialPortfolio);
    const [transactions, setTransactions] = useState(initialTransactions);

    const refreshData = async () => {
        // Refresh portfolio and transactions after trade
        const newPortfolio = await getPortfolioWithLivePrices(userId);
        const newTransactions = await getTransactionHistory(userId, 20);
        setPortfolio(newPortfolio);
        setTransactions(newTransactions);
    };

    const stats = {
        balance: portfolio.balance,
        totalInvested: portfolio.totalInvested || 0,
        totalCurrentValue: portfolio.totalCurrentValue || 0,
        totalValue: portfolio.totalValue || portfolio.balance,
        totalProfitLoss: portfolio.totalProfitLoss || 0,
        totalProfitLossPercent: portfolio.totalProfitLossPercent || 0,
    };

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Trading Dashboard</h1>
                        <p className="text-gray-400">Manage your virtual portfolio and track performance</p>
                    </div>
                </div>

                {/* Portfolio Stats */}
                <PortfolioOverview stats={stats} />

                {/* Quick Trade + Holdings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Trade Panel */}
                    <div className="lg:col-span-1">
                        <QuickTradePanel userId={userId} onTradeComplete={refreshData} />
                    </div>

                    {/* Holdings */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4">Your Holdings</h2>
                        <HoldingsTable holdings={portfolio.holdings} userId={userId} onTradeComplete={refreshData} />
                    </div>
                </div>

                {/* Transaction History */}
                <TransactionHistory transactions={transactions} />
            </div>
        </div>
    );
}
