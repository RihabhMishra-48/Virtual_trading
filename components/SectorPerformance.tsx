"use client";

import { useState, useEffect } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface SectorData {
    name: string;
    performance: number;
    marketCap: string;
    volume: string;
}

const SECTOR_DATA: SectorData[] = [
    { name: "Technology", performance: 2.45, marketCap: "$12.4T", volume: "4.2B" },
    { name: "Financial Services", performance: 1.12, marketCap: "$8.2T", volume: "2.8B" },
    { name: "Healthcare", performance: 0.85, marketCap: "$6.5T", volume: "1.5B" },
    { name: "Consumer Cyclical", performance: -0.42, marketCap: "$5.8T", volume: "1.9B" },
    { name: "Communication Services", performance: 1.68, marketCap: "$5.2T", volume: "2.1B" },
    { name: "Industrials", performance: -0.15, marketCap: "$4.9T", volume: "1.2B" },
    { name: "Consumer Defensive", performance: 0.32, marketCap: "$4.5T", volume: "0.9B" },
    { name: "Energy", performance: 3.21, marketCap: "$3.8T", volume: "3.5B" },
    { name: "Real Estate", performance: -1.24, marketCap: "$1.8T", volume: "0.6B" },
    { name: "Utilities", performance: -0.56, marketCap: "$1.5T", volume: "0.4B" },
];

export default function SectorPerformance() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm h-full flex flex-col">
            <div className="flex flex-row items-center justify-between pb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Sectors
                    <Info className="h-3.5 w-3.5 opacity-30 cursor-help hover:opacity-100 transition-opacity" />
                </h3>
                <div className="text-[10px] font-black font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded uppercase tracking-tighter">
                    Change
                </div>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto pr-1">
                {SECTOR_DATA.sort((a, b) => b.performance - a.performance).map((sector) => {
                    const isPositive = sector.performance >= 0;
                    const absPerf = Math.abs(sector.performance);
                    const width = (absPerf / 4) * 100; // Normalized max width around 4%

                    return (
                        <div key={sector.name} className="group relative">
                            <div className="flex items-center justify-between mb-2 text-xs font-bold leading-none">
                                <span className="text-foreground/80 tracking-tight">{sector.name}</span>
                                <div className={cn(
                                    "flex items-center gap-1 font-mono tracking-tighter",
                                    isPositive ? "text-[#16C784]" : "text-[#EA3943]"
                                )}>
                                    {isPositive ? "+" : ""}
                                    <AnimatedNumber
                                        value={sector.performance}
                                        format={(v) => v.toFixed(2)}
                                    />
                                    %
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden relative shadow-inner">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 ease-out-expo absolute top-0",
                                        isPositive
                                            ? "bg-[#16C784]"
                                            : "bg-[#EA3943]"
                                    )}
                                    style={{
                                        width: isMounted ? `${Math.min(width, 100)}%` : '0%',
                                        left: isPositive ? '0' : 'auto',
                                        right: isPositive ? 'auto' : '0'
                                    }}
                                />
                            </div>

                            {/* Custom Tooltip on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 bg-popover border border-border/50 px-3 py-2.5 rounded-xl shadow-2xl z-20 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 min-w-[150px] backdrop-blur-xl">
                                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">{sector.name}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase">Market Cap</div>
                                    <div className="text-xs font-black font-mono text-foreground text-right">{sector.marketCap}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase">Volume</div>
                                    <div className="text-xs font-black font-mono text-foreground text-right">{sector.volume}</div>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-popover border-b border-r border-border/50 rotate-45 shadow-sm" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
