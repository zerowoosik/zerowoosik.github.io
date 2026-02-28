import { getPostData, getAllPostSlugs } from "@/lib/posts";
import { PostDetailClient } from "./PostDetailClient";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostData(slug);
    const postUrl = `https://zerowoosik.github.io/posts/${slug}`;

    return {
        title: post.title,
        description: post.description,
        keywords: post.tags,
        openGraph: {
            title: post.title,
            description: post.description,
            url: postUrl,
            type: "article",
            publishedTime: post.date,
            authors: ["zerowoosik"],
        },
        twitter: {
            card: "summary",
            title: post.title,
            description: post.description,
        },
        alternates: {
            canonical: postUrl,
        },
    };
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostData(slug);

    return <PostDetailClient post={post} />;
}
