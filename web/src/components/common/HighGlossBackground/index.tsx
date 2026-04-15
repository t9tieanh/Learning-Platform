import { cn } from "@/lib/utils";
import React from "react";

interface HighGlossBackgroundProps {
    className?: string;
    children?: React.ReactNode;
}

/**
 * HighGlossBackground Component
 * Provides a premium, state-of-the-art background with vibrant blue gradients,
 * radial light bloom, and cube mesh texture.
 */
const HighGlossBackground = ({
    className,
    children,
}: HighGlossBackgroundProps) => {
    return (
        <div className={cn(
            "relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950",
            className
        )}>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#ffffff,transparent)] pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -mr-32 -mb-32 blur-3xl pointer-events-none" />
            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
};

export default HighGlossBackground;
