'use client';

import React, { memo } from 'react';
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface TradingViewWidgetProps {
    title?: string;
    scriptUrl: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
}

const TradingViewWidget = ({ title, scriptUrl, config, height = 600, className }: TradingViewWidgetProps) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Guard against hydration mismatch and ensure theme is resolved
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const themeConfig = React.useMemo(() => {
        if (!mounted) return null;
        const isDark = resolvedTheme === 'dark';
        return {
            ...config,
            colorTheme: isDark ? 'dark' : 'light',
            theme: isDark ? 'dark' : 'light',
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            // Hard disable transparency in dark mode to force dark rows/text
            isTransparent: isDark ? false : true,
            width: '100%',
            height: height,
        };
    }, [config, resolvedTheme, mounted, height]);

    // Force a re-mount when theme changes to ensure a clean script run
    const key = mounted ? `tv-widget-${resolvedTheme}` : 'tv-loading';

    const containerRef = useTradingViewWidget(scriptUrl, themeConfig || {}, height);

    if (!mounted) {
        return (
            <div className={cn("w-full rounded-xl bg-card border border-border animate-pulse", className)} style={{ height }}>
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Loading widget...
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)} key={key}>
            {title && <h3 className="font-semibold text-2xl text-foreground mb-5">{title}</h3>}
            <div
                className="tradingview-widget-container rounded-xl overflow-hidden shadow-sm"
                ref={containerRef}
                style={{
                    height: height || "100%",
                    width: "100%",
                    backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#FFFFFF'
                }}
                suppressHydrationWarning
            >
                <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} suppressHydrationWarning></div>
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
