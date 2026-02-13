'use server';

import { isIndianStock } from '@/lib/utils';

/**
 * Yahoo Finance API helper for Indian Stocks
 * This uses the query2.finance.yahoo.com/v8/finance/chart endpoint which is stable.
 */

const YAHOO_CHART_BASE = 'https://query2.finance.yahoo.com/v8/finance/chart';

/**
 * Fetch quote for a single Indian stock using Yahoo Finance Chart API
 */
export async function getIndianStockQuote(symbol: string): Promise<QuoteData> {
    try {
        const formattedSymbol = symbol.toUpperCase();
        const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(formattedSymbol)}`;

        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!response.ok) {
            console.error(`Yahoo Chart API error: ${response.status} for ${formattedSymbol}`);
            return { c: 0, dp: 0 };
        }

        const data = await response.json();

        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            console.error(`No chart data found on Yahoo Finance for ${formattedSymbol}`);
            return { c: 0, dp: 0 };
        }

        const meta = data.chart.result[0].meta;
        const currentPrice = meta.regularMarketPrice || 0;
        const previousClose = meta.chartPreviousClose || currentPrice;

        let percentChange = 0;
        if (previousClose > 0) {
            percentChange = ((currentPrice - previousClose) / previousClose) * 100;
        }

        return {
            c: currentPrice,
            dp: percentChange,
        };
    } catch (error) {
        console.error('Error fetching Yahoo stock quote:', error);
        return { c: 0, dp: 0 };
    }
}

/**
 * Fetch quotes for multiple Indian stocks using parallel fetches
 */
export async function getMultipleIndianStocks(symbols: string[]): Promise<Map<string, QuoteData>> {
    const results = new Map<string, QuoteData>();

    if (symbols.length === 0) return results;

    try {
        await Promise.all(
            symbols.map(async (symbol) => {
                const quote = await getIndianStockQuote(symbol);
                results.set(symbol, quote);
            })
        );

        return results;
    } catch (error) {
        console.error('Error fetching multiple Yahoo stocks:', error);
        symbols.forEach(sym => {
            if (!results.has(sym)) {
                results.set(sym, { c: 0, dp: 0 });
            }
        });
        return results;
    }
}
