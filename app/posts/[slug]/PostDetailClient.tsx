"use client";

import { useEffect } from "react";
import { TableOfContents } from "@/components/TableOfContents";
import type { Post } from "@/lib/posts";

interface PostDetailClientProps {
    post: Post;
}

export function PostDetailClient({ post }: PostDetailClientProps) {
    useEffect(() => {
        // Add IDs to headings for TOC linking
        const article = document.querySelector(".prose-blog");
        if (!article) return;

        const headings = article.querySelectorAll("h2, h3");
        headings.forEach((heading) => {
            const text = heading.textContent || "";
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            heading.id = id;
        });
    }, [post.contentHtml]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Main Content */}
                <main className="w-full lg:w-4/5">
                    <header className="mb-10 border-b border-border-dark pb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-white mb-4 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-sm text-text-muted space-x-6 font-medium mb-4">
                            <span className="flex items-center">
                                <span className="material-symbols-outlined text-base mr-1.5">
                                    Create
                                </span>
                                {post.date}
                            </span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    <article
                        className="prose-blog max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                    />
                </main>

                {/* Sidebar - Table of Contents */}
                <aside className="w-full lg:w-1/5 hidden lg:block">
                    <TableOfContents contentHtml={post.contentHtml} />
                </aside>
            </div>
        </div>
    );
}
