import React from 'react';
import {useRouter} from 'next/router';

const RegistrationSuccess: React.FC = () => {

    const router = useRouter();

    const handleLoginRedirect = () => {
        router.push('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
            <div className="p-6 mt-6 text-center border-2 border-green-600 rounded-xl">
                <h1 className="text-2xl font-bold text-green-600">Registration Successful</h1>
                <p className="mt-4 text-gray-600">
                    Your account has been created successfully! Please log in to continue.
                </p>
                <button onClick={handleLoginRedirect} className="px-6 py-2 mt-6 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                    Go to Login
                </button>
            </div>
        </div>
    );
}

export default RegistrationSuccess;
