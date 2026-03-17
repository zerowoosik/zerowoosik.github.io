import type { Metadata } from "next";
import { getSortedPostsData } from "@/lib/posts";
import { PostList } from "@/components/PostList";

export const metadata: Metadata = {
  title: "Posts",
  description:
    "소프트웨어 개발 경험과 기술적 문제 해결을 기록한 게시글 목록입니다.",
  alternates: {
    canonical: "https://zerowoosik.github.io/posts/",
  },
  openGraph: {
    title: "Posts | zerowoosik's Blog",
    description:
      "소프트웨어 개발 경험과 기술적 문제 해결을 기록한 게시글 목록입니다.",
    url: "https://zerowoosik.github.io/posts/",
    type: "website",
  },
};

export default function PostsPage() {
  const posts = getSortedPostsData();

  return <PostList posts={posts} />;
}
