"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PortfolioStats {
    balance: number;
    totalInvested: number;
    totalCurrentValue: number;
    totalValue: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
}

interface PortfolioOverviewProps {
    stats: PortfolioStats;
}

export default function PortfolioOverview({ stats }: PortfolioOverviewProps) {
    const isProfit = stats.totalProfitLoss >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Buying Power */}
            <Card className="glass-card border-none text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet className="h-16 w-16 text-blue-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Buying Power
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{formatPrice(stats.balance)}</div>
                    <p className="text-xs text-gray-500 mt-1">Available to trade</p>
                </CardContent>
            </Card>

            {/* Total Invested */}
            <Card className="glass-card border-none text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="h-16 w-16 text-purple-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Invested
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{formatPrice(stats.totalInvested)}</div>
                    <p className="text-xs text-gray-500 mt-1">Cost basis</p>
                </CardContent>
            </Card>

            {/* Current Value */}
            <Card className="glass-card border-none text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="h-16 w-16 text-cyan-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Portfolio Value
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{formatPrice(stats.totalCurrentValue)}</div>
                    <p className="text-xs text-gray-500 mt-1">Current holdings</p>
                </CardContent>
            </Card>

            {/* Total P&L */}
            <Card className={`glass-card border-none text-white relative overflow-hidden group ${isProfit ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {isProfit ? (
                        <TrendingUp className="h-16 w-16 text-green-500" />
                    ) : (
                        <TrendingDown className="h-16 w-16 text-red-500" />
                    )}
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        Total P&L
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold tracking-tight ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {isProfit ? '+' : ''}{formatPrice(stats.totalProfitLoss)}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{stats.totalProfitLossPercent.toFixed(2)}%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
