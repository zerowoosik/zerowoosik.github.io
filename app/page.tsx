import { getSortedPostsData } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const posts = getSortedPostsData();

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10 pb-6 border-b border-border-dark">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-text-white">
          Latest Posts
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">
            아직 포스트가 없습니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
