"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Activity, Coins } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CurrencyStats {
    invested: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

interface PortfolioStats {
    balance: number;
    totalInvested: number;
    totalCurrentValue: number;
    totalValue: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
    statsUSD: CurrencyStats;
    statsINR: CurrencyStats;
}

interface PortfolioOverviewProps {
    stats: PortfolioStats;
    loading?: boolean;
}

export default function PortfolioOverview({ stats, loading }: PortfolioOverviewProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-card border-none text-foreground relative overflow-hidden group h-32">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const isUSDProfit = stats.statsUSD.profitLoss >= 0;
    const isINRProfit = stats.statsINR.profitLoss >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Buying Power */}
            <Card className="glass-card border-none text-foreground relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet className="h-16 w-16 text-blue-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Buying Power
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{formatPrice(stats.balance)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Available to trade</p>
                </CardContent>
            </Card>

            {/* Total Value (Global) */}
            <Card className="glass-card border-none text-foreground relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="h-16 w-16 text-cyan-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Total Net Worth
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{formatPrice(stats.totalValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Global valuation (USD)</p>
                </CardContent>
            </Card>

            {/* USD P&L */}
            <Card className={`glass-card border-none text-foreground relative overflow-hidden group ${isUSDProfit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {isUSDProfit ? (
                        <TrendingUp className="h-16 w-16 text-green-500" />
                    ) : (
                        <TrendingDown className="h-16 w-16 text-red-500" />
                    )}
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {isUSDProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        USD P&L
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold tracking-tight ${isUSDProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {isUSDProfit ? '+' : ''}{formatPrice(stats.statsUSD.profitLoss, 'USD')}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${isUSDProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isUSDProfit ? '+' : ''}{stats.statsUSD.profitLossPercent.toFixed(2)}%
                    </p>
                </CardContent>
            </Card>

            {/* INR P&L */}
            <Card className={`glass-card border-none text-foreground relative overflow-hidden group ${isINRProfit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className={`h-16 w-16 ${isINRProfit ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        INR P&L
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold tracking-tight ${isINRProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {isINRProfit ? '+' : ''}{formatPrice(stats.statsINR.profitLoss, 'INR')}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${isINRProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isINRProfit ? '+' : ''}{stats.statsINR.profitLossPercent.toFixed(2)}%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
