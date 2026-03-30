import { getNews } from "@/lib/actions/finnhub.actions";

interface NewsItem {
    headline: string;
    url: string;
    source: string;
    datetime: number;
    image?: string;
    summary?: string;
}

export default async function LatestNewsPanel() {
    let news: NewsItem[] = [];
    try {
        const raw = await getNews();
        news = (raw || []).slice(0, 6).map((n: any) => ({
            headline: n.headline || n.title || '',
            url: n.url || '#',
            source: n.source || 'Market',
            datetime: n.datetime || Date.now() / 1000,
            image: n.image || n.imageUrl,
            summary: n.summary || n.description,
        }));
    } catch (e) {
        console.error("LatestNewsPanel error:", e);
    }

    function timeAgo(ts: number) {
        const diff = Math.floor(Date.now() / 1000 - ts);
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    if (!news.length) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No news available
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
            {news.map((item, i) => (
                <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50"
                >
                    {item.image && (
                        <img
                            src={item.image}
                            alt=""
                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {item.headline}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{item.source}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(item.datetime)}</span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}
