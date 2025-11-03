import { Link } from "react-router-dom";

interface ImageCardProps {
    image: string;
    title: string;
    slug: string;
}

export const ImageCard = ({ image, title, slug }: ImageCardProps) => {
    return (
        <Link to={`/article/${slug}`} className="group">
            <article className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all mb-8">
                <div className="aspect-video relative overflow-hidden">
                    <img
                        src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf8GeTISd7jte64-n4rC99Ceicb3tk0dTnTg&s'
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">
                        {title}
                    </h3>
                </div>
            </article>
        </Link>
    );
};
