import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const script = searchParams.get('script');

    if (!script) {
        return new NextResponse('Script parameter is required', { status: 400 });
    }

    try {
        const tvUrl = `https://s3.tradingview.com/external-embedding/${script}`;
        const response = await fetch(tvUrl, {
            headers: {
                // Mimic a browser to avoid getting blocked
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.tradingview.com/',
            },
        });

        if (!response.ok) {
            throw new Error(`TradingView responded with ${response.status}`);
        }

        const scriptContent = await response.text();

        return new NextResponse(scriptContent, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Proxy Error:', error);
        return new NextResponse('Failed to fetch script', { status: 500 });
    }
}
