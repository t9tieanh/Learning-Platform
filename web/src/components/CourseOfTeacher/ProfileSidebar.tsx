import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileSidebarProps {
    image: string;
    name: string;
}

export const ProfileSidebar = ({ image, name }: ProfileSidebarProps) => {
    return (
        <Card className="p-6 sticky top-20 border-none shadow-none">
            <div className="flex flex-col items-center space-y-6">

                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/10">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Name */}
                <p className="text-xl font-semibold text-center">
                    {name}
                </p>

            </div>
        </Card>
    );
};
