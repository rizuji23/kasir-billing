// components/PublicRoute.tsx
import { Navigate } from "react-router";
import { useGetUserInfo } from "./MiddlewareContext";
import React from "react";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
    const [user] = useGetUserInfo();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}