import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, loading, logout } = useContext(AuthContext);

    // If the app is still checking the cookie, show a loader
    if (loading) return <div className="text-center mt-20">Loading...</div>;

    // Security: If no user is logged in, send them back to login
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-green-600 h-32 flex items-end px-8 pb-4">
                    <div className="h-20 w-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-green-600">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500 mb-8">Rastriya Khadya Bank Member</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-xs font-semibold text-gray-400 uppercase">Email Address</span>
                            <p className="text-gray-800 font-medium">{user.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="text-xs font-semibold text-gray-400 uppercase">Account Status</span>
                            <p className="text-green-600 font-medium flex items-center gap-1">
                                <span className="h-2 w-2 bg-green-600 rounded-full"></span> Active
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="mt-10 bg-red-50 text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;