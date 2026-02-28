import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface PostCardProps {
    post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
    return (
        <Link href={`/posts/${post.slug}`} className="block">
            <article className="animate-fade-in-up bg-surface-dark border border-border-dark rounded-xl p-6 hover:border-gray-500 transition-colors duration-200 flex flex-col group cursor-pointer">
                <div className="text-sm text-text-muted font-medium w-full pb-3 mb-3 border-b border-dashed border-border-dark">
                    Posted on {post.date}
                </div>
                <h2 className="text-xl font-bold mb-2 text-text-white group-hover:text-primary transition-colors duration-200">
                    {post.title}
                </h2>
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </article>
        </Link>
    );
}
