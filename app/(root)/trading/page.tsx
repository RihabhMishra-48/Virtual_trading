import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPortfolioWithLivePrices, getTransactionHistory } from "@/lib/actions/portfolio.actions";
import TradingClient from "@/components/VirtualTrading/TradingClient";

export default async function TradingPage() {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect('/sign-in');
    }

    const portfolio = await getPortfolioWithLivePrices(session.user.id);
    const transactions = await getTransactionHistory(session.user.id, 20);

    return (
        <TradingClient
            userId={session.user.id}
            initialPortfolio={portfolio}
            initialTransactions={transactions}
        />
    );
}
