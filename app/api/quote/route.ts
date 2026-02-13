import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return NextResponse.json({ error: "Symbol required", c: 0, dp: 0 }, { status: 400 });
    }

    try {
        // Check if it's an Indian stock (NSE/BSE)
        const isIndianStock = symbol.endsWith('.NS') || symbol.endsWith('.BO');

        if (isIndianStock) {
            // Use Yahoo Finance for Indian stocks
            const yahooSymbol = symbol;
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

            const response = await fetch(yahooUrl, { cache: 'no-store' });

            if (!response.ok) {
                console.error(`Yahoo Finance API error: ${response.status}`);
                return NextResponse.json({ c: 0, dp: 0, error: "Yahoo API error" }, { status: response.status });
            }

            const data = await response.json();
            const quote = data?.chart?.result?.[0]?.meta;

            if (!quote || !quote.regularMarketPrice) {
                console.error("No price data from Yahoo Finance");
                return NextResponse.json({ c: 0, dp: 0, error: "No price data" }, { status: 404 });
            }

            // Convert Yahoo Finance format to Finnhub-like format
            return NextResponse.json({
                c: quote.regularMarketPrice || 0,
                h: quote.regularMarketDayHigh || quote.regularMarketPrice || 0,
                l: quote.regularMarketDayLow || quote.regularMarketPrice || 0,
                o: quote.regularMarketOpen || quote.regularMarketPrice || 0,
                pc: quote.previousClose || quote.regularMarketPrice || 0,
                dp: quote.regularMarketChangePercent || 0,
                t: Date.now()
            });
        } else {
            // Use Finnhub for US stocks
            const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

            if (!token) {
                console.error("No Finnhub API key found");
                return NextResponse.json({ c: 0, dp: 0, error: "No API key" }, { status: 500 });
            }

            const response = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
                { cache: 'no-store' }
            );

            if (!response.ok) {
                console.error(`Finnhub API error: ${response.status}`);
                return NextResponse.json({ c: 0, dp: 0, error: "API error" }, { status: response.status });
            }

            const data = await response.json();

            // Ensure we always return valid data
            return NextResponse.json({
                c: data.c || 0,
                h: data.h || 0,
                l: data.l || 0,
                o: data.o || 0,
                pc: data.pc || 0,
                dp: data.dp || 0,
                t: data.t || Date.now()
            });
        }
    } catch (error) {
        console.error("Quote fetch error:", error);
        return NextResponse.json({ c: 0, dp: 0, error: "Failed to fetch" }, { status: 500 });
    }
}
