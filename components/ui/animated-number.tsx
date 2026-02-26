"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    format?: (val: number) => string;
    className?: string;
}

export function AnimatedNumber({ value, duration = 1000, format = (v) => v.toString(), className }: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const startValueRef = useRef(0);

    useEffect(() => {
        startValueRef.current = displayValue;
        startTimeRef.current = null;

        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Easing function: easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const current = startValueRef.current + (value - startValueRef.current) * easeProgress;
            setDisplayValue(current);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span className={className}>{format(displayValue)}</span>;
}
