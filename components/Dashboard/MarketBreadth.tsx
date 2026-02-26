"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";

interface MarketBreadthProps {
    advances: number;
    declines: number;
    unchanged: number;
}

export default function MarketBreadth({ advances, declines, unchanged }: MarketBreadthProps) {
    const total = advances + declines + unchanged;
    const advancePercent = (advances / total) * 100;
    const declinePercent = (declines / total) * 100;
    const unchangedPercent = (unchanged / total) * 100;

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Market Breadth</h3>
                <span className="text-[10px] font-mono text-muted-foreground italic">NIFTY 500</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center group">
                    <div className="text-xs font-bold text-[#16C784] uppercase tracking-tighter mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Advances</div>
                    <div className="text-2xl font-black tracking-tighter text-[#16C784]">
                        <AnimatedNumber value={advances} />
                    </div>
                </div>
                <div className="text-center group">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Unchanged</div>
                    <div className="text-2xl font-black tracking-tighter text-muted-foreground">
                        <AnimatedNumber value={unchanged} />
                    </div>
                </div>
                <div className="text-center group">
                    <div className="text-xs font-bold text-[#EA3943] uppercase tracking-tighter mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Declines</div>
                    <div className="text-2xl font-black tracking-tighter text-[#EA3943]">
                        <AnimatedNumber value={declines} />
                    </div>
                </div>
            </div>

            <div className="relative h-2.5 w-full bg-muted/30 rounded-full overflow-hidden flex shadow-inner">
                <div
                    className="h-full bg-[#16C784] transition-all duration-1000 ease-out-expo relative group"
                    style={{ width: `${advancePercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div
                    className="h-full bg-muted transition-all duration-1000 ease-out-expo relative group"
                    style={{ width: `${unchangedPercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div
                    className="h-full bg-[#EA3943] transition-all duration-1000 ease-out-expo relative group"
                    style={{ width: `${declinePercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">
                <span>{advancePercent.toFixed(1)}% Up</span>
                <span>{declinePercent.toFixed(1)}% Down</span>
            </div>
        </div>
    );
}
