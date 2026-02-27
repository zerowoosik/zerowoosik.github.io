"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();

    const isPostsActive = pathname === "/" || pathname.startsWith("/posts");

    return (
        <nav className="w-full px-6 py-6 flex justify-center items-center max-w-7xl mx-auto border-b border-border-dark">
            <div className="flex space-x-8 text-lg font-bold items-center justify-center">
                <Link
                    href="/"
                    className={`transition-colors duration-200 ${isPostsActive
                            ? "text-text-white border-b-2 border-white pb-0.5"
                            : "text-text-muted hover:text-text-white"
                        }`}
                >
                    Posts
                </Link>
            </div>
        </nav>
    );
}
