import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'student')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, profile, loading, isAdmin } = useAuth();
    const location = useLocation();
    const [isTimingOut, setIsTimingOut] = useState(false);

    // Safety timeout to prevent infinite loading states
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) setIsTimingOut(true);
        }, 5000); // 5 seconds timeout
        return () => clearTimeout(timer);
    }, [loading]);

    // 1. Loading State
    // Show loading spinner while AuthContext is initializing
    if (loading && !isTimingOut) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                        Verificando Credenciais...
                    </p>
                </div>
            </div>
        );
    }

    // 2. Check Authentication
    if (!user) {
        console.log('🚫 [ProtectedRoute] No user found. Redirecting to home.');
        // Redirect to home (login) but save the location they tried to access
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 2. Check Profile Existence (if logged in but no profile yet loaded/created)
    if (!profile && !isTimingOut) {
        // Keep loading or show error if it takes too long
        // For now, we assume if user is there, profile should load. 
        // If timeout happens, we might fall through.
    }

    // 3. Check Role Permissions (if specified)
    if (allowedRoles && profile) {
        const userRole = isAdmin ? 'admin' : 'student';
        if (!allowedRoles.includes(userRole as any)) {
            // Role mismatch
            console.warn(`Access denied for role: ${userRole}. Required: ${allowedRoles.join(', ')}`);

            // Redirect based on what they ARE allowed to see
            if (userRole === 'admin') return <Navigate to="/admin" replace />;
            return <Navigate to="/aluno" replace />;
        }
    }

    // 4. Authorized
    return <>{children}</>;
};
