
'use client';

import { useRouter } from 'next/navigation';
import { UserCredential } from 'firebase/auth';
import useUserStore from '@/store/userStore';
import { signInWithGoogle, signInAsGuest, logout } from '@/lib/auth';

const LoginPage = () => {
  const { user } = useUserStore();
  const router = useRouter();

  const handleLogin = async (loginFunction: () => Promise<UserCredential>) => {
    try {
      await loginFunction();
      router.push('/');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (user) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.displayName || 'Guest'}</h1>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin(signInWithGoogle)} 
            className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Login with Google
          </button>

          <button 
            onClick={() => handleLogin(signInAsGuest)} 
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
