"use client";

import { formatTimeAgo, formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Plus, Clock } from "lucide-react";

interface Transaction {
    _id?: string;
    symbol: string;
    type: 'BUY' | 'SELL' | 'DEPOSIT';
    quantity: number;
    price: number;
    totalAmount: number;
    date: Date;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
    if (transactions.length === 0) {
        return (
            <div className="glass-card border-none rounded-lg p-12 text-center">
                <Clock className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground/80 mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground">Your trading history will appear here</p>
            </div>
        );
    }

    return (
        <div className="glass-card border-none rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Transaction History
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                            <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                            <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                            <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                            <th className="text-right p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, idx) => {
                            const isBuy = tx.type === 'BUY';
                            const isDeposit = tx.type === 'DEPOSIT';

                            return (
                                <tr key={tx._id || idx} className="border-b border-border/50 hover:bg-accent transition-colors">
                                    <td className="p-4 text-muted-foreground text-sm">
                                        {formatTimeAgo(new Date(tx.date).getTime() / 1000)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${isDeposit ? 'bg-purple-500/10 text-purple-400' :
                                            isBuy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {isDeposit ? <Plus className="h-3 w-3" /> :
                                                isBuy ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-foreground font-bold">{tx.symbol}</td>
                                    <td className="p-4 text-right text-foreground/70 font-medium">{tx.quantity}</td>
                                    <td className="p-4 text-right text-muted-foreground font-mono text-sm">{formatPrice(tx.price, getCurrencyForSymbol(tx.symbol))}</td>
                                    <td className="p-4 text-right text-foreground font-bold">{formatPrice(tx.totalAmount, tx.type === 'DEPOSIT' ? 'USD' : getCurrencyForSymbol(tx.symbol))}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
