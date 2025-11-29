interface ProfileAboutProps {
    content: string;
}

export const ProfileAbout = ({ content }: ProfileAboutProps) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Giới thiệu bản thân</h2>
            <div className="prose prose-gray max-w-none">
                <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                    {content}
                </p>
            </div>
        </div>
    );
};
