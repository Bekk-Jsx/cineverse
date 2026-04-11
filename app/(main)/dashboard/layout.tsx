import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Server component — runs on server, no hooks needed
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session) redirect('/login');
    if (session.user.role !== 'admin') redirect('/');

    return <>{children}</>;
};

export default DashboardLayout;