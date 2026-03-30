import { TVAdvancedChart, TVTechnicalAnalysis, TVCompanyProfile, TVFundamentals, TVSymbolInfo } from "@/components/TVWidgets";
import WatchlistButton from "@/components/WatchlistButton";

import { formatTradingViewSymbol } from "@/lib/utils";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import LivePrice from "@/components/VirtualTrading/LivePrice";
import TradeDialog from "@/components/VirtualTrading/TradeDialog";
import AIRecommendation from "@/components/AIRecommendation";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const formattedSymbol = formatTradingViewSymbol(symbol?.toUpperCase() || "");

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  // Fetch real-time price for trading
  const quote = await getStockQuote(symbol);
  const currentPrice = quote.c || 0;

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <TVSymbolInfo symbol={formattedSymbol} height={170} />

          <TVAdvancedChart symbol={formattedSymbol} height={600} style={1} />

          <TVAdvancedChart symbol={formattedSymbol} height={600} style={10} />
        </div>

        <div className="flex flex-col gap-6 sticky top-8">
          <div className="bg-gray-900/30 p-6 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <LivePrice symbol={symbol.toUpperCase()} initialPrice={currentPrice} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <WatchlistButton symbol={symbol.toUpperCase()} company={symbol.toUpperCase()} isInWatchlist={false} />
            {user && (
              <div className="flex-1">
                <TradeDialog symbol={symbol.toUpperCase()} currentPrice={currentPrice} userId={user.id} />
              </div>
            )}
          </div>

          <AIRecommendation symbol={symbol.toUpperCase()} />

          <TVTechnicalAnalysis symbol={formattedSymbol} height={400} />

          <TVCompanyProfile symbol={formattedSymbol} height={440} />

          <TVFundamentals symbol={formattedSymbol} height={464} />
        </div>
      </section>
    </div>
  );
}


