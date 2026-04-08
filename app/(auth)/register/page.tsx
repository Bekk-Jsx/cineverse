'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        username: form.username,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Registration failed');
      setLoading(false);
      return;
    }

    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-xl p-8 w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-neutral-400 mt-2">Join Cineverse today</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {[
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} className="space-y-2">
              <label className="text-neutral-400 text-sm">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={placeholder}
              />
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Create Account'
            )}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-400 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-500 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;