import { NextResponse } from "next/server";
import { createComment } from "@/lib/comments";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, content, author } = body;

    if (!postId || !content || !author) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    const newComment = createComment({
      postId: parseInt(postId),
      content,
      author,
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "댓글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
