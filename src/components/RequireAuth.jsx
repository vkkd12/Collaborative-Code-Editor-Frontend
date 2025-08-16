"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "../hooks/useAuth.js";

export default function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

    useEffect(() => {
        if (!loading && !user && !isAuthPage) {
            router.replace('/auth/login');
        }
    }, [user, loading, router, isAuthPage]);

    if (loading && !isAuthPage) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return <>{children}</>;
}
