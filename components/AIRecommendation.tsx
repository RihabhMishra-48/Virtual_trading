"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { getStockRecommendation } from "@/lib/actions/ai.actions";
import { cn } from "@/lib/utils";

interface AIRecommendationProps {
    symbol: string;
}

export default function AIRecommendation({ symbol }: AIRecommendationProps) {
    const [loading, setLoading] = useState(true);
    const [recommendation, setRecommendation] = useState<{
        verdict: 'Buy' | 'Sell' | 'Hold';
        reason: string;
        newsReferences: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getStockRecommendation(symbol);
                if (result.success && result.data) {
                    setRecommendation(result.data);
                } else {
                    setError(result.error || "Failed to get AI recommendation");
                }
            } catch (err) {
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchRecommendation();
        }
    }, [symbol]);

    if (loading) {
        return (
            <Card className="glass-card border-none text-foreground overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground animate-pulse">AI is analyzing latest news for {symbol}...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="glass-card border-none text-foreground">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <Info className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!recommendation) return null;

    const { verdict, reason, newsReferences } = recommendation;

    const getVerdictStyle = () => {
        switch (verdict.toLowerCase()) {
            case 'buy':
                return {
                    color: "text-[#16C784]",
                    bgColor: "bg-[#16C784]/10",
                    borderColor: "border-[#16C784]/20",
                    icon: <TrendingUp className="h-5 w-5" />
                };
            case 'sell':
                return {
                    color: "text-[#EA3943]",
                    bgColor: "bg-[#EA3943]/10",
                    borderColor: "border-[#EA3943]/20",
                    icon: <TrendingDown className="h-5 w-5" />
                };
            default:
                return {
                    color: "text-amber-500",
                    bgColor: "bg-amber-500/10",
                    borderColor: "border-amber-500/20",
                    icon: <Minus className="h-5 w-5" />
                };
        }
    };

    const style = getVerdictStyle();

    return (
        <Card className="glass-card border-none text-foreground overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                    <Brain className="h-4 w-4 text-purple-500" />
                    AI Recommendation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    style.bgColor,
                    style.borderColor
                )}>
                    <div className={cn("p-2 rounded-lg bg-background/50", style.color)}>
                        {style.icon}
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-black tracking-tighter opacity-70">AI Verdict</div>
                        <div className={cn("text-xl font-black italic tracking-tighter uppercase", style.color)}>
                            {verdict}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Reasoning</h4>
                    <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                        {reason}
                    </p>
                </div>

                {newsReferences && newsReferences.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key News Sources</h4>
                        <ul className="space-y-1.5">
                            {newsReferences.map((ref, idx) => (
                                <li key={idx} className="flex gap-2 text-[11px] leading-tight text-muted-foreground">
                                    <span className="text-purple-500 mt-0.5">•</span>
                                    {ref}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
