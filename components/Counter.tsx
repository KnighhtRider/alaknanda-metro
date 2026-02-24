"use client";
import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CounterProps {
    value: number;
    suffix?: string;
    duration?: number;
    className?: string;
}

export default function Counter({ value, suffix = "", duration = 2, className = "" }: CounterProps) {
    const [count, setCount] = useState(0);

    const spring = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const displayValue = useTransform(spring, (latest) =>
        Math.floor(latest).toLocaleString()
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return (
        <div className={className}>
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </div>
    );
}
