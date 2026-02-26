"use client";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockItem {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    logo?: string;
}

interface StockListCardProps {
    title: string;
    stocks: StockItem[];
    type: 'gainers' | 'losers';
}

export default function StockListCard({ title, stocks, type }: StockListCardProps) {
    const isGainers = type === 'gainers';

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{title}</h3>
                <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                    isGainers ? "bg-[#16C784]/10 text-[#16C784]" : "bg-[#EA3943]/10 text-[#EA3943]"
                )}>
                    {isGainers ? "Hot" : "Cold"}
                </div>
            </div>

            <div className="space-y-4 flex-grow">
                {stocks.map((stock) => (
                    <div key={stock.symbol} className="group cursor-pointer flex items-center justify-between p-2 rounded-xl hover:bg-accent/50 transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:scale-110 transition-transform">
                                {stock.symbol[0]}
                            </div>
                            <div>
                                <div className="text-sm font-black tracking-tight leading-none mb-1">{stock.symbol}</div>
                                <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[80px]">{stock.name}</div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-black tracking-tighter leading-none mb-1.5 font-mono">
                                <AnimatedNumber
                                    value={stock.price}
                                    format={(v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                />
                            </div>
                            <div className={cn(
                                "text-[10px] font-bold flex items-center justify-end gap-1",
                                isGainers ? "text-[#16C784]" : "text-[#EA3943]"
                            )}>
                                {isGainers ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {isGainers ? "+" : ""}<AnimatedNumber value={stock.changePercent} format={(v) => v.toFixed(2)} />%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-6 w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all border border-transparent hover:border-border/50">
                View All {title}
            </button>
        </div>
    );
}
