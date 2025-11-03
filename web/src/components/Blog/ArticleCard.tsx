import { Link } from "react-router-dom";

interface ArticleCardProps {
  image: string;
  category: string;
  title: string;
  slug: string;
}

export const ArticleCard = ({ image, category, title, slug }: ArticleCardProps) => {
  return (
    <Link to={`/article/${slug}`} className="group">
      <article className="flex gap-4 items-start transition-all mb-2">
        <img
          src={image}
          alt={title}
          className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {category}
          </span>
          <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      </article>
    </Link>
  );
};
