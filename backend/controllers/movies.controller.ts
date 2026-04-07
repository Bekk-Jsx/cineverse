import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as moviesService from '../services/movies.service';

// GET /api/movies?page=1
export const getAllMovies = async (req: NextRequest): Promise<NextResponse> => {
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1');

  const result = await moviesService.getMovies(page);

  return NextResponse.json({
    data: result.movies,
    pagination: {
      page,
      total: result.total,
      totalPages: Math.ceil(result.total / 20),
    },
  });
};

// GET /api/movies/:id
export const getMovie = async (
  req: NextRequest,
  id: string
): Promise<NextResponse> => {
  const movie = await moviesService.getMovieById(id);

  if (!movie) {
    return NextResponse.json(
      { error: 'Movie not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: movie });
};

// GET /api/movies/search?q=avatar&genre=Action
export const searchMovies = async (req: NextRequest): Promise<NextResponse> => {
  const query = req.nextUrl.searchParams.get('q') ?? '';
  const genre = req.nextUrl.searchParams.get('genre') ?? undefined;
  const year = req.nextUrl.searchParams.get('year');
  const minRating = req.nextUrl.searchParams.get('minRating');
  const language = req.nextUrl.searchParams.get('language') ?? undefined;

  const results = await moviesService.searchMovies(query, {
    genre,
    year: year ? parseInt(year) : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    language,
  });

  return NextResponse.json({ data: results });
};

// POST /api/movies (admin only)
export const createMovie = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();

  const movie = await moviesService.createMovie(body);

  return NextResponse.json(
    { data: movie },
    { status: 201 }
  );
};

// PUT /api/movies/:id (admin only)
export const updateMovie = async (
  req: NextRequest,
  id: string
): Promise<NextResponse> => {
  const body = await req.json();

  const movie = await moviesService.updateMovie(id, body);

  return NextResponse.json({ data: movie });
};

// DELETE /api/movies/:id (admin only)
export const deleteMovie = async (
  req: NextRequest,
  id: string
): Promise<NextResponse> => {
  await moviesService.deleteMovie(id);

  return NextResponse.json(
    { message: 'Movie deleted successfully' },
    { status: 200 }
  );
};