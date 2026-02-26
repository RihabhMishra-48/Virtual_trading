"use client";

import { useEffect, useState } from "react";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface LivePriceProps {
    symbol: string;
    initialPrice: number;
}

export default function LivePrice({ symbol, initialPrice }: LivePriceProps) {
    const [price, setPrice] = useState<number>(initialPrice);
    const [prevPrice, setPrevPrice] = useState<number>(initialPrice);
    const [change, setChange] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
                const data = await response.json();
                if (data.c && data.c > 0) {
                    setPrevPrice(price);
                    setPrice(data.c);
                    setChange(data.dp || 0);
                }
            } catch (error) {
                console.error("Failed to fetch live price:", error);
            }
        };

        const interval = setInterval(fetchPrice, 1000); // 1-second real-time update
        return () => clearInterval(interval);
    }, [symbol, price]);

    const isPositive = change >= 0;
    const priceColor = price > prevPrice ? 'text-green-500' : price < prevPrice ? 'text-red-500' : 'text-foreground';

    return (
        <div className="flex flex-col">
            <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-bold tracking-tighter ${priceColor} transition-colors duration-300 font-mono`}>
                    {formatPrice(price, getCurrencyForSymbol(symbol))}
                </span>
                <span className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'} bg-muted/50 px-2 py-0.5 rounded-full border border-border`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Live Market Data</span>
            </div>
        </div>
    );
}
