"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndexCardProps {
    name: string;
    value: number;
    change: number;
    changePercent: number;
    sparklineData?: number[];
}

export default function IndexCard({ name, value, change, changePercent, sparklineData = [30, 40, 35, 50, 49, 60, 70, 91, 125] }: IndexCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="bg-card hover:bg-accent/50 transition-all duration-300 border border-border/50 rounded-2xl p-4 shadow-sm group hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{name}</span>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isPositive ? "bg-[#16C784]/10 text-[#16C784]" : "bg-[#EA3943]/10 text-[#EA3943]"
                )}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-black tracking-tighter mb-0.5">
                        <AnimatedNumber
                            value={value}
                            format={(v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        />
                    </div>
                    <div className={cn(
                        "text-[11px] font-bold font-mono",
                        isPositive ? "text-[#16C784]" : "text-[#EA3943]"
                    )}>
                        {isPositive ? "+" : ""}{change.toFixed(2)}
                    </div>
                </div>

                {/* Simple SVG Sparkline */}
                <div className="w-20 h-10 opacity-50 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 100 40" className="w-full h-full rotate-0">
                        <path
                            d={`M ${sparklineData.map((d, i) => `${(i / (sparklineData.length - 1)) * 100} ${40 - (d / Math.max(...sparklineData)) * 35}`).join(' L ')}`}
                            fill="none"
                            stroke={isPositive ? "#16C784" : "#EA3943"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
