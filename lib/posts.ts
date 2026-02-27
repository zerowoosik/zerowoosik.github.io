import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";
import remarkCallout from "./remark-callout";
import remarkGfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "posts");

export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags?: string[];
    readingTime: string;
}

export interface Post extends PostMeta {
    contentHtml: string;
}

export function getSortedPostsData(): PostMeta[] {
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
        .map((fileName) => {
            const slug = fileName.replace(/\.(md|mdx)$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const matterResult = matter(fileContents);
            const stats = readingTime(matterResult.content);

            return {
                slug,
                title: matterResult.data.title || slug,
                date: matterResult.data.date || "",
                description: matterResult.data.description || "",
                tags: matterResult.data.tags || [],
                readingTime: stats.text,
            } as PostMeta;
        });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostSlugs(): string[] {
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
        .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
        .map((fileName) => fileName.replace(/\.(md|mdx)$/, ""));
}

export async function getPostData(slug: string): Promise<Post> {
    let fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(postsDirectory, `${slug}.mdx`);
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);
    const stats = readingTime(matterResult.content);

    const processedContent = await remark().use(remarkGfm).use(remarkCallout).use(html, { sanitize: false }).process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || "",
        description: matterResult.data.description || "",
        tags: matterResult.data.tags || [],
        readingTime: stats.text,
        contentHtml,
    };
}
