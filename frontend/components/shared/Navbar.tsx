'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useMoviesStore } from '@/frontend/store';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session } = useSession();
  const { searchQuery, setSearchQuery } = useMoviesStore();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary-500">
          Cineverse 🎬
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 text-neutral-100 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <Link href="/movies" className="text-neutral-300 hover:text-white text-sm">
            Movies
          </Link>

          {session ? (
            <>
              <Link href="/profile" className="text-neutral-300 hover:text-white text-sm">
                {session.user.username}
              </Link>
              {session.user.role === 'admin' && (
                <Link href="/dashboard" className="text-warning text-sm">
                  Dashboard
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;