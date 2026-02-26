"use client";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";

interface WatchlistItem {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

const MOCK_WATCHLIST: WatchlistItem[] = [
    { symbol: "AAPL", price: 182.52, change: 1.25, changePercent: 0.69 },
    { symbol: "TSLA", price: 238.45, change: -4.30, changePercent: -1.77 },
    { symbol: "RELIANCE", price: 2950.40, change: 15.20, changePercent: 0.52 },
    { symbol: "HDFCBANK", price: 1640.15, change: -12.45, changePercent: -0.75 },
    { symbol: "MSFT", price: 405.12, change: 2.15, changePercent: 0.53 },
];

export default function Watchlist() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">My Watchlist</h3>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded uppercase tracking-tighter">5 Items</span>
            </div>

            <div className="space-y-1">
                {MOCK_WATCHLIST.map((item) => {
                    const isPositive = item.change >= 0;
                    return (
                        <div key={item.symbol} className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-1 h-6 rounded-full transition-all group-hover:h-8",
                                    isPositive ? "bg-[#16C784]" : "bg-[#EA3943]"
                                )} />
                                <div>
                                    <div className="text-sm font-black tracking-tight leading-none mb-1">{item.symbol}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">NSE</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-sm font-black tracking-tighter leading-none mb-1 font-mono">
                                        <AnimatedNumber
                                            value={item.price}
                                            format={(v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        />
                                    </div>
                                    <div className={cn(
                                        "text-[10px] font-bold flex items-center justify-end gap-1",
                                        isPositive ? "text-[#16C784]" : "text-[#EA3943]"
                                    )}>
                                        {isPositive ? "+" : ""}<AnimatedNumber value={item.changePercent} format={(v) => v.toFixed(2)} />%
                                    </div>
                                </div>
                                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#EA3943] hover:bg-[#EA3943]/10 rounded-lg">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="mt-6 w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all border border-transparent hover:border-border/50">
                Manage Watchlist
            </button>
        </div>
    );
}
