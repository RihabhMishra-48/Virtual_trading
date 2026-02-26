"use client";

import { useEffect, useState } from "react";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TradeDialog from "./TradeDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Holding {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

interface HoldingsTableProps {
    holdings: Holding[];
    userId: string;
    onTradeComplete?: () => void;
    loading?: boolean;
}

export default function HoldingsTable({ holdings, userId, onTradeComplete, loading }: HoldingsTableProps) {
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});

    // Poll for live prices every 10 seconds
    useEffect(() => {
        if (holdings.length === 0 || loading) return;

        const fetchPrices = async () => {
            const prices: Record<string, number> = {};

            await Promise.all(
                holdings.map(async (holding) => {
                    try {
                        const response = await fetch(`/api/quote?symbol=${encodeURIComponent(holding.symbol)}`);
                        const data = await response.json();
                        if (data.c && data.c > 0) {
                            prices[holding.symbol] = data.c;
                        } else {
                            prices[holding.symbol] = holding.currentPrice;
                        }
                    } catch (error) {
                        prices[holding.symbol] = holding.currentPrice;
                    }
                })
            );

            setLivePrices(prices);
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 1000); // Update every 1 second

        return () => clearInterval(interval);
    }, [holdings, loading]);

    if (loading) {
        return (
            <div className="glass-card border-none rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg Price</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">LTP</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">P&L</th>
                                <th className="text-center p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Chart</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b border-border/50">
                                    <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-12 ml-auto" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                                    <td className="p-4"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (holdings.length === 0) {
        return (
            <div className="glass-card border-none rounded-lg p-12 text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground/80 mb-2">No Holdings Yet</h3>
                <p className="text-muted-foreground">Start trading to build your portfolio</p>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card border-none rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg Price</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">LTP</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">P&L</th>
                                <th className="text-center p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Chart</th>
                                <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((holding) => {
                                const livePrice = livePrices[holding.symbol] || holding.currentPrice;
                                const currentValue = livePrice * holding.quantity;
                                const costBasis = holding.averagePrice * holding.quantity;
                                const profitLoss = currentValue - costBasis;
                                const profitLossPercent = (profitLoss / costBasis) * 100;
                                const isProfit = profitLoss >= 0;

                                return (
                                    <tr key={holding.symbol} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <span className="font-bold text-foreground">{holding.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-foreground/80 font-medium">{holding.quantity}</td>
                                        <td className="p-4 text-right text-muted-foreground font-mono text-sm">{formatPrice(holding.averagePrice, getCurrencyForSymbol(holding.symbol))}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-mono font-bold">{formatPrice(livePrice, getCurrencyForSymbol(holding.symbol))}</span>
                                                <span className="text-xs text-muted-foreground/60">Live</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-foreground font-bold">{formatPrice(currentValue, getCurrencyForSymbol(holding.symbol))}</td>
                                        <td className="p-4 text-right">
                                            <div className={`flex flex-col items-end ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                <span className="font-bold flex items-center gap-1">
                                                    {isProfit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                    {isProfit ? '+' : ''}{formatPrice(profitLoss, getCurrencyForSymbol(holding.symbol))}
                                                </span>
                                                <span className="text-xs font-medium">
                                                    {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <a
                                                href={`/stocks/${holding.symbol}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                                View
                                            </a>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSymbol(holding.symbol);
                                                    setSelectedPrice(livePrice);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                            >
                                                Trade
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSymbol && (
                <TradeDialog
                    symbol={selectedSymbol}
                    currentPrice={selectedPrice}
                    userId={userId}
                />
            )}
        </>
    );
}
