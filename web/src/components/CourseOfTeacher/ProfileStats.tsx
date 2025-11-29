interface StatItemProps {
    value: string;
    label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
    <div className="space-y-0">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);

interface ProfileStatsProps {
    stats: Array<{ value: string; label: string }>;
}

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
    return (
        <div className="flex gap-12 pb-4 border-b border-border">
            {stats.map((stat, index) => (
                <StatItem key={index} value={stat.value} label={stat.label} />
            ))}
        </div>
    );
};
