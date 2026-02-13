"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Loader2, Coins } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getPortfolio, topUpBalance } from "@/lib/actions/portfolio.actions";
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
            const data = await getPortfolio(userId);
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
            <Card className="glass-card border-none text-white h-full flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </Card>
        )
    }

    if (!portfolio) return null;

    // Calculate total value (mock calculation for now, ideally would fetch real-time prices for holdings)
    // For this MVP, we will just show Balance + Cost basis of holdings as "Total Value" 
    // ensuring we don't break if price APIs are rate limited.
    // In a real app, we'd fetch current prices for all holdings here.
    const holdingsValue = portfolio.holdings.reduce((acc, h) => acc + (h.quantity * h.averagePrice), 0);
    const totalValue = portfolio.balance + holdingsValue;
    const totalProfit = 0; // Placeholder for now until we integrate real-time price updates for the whole portfolio

    return (
        <Card className="glass-card border-none text-white h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coins className="h-24 w-24 text-blue-500 transform rotate-12" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-gray-200 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-400" />
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
                        <p className="text-sm text-gray-400">Buying Power</p>
                        <p className="text-2xl font-bold tracking-tight text-white">
                            {formatPrice(portfolio.balance)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-400">Total Net Worth</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold tracking-tight text-white">
                                {formatPrice(totalValue)}
                            </p>
                            {/* Placeholder for daily change */}
                            <span className="text-xs font-medium text-green-500 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                +0.00%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Your Holdings ({portfolio.holdings.length})</h4>
                    {portfolio.holdings.length === 0 ? (
                        <div className="text-center py-4 bg-white/5 rounded-lg border border-white/5">
                            <TrendingUp className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No active trades yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            {portfolio.holdings.map((holding) => (
                                <div key={holding.symbol} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white">{holding.symbol}</span>
                                        <span className="text-xs text-gray-500">{holding.quantity} qty</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-200">
                                            {formatPrice(holding.averagePrice * holding.quantity)}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            Avg: {formatPrice(holding.averagePrice)}
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
