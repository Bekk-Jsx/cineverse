import Link from 'next/link';
import { Star } from 'lucide-react';

interface MovieCardProps {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: { name: string }[];
}

const MovieCard = ({
  id,
  title,
  overview,
  vote_average,
  release_date,
  genres,
}: MovieCardProps) => {
  const year = release_date ? new Date(release_date).getFullYear() : 'N/A';

  return (
    <Link href={`/movies/${id}`}>
      <div className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition-colors cursor-pointer h-full flex flex-col gap-3">

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{vote_average.toFixed(1)}</span>
          </div>
          <span className="text-neutral-400 text-sm">{year}</span>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Overview */}
        <p className="text-neutral-400 text-sm line-clamp-3 flex-1">
          {overview}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {genres.slice(0, 3).map((genre) => (
            <span
              key={genre.name}
              className="text-xs bg-neutral-800 text-primary-500 px-2 py-1 rounded-full"
            >
              {genre.name}
            </span>
          ))}
        </div>

      </div>
    </Link>
  );
};

export default MovieCard;