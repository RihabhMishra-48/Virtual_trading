"use client";

import { useEffect, useState } from "react";
import { Circle } from "lucide-react";

export default function MarketStatus() {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState("");

    useEffect(() => {
        const checkMarketStatus = () => {
            const now = new Date();
            const day = now.getDay();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTime(timeString);

            // Indian Market Hours: 9:15 AM - 3:30 PM (9.25 - 15.5)
            // Monday to Friday (1-5)
            const isWeekday = day >= 1 && day <= 5;
            const currentTime = hours + minutes / 60;
            const isMarketHours = currentTime >= 9.25 && currentTime <= 15.5;

            setIsOpen(isWeekday && isMarketHours);
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm">
            <div className="flex items-center gap-2">
                <Circle className={`h-2.5 w-2.5 fill-current ${isOpen ? 'text-[#16C784] animate-pulse' : 'text-[#EA3943]'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                    Market {isOpen ? "Open" : "Closed"}
                </span>
            </div>
            <div className="h-4 w-px bg-border/50" />
            <span className="text-xs font-mono text-muted-foreground">{time} IST</span>
        </div>
    );
}
