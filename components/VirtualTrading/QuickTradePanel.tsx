"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Loader2, DollarSign } from "lucide-react";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { executeTrade, getPortfolio } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

interface QuickTradePanelProps {
    userId: string;
    onTradeComplete?: () => void;
}

export default function QuickTradePanel({ userId, onTradeComplete }: QuickTradePanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<StockWithWatchlistStatus[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedStock, setSelectedStock] = useState<StockWithWatchlistStatus | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<string>("1");
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [loadingPrice, setLoadingPrice] = useState(false);

    useEffect(() => {
        loadBalance();
    }, []);

    const loadBalance = async () => {
        const portfolio = await getPortfolio(userId);
        setBalance(portfolio.balance);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const results = await searchStocks(searchQuery);
            setSearchResults(results);
        } catch (error) {
            toast.error("Failed to search stocks");
        } finally {
            setSearching(false);
        }
    };

    const selectStock = async (stock: StockWithWatchlistStatus) => {
        setSelectedStock(stock);
        setSearchResults([]);
        setSearchQuery("");

        // Fetch current price
        setLoadingPrice(true);
        try {
            const response = await fetch(`/api/quote?symbol=${encodeURIComponent(stock.symbol)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Quote data:", data);

            if (data.c && data.c > 0) {
                setCurrentPrice(data.c);
            } else {
                // Fallback: try to get from server action
                const { getStockQuote } = await import("@/lib/actions/finnhub.actions");
                const quote = await getStockQuote(stock.symbol);
                setCurrentPrice(quote.c || 100); // Default to 100 if no price

                if (!quote.c) {
                    toast.error(`Could not fetch live price for ${stock.symbol}. Using default price.`);
                }
            }
        } catch (error) {
            console.error("Error fetching price:", error);
            toast.error("Failed to fetch live price. Using default.");
            setCurrentPrice(100); // Default fallback price
        } finally {
            setLoadingPrice(false);
        }
    };

    const handleTrade = async (type: 'BUY' | 'SELL') => {
        if (!selectedStock) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setLoading(true);
        try {
            const result = await executeTrade(userId, selectedStock.symbol, type, qty, currentPrice);

            if (result.success) {
                toast.success(`Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${qty} shares of ${selectedStock.symbol}`);
                setQuantity("1");
                await loadBalance();
                onTradeComplete?.();
            } else {
                toast.error(result.error || "Trade failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const totalCost = (parseInt(quantity) || 0) * currentPrice;

    return (
        <Card className="glass-card border-none text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Quick Trade
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                {!selectedStock && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search stocks (e.g., AAPL, TSLA)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 bg-gray-900/50 border-gray-800 text-white"
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={searching} className="bg-blue-600 hover:bg-blue-700">
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                            </Button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="bg-gray-900/50 rounded-lg border border-gray-800 max-h-60 overflow-y-auto">
                                {searchResults.map((stock) => (
                                    <button
                                        key={stock.symbol}
                                        onClick={() => selectStock(stock)}
                                        className="w-full p-3 hover:bg-white/5 transition-colors text-left border-b border-gray-800/50 last:border-0"
                                    >
                                        <div className="font-bold text-white">{stock.symbol}</div>
                                        <div className="text-sm text-gray-400">{stock.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Stock Trading */}
                {selectedStock && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
                            <div>
                                <div className="font-bold text-xl text-white">{selectedStock.symbol}</div>
                                <div className="text-sm text-gray-400">{selectedStock.name}</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedStock(null);
                                    setCurrentPrice(0);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                Change
                            </Button>
                        </div>

                        {loadingPrice ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-sm px-1">
                                    <span className="text-gray-400">Current Price</span>
                                    <span className="font-mono font-bold text-white text-lg">{formatPrice(currentPrice, getCurrencyForSymbol(selectedStock.symbol))}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm px-1">
                                    <span className="text-gray-400">Buying Power</span>
                                    <span className="font-mono font-medium text-white">{formatPrice(balance, getCurrencyForSymbol(selectedStock.symbol))}</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Quantity</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="bg-gray-900/50 border-gray-800 text-white text-lg h-12"
                                    />
                                </div>

                                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Estimated Total</span>
                                        <span className="text-white font-bold">{formatPrice(totalCost, getCurrencyForSymbol(selectedStock.symbol))}</span>
                                    </div>
                                </div>

                                <Tabs defaultValue="buy" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
                                        <TabsTrigger value="buy">Buy</TabsTrigger>
                                        <TabsTrigger value="sell">Sell</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="buy" className="mt-4">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                                            onClick={() => handleTrade('BUY')}
                                            disabled={loading || totalCost > balance || currentPrice === 0}
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Buy ${selectedStock.symbol}`}
                                        </Button>
                                        {totalCost > balance && (
                                            <p className="text-xs text-red-500 text-center mt-2">Insufficient funds</p>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="sell" className="mt-4">
                                        <Button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                                            onClick={() => handleTrade('SELL')}
                                            disabled={loading || currentPrice === 0}
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Sell ${selectedStock.symbol}`}
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
