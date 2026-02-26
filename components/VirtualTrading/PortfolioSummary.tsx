"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Loader2, Coins } from "lucide-react";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { getPortfolioWithLivePrices, topUpBalance } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

interface PortfolioSummaryProps {
    userId: string;
}

export default function PortfolioSummary({ userId }: PortfolioSummaryProps) {
    const [portfolio, setPortfolio] = useState<IPortfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [toppingUp, setToppingUp] = useState(false);

    const fetchPortfolio = async () => {
        try {
            const data = await getPortfolioWithLivePrices(userId) as IPortfolio;
            setPortfolio(data);
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [userId]);

    const handleTopUp = async () => {
        setToppingUp(true);
        try {
            // Simulate a payment or reward
            await topUpBalance(userId, 10000);
            toast.success("Successfully added $10,000 to your virtual wallet!");
            await fetchPortfolio();
        } catch (error) {
            toast.error("Failed to top up balance.");
        } finally {
            setToppingUp(false);
        }
    };

    if (loading) {
        return (
            <Card className="glass-card border-none text-foreground h-full flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </Card>
        )
    }

    if (!portfolio) return null;

    const totalValue = portfolio.totalValue;
    const totalProfitPercent = portfolio.totalProfitLossPercent;
    const isProfit = portfolio.totalProfitLoss >= 0;

    return (
        <Card className="glass-card border-none text-foreground h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coins className="h-24 w-24 text-blue-500 transform rotate-12" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    Virtual Portfolio
                </CardTitle>
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/20 text-blue-400 h-8 gap-1"
                    onClick={handleTopUp}
                    disabled={toppingUp}
                >
                    {toppingUp ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    Top Up
                </Button>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Buying Power</p>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                            {formatPrice(portfolio.balance)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Net Worth</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold tracking-tight text-foreground">
                                {formatPrice(totalValue)}
                            </p>
                            <span className={`text-xs font-medium flex items-center ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                {isProfit ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {totalProfitPercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Currency P&L Breakdown */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">USD Profit</p>
                        <p className={`text-sm font-bold ${portfolio.statsUSD.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {portfolio.statsUSD.profitLoss >= 0 ? '+' : ''}{formatPrice(portfolio.statsUSD.profitLoss, 'USD')}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">INR Profit</p>
                        <p className={`text-sm font-bold ${portfolio.statsINR.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {portfolio.statsINR.profitLoss >= 0 ? '+' : ''}{formatPrice(portfolio.statsINR.profitLoss, 'INR')}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Holdings ({portfolio.holdings.length})</h4>
                    {portfolio.holdings.length === 0 ? (
                        <div className="text-center py-4 bg-muted/40 rounded-lg border border-border">
                            <TrendingUp className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No active trades yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            {portfolio.holdings.map((holding: PortfolioHolding) => (
                                <div key={holding.symbol} className="flex items-center justify-between p-2 rounded bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-foreground">{holding.symbol}</span>
                                        <span className="text-xs text-muted-foreground">{holding.quantity} qty</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-foreground">
                                            {formatPrice(holding.currentPrice * holding.quantity, getCurrencyForSymbol(holding.symbol))}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Avg: {formatPrice(holding.averagePrice, getCurrencyForSymbol(holding.symbol))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
