import TradingViewWidget from "@/components/TradingViewWidget";
import {
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import MarketStatus from "@/components/Dashboard/MarketStatus";
import IndexCard from "@/components/Dashboard/IndexCard";
import SectorPerformance from "@/components/SectorPerformance";
import StockListCard from "@/components/Dashboard/StockListCard";
import MarketBreadth from "@/components/Dashboard/MarketBreadth";
import Watchlist from "@/components/Dashboard/Watchlist";

const GAINERS_MOCK = [
    { symbol: "TATAELXSI", name: "Tata Elxsi Ltd", price: 7850.40, changePercent: 5.42 },
    { symbol: "INFY", name: "Infosys Ltd", price: 1680.15, changePercent: 3.12 },
    { symbol: "TCS", name: "Tata Consultancy", price: 3950.00, changePercent: 2.85 },
    { symbol: "WIPRO", name: "Wipro Ltd", price: 485.60, changePercent: 2.15 },
    { symbol: "HCLTECH", name: "HCL Technologies", price: 1420.30, changePercent: 1.68 },
];

const LOSERS_MOCK = [
    { symbol: "ADANIENT", name: "Adani Enterprises", price: 2850.40, changePercent: -4.42 },
    { symbol: "ONGC", name: "Oil & Natural Gas", price: 240.15, changePercent: -3.12 },
    { symbol: "COALINDIA", name: "Coal India Ltd", price: 420.00, changePercent: -2.85 },
    { symbol: "SBIN", name: "State Bank of India", price: 745.60, changePercent: -2.15 },
    { symbol: "BPCL", name: "Bharat Petroleum", price: 580.30, changePercent: -1.68 },
];

const Home = async () => {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    return (
        <div className="home-wrapper max-w-[1600px] mx-auto p-4 md:p-6 space-y-8" suppressHydrationWarning>
            {/* Top Section: Status & Indices */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        Market Overview
                    </h1>
                    <MarketStatus />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <IndexCard name="NIFTY 50" value={22040.70} change={125.40} changePercent={0.57} />
                    <IndexCard name="SENSEX" value={72623.18} change={412.30} changePercent={0.57} />
                    <IndexCard name="BANKNIFTY" value={46580.40} change={-210.15} changePercent={-0.45} />
                    <IndexCard name="INDIA VIX" value={15.42} change={0.85} changePercent={5.84} />
                </div>
            </div>

            {/* Middle Section: 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectorPerformance />
                <StockListCard title="Top Gainers" stocks={GAINERS_MOCK} type="gainers" />
                <StockListCard title="Top Losers" stocks={LOSERS_MOCK} type="losers" />
            </div>

            {/* Bottom Section: Watchlist & Breadth + Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Side: Watchlist & Breadth */}
                <div className="xl:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Watchlist />
                        <MarketBreadth advances={342} declines={148} unchanged={10} />
                    </div>
                </div>

                {/* Right Sidebar: Quotes & News */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Market Quotes</h3>
                        </div>
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}market-quotes.js`}
                            config={{ ...MARKET_DATA_WIDGET_CONFIG, height: 400 }}
                            height={400}
                        />
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Latest News</h3>
                        </div>
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}timeline.js`}
                            config={{ ...TOP_STORIES_WIDGET_CONFIG, height: 350 }}
                            height={350}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
