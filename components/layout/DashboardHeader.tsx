import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type DashboardHeaderProps = {
    title: string;
    children?: React.ReactNode;
};

export default function DashboardHeader({
    title,
    children,
}: DashboardHeaderProps) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Back to home"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </header>
    );
}
