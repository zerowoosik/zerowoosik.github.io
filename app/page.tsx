import { getSortedPostsData } from "@/lib/posts";
import { PostList } from "@/components/PostList";

export default function HomePage() {
  const posts = getSortedPostsData();

  return <PostList posts={posts} />;
}
