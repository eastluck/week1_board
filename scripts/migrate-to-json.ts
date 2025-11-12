import { generateSamplePosts } from "../lib/posts";
import { generateSampleComments } from "../lib/comments";
import { savePosts } from "../lib/storage/postStorage";
import { saveComments } from "../lib/storage/commentStorage";

async function migrate() {
  console.log("🚀 Starting migration to JSON files...\n");

  try {
    // 1. 게시글 데이터 생성
    console.log("📝 Generating sample posts...");
    const posts = generateSamplePosts();
    await savePosts(posts);
    console.log(`✅ Created ${posts.length} posts in data/posts.json\n`);

    // 2. 댓글 데이터 생성
    console.log("💬 Generating sample comments...");
    const comments = generateSampleComments();
    await saveComments(comments);
    console.log(`✅ Created ${comments.length} comments in data/comments.json\n`);

    console.log("🎉 Migration completed successfully!");
    console.log("\n📁 Data files created:");
    console.log("   - data/posts.json");
    console.log("   - data/comments.json");
    console.log("\n💡 You can now run: npm run dev");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
