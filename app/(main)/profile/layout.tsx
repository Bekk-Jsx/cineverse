import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const ProfileLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session) redirect('/login');

    return <>{children}</>;
};

export default ProfileLayout;