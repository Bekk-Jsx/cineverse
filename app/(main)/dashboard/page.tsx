'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Film, Users, Database, Server, Shield } from 'lucide-react';

interface Stats {
    counts: {
        movies: number;
        persons: number;
        users: number;
    };
    elasticsearch: {
        movies_indexed: number;
        persons_indexed: number;
    };
    redis: {
        memory: string;
    };
}

interface User {
    _id: string;
    email: string;
    username: string;
    role: string;
    created_at: string;
}

const DashboardPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');


    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/stats');
            return res.json();
        },
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await fetch('/api/admin/users');
            return res.json();
        },
        enabled: activeTab === 'users',
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: string; role: string }) => {
            const res = await fetch(`/api/admin/users/${id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const stats: Stats | undefined = statsData?.data;
    const users: User[] = usersData?.data ?? [];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-neutral-400 mt-1">Manage your platform</p>
                </div>
                <div className="flex items-center gap-2 bg-primary-900 text-primary-500 px-3 py-1 rounded-full text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-neutral-800">
                {(['overview', 'users'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-1 text-sm font-medium capitalize transition-colors ${activeTab === tab
                            ? 'text-primary-500 border-b-2 border-primary-500'
                            : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {statsLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Movies', value: stats?.counts.movies, icon: Film, color: 'text-primary-500' },
                                    { label: 'Persons', value: stats?.counts.persons, icon: Users, color: 'text-success' },
                                    { label: 'Users', value: stats?.counts.users, icon: Users, color: 'text-warning' },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="bg-neutral-900 rounded-xl p-6 space-y-3">
                                        <div className={`flex items-center gap-2 ${color}`}>
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </div>
                                        <p className="text-3xl font-bold text-white">
                                            {value?.toLocaleString() ?? '—'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Services Status */}
                            <div className="bg-neutral-900 rounded-xl p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Server className="w-5 h-5 text-primary-500" />
                                    Services Status
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h3 className="text-neutral-400 text-sm">Elasticsearch</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-300">Movies indexed</span>
                                            <span className="text-white font-medium">
                                                {stats?.elasticsearch.movies_indexed.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-300">Persons indexed</span>
                                            <span className="text-white font-medium">
                                                {stats?.elasticsearch.persons_indexed.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-neutral-400 text-sm">Redis</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-300">Memory used</span>
                                            <span className="text-white font-medium">
                                                {stats?.redis.memory}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {usersLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="bg-neutral-900 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        {['Username', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left text-neutral-400 text-sm font-medium px-6 py-4"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-white text-sm">
                                                {user.username}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400 text-sm">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin'
                                                    ? 'bg-error/10 text-error'
                                                    : user.role === 'moderator'
                                                        ? 'bg-warning/10 text-warning'
                                                        : 'bg-neutral-800 text-neutral-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    defaultValue={user.role}
                                                    onChange={(e) =>
                                                        updateRoleMutation.mutate({
                                                            id: user._id,
                                                            role: e.target.value,
                                                        })
                                                    }
                                                    className="bg-neutral-800 text-white text-sm rounded px-2 py-1"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default DashboardPage;