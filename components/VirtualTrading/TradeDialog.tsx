"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { executeTrade, getPortfolio } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

interface TradeDialogProps {
    symbol: string;
    currentPrice: number;
    userId: string;
}

export default function TradeDialog({ symbol, currentPrice, userId }: TradeDialogProps) {
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState<string>("1");
    const [loading, setLoading] = useState(false);
    const [portfolio, setPortfolio] = useState<IPortfolio | null>(null);
    const [livePrice, setLivePrice] = useState<number>(currentPrice);
    const [priceLoading, setPriceLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadPortfolio();
            refreshPrice();

            // Refresh price every 1 second while dialog is open
            const interval = setInterval(refreshPrice, 1000);
            return () => clearInterval(interval);
        }
    }, [open]);

    const loadPortfolio = async () => {
        const p = await getPortfolio(userId);
        setPortfolio(p);
    };

    const refreshPrice = async () => {
        setPriceLoading(true);
        try {
            const response = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
            const data = await response.json();
            if (data.c && data.c > 0) {
                setLivePrice(data.c);
            }
        } catch (error) {
            console.error("Failed to refresh price:", error);
        } finally {
            setPriceLoading(false);
        }
    };

    const getHolding = () => {
        return portfolio?.holdings.find(h => h.symbol === symbol)?.quantity || 0;
    };

    const handleTrade = async (type: 'BUY' | 'SELL') => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setLoading(true);
        try {
            // Always use the latest live price
            const result = await executeTrade(userId, symbol, type, qty, livePrice);

            if (result.success) {
                toast.success(`Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${qty} shares of ${symbol} at ${formatPrice(livePrice, getCurrencyForSymbol(symbol))}`);
                setOpen(false);
            } else {
                toast.error(result.error || "Trade failed");
            }
        } catch (error) {
            toast.error("An error occurred executing the trade");
        } finally {
            setLoading(false);
        }
    };

    const totalCost = (parseInt(quantity) || 0) * livePrice;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg shadow-lg shadow-blue-900/20">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Trade {symbol}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        Trade <span className="text-blue-500 font-bold">{symbol}</span>
                        <span className="text-sm font-normal text-muted-foreground ml-auto bg-muted px-3 py-1 rounded-full border border-border flex items-center gap-2">
                            {formatPrice(livePrice, getCurrencyForSymbol(symbol))}
                            {priceLoading && <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted">
                        <TabsTrigger value="buy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Buy</TabsTrigger>
                        <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Sell</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-4">
                        {/* Balance Info */}
                        <div className="flex justify-between items-center text-sm px-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Buying Power
                            </span>
                            <span className="font-mono font-medium text-foreground">{formatPrice(portfolio?.balance || 0, getCurrencyForSymbol(symbol))}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm px-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Your Position
                            </span>
                            <span className="font-mono font-medium text-foreground">{getHolding()} shares</span>
                        </div>

                        {/* Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Quantity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="bg-muted/20 border-border text-foreground text-lg h-12 pl-4 pr-12 focus-visible:ring-blue-500/50"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                                    qty
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2 border border-border/50">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Estimated Total</span>
                                <span className="text-foreground font-bold">{formatPrice(totalCost, getCurrencyForSymbol(symbol))}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <TabsContent value="buy">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                                onClick={() => handleTrade('BUY')}
                                disabled={loading || totalCost > (portfolio?.balance || 0)}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Buy ${symbol}`}
                            </Button>
                            {totalCost > (portfolio?.balance || 0) && (
                                <p className="text-xs text-red-500 text-center mt-2">Insufficient funds</p>
                            )}
                        </TabsContent>

                        <TabsContent value="sell">
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                                onClick={() => handleTrade('SELL')}
                                disabled={loading || parseInt(quantity) > getHolding()}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Sell ${symbol}`}
                            </Button>
                            {parseInt(quantity) > getHolding() && (
                                <p className="text-xs text-red-500 text-center mt-2">Insufficient shares</p>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
