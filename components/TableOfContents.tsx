"use client";

import { useEffect, useState } from "react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    contentHtml: string;
}

export function TableOfContents({ contentHtml }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Parse headings from HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, "text/html");
        const elements = doc.querySelectorAll("h2, h3");

        const items: TocItem[] = Array.from(elements).map((el) => {
            const text = el.textContent || "";
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();

            return {
                id,
                text,
                level: el.tagName === "H2" ? 2 : 3,
            };
        });

        setHeadings(items);
    }, [contentHtml]);

    useEffect(() => {
        const handleScroll = () => {
            const headingElements = headings
                .map((h) => ({
                    id: h.id,
                    el: document.getElementById(h.id),
                }))
                .filter((h) => h.el !== null);

            let currentId = "";
            for (const heading of headingElements) {
                if (heading.el) {
                    const rect = heading.el.getBoundingClientRect();
                    if (rect.top <= 120) {
                        currentId = heading.id;
                    }
                }
            }
            setActiveId(currentId);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <div className="sidebar-sticky">
            <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">
                📝 목차
            </h4>
            <nav className="flex flex-col space-y-3 text-sm border-l border-border-dark pl-4">
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`transition-colors duration-200 ${heading.level === 3 ? "pl-4" : ""
                            } ${activeId === heading.id
                                ? "text-accent"
                                : "text-text-muted hover:text-accent"
                            }`}
                    >
                        {heading.text}
                    </a>
                ))}
            </nav>
        </div>
    );
}
