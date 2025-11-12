# Next.js 게시판 프로젝트

## 프로젝트 개요

Next.js 16.0.1 기반의 간단한 게시판 애플리케이션입니다. TypeScript, Tailwind CSS를 사용하여 구현되었으며, App Router 패턴을 따릅니다.

## 기술 스택

### 프레임워크 & 라이브러리
- **Next.js**: 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: ^5

### 스타일링
- **Tailwind CSS**: ^4
- **@tailwindcss/postcss**: ^4

### 개발 도구
- **ESLint**: ^9
- **eslint-config-next**: 16.0.1

## 프로젝트 구조

```
board-app/
├── app/                          # Next.js App Router 디렉토리
│   ├── api/                      # API 라우트
│   │   └── posts/
│   │       └── route.ts          # POST /api/posts - 게시글 생성 API
│   ├── posts/                    # 게시글 관련 페이지
│   │   ├── [id]/
│   │   │   └── page.tsx          # 동적 라우트 - 게시글 상세 페이지
│   │   └── new/
│   │       └── page.tsx          # 게시글 작성 페이지 (Client Component)
│   ├── page.tsx                  # 메인 페이지 - 게시글 목록
│   ├── layout.tsx                # 루트 레이아웃
│   ├── globals.css               # 전역 스타일
│   └── favicon.ico               # 파비콘
├── lib/                          # 유틸리티 & 비즈니스 로직
│   └── posts.ts                  # 게시글 CRUD 함수
├── types/                        # TypeScript 타입 정의
│   └── post.ts                   # Post 인터페이스
├── public/                       # 정적 파일
│   ├── next.svg
│   └── vercel.svg
├── node_modules/                 # 의존성 패키지
├── .next/                        # Next.js 빌드 출력
├── .git/                         # Git 저장소
├── package.json                  # 프로젝트 메타데이터 & 의존성
├── tsconfig.json                 # TypeScript 설정
├── next.config.ts                # Next.js 설정
├── tailwind.config.ts            # Tailwind CSS 설정 (추정)
├── postcss.config.mjs            # PostCSS 설정
├── eslint.config.mjs             # ESLint 설정
└── README.md                     # 프로젝트 문서
```

## 핵심 기능

### 1. 게시글 목록 (`/`)
**파일**: `app/page.tsx`

- 모든 게시글을 최신순으로 표시
- 각 게시글의 제목, 작성자, 작성일, 조회수 표시
- 게시글 클릭 시 상세 페이지로 이동
- "글쓰기" 버튼으로 작성 페이지 이동

**주요 함수**:
- `getPosts()`: 모든 게시글을 최신순으로 정렬하여 반환

### 2. 게시글 상세 보기 (`/posts/[id]`)
**파일**: `app/posts/[id]/page.tsx`

- 동적 라우팅을 사용한 개별 게시글 조회
- 게시글 전체 내용 표시 (제목, 작성자, 작성일, 조회수, 본문)
- 페이지 접근 시 조회수 자동 증가
- "목록으로" 버튼으로 메인 페이지 이동
- 존재하지 않는 게시글 접근 시 404 페이지 표시

**주요 함수**:
- `getPost(id)`: 특정 ID의 게시글 조회 및 조회수 증가

### 3. 게시글 작성 (`/posts/new`)
**파일**: `app/posts/new/page.tsx`

- Client Component (`"use client"` 디렉티브 사용)
- 제목, 작성자, 내용 입력 폼
- 실시간 상태 관리 (React useState)
- 폼 유효성 검사 (빈 필드 체크)
- API를 통한 게시글 생성 (POST /api/posts)
- 작성 완료 후 메인 페이지로 리디렉션
- "취소" 버튼으로 메인 페이지 이동

**주요 기능**:
- 폼 제출 처리 및 로딩 상태 관리
- API 통신 에러 핸들링
- 버튼 비활성화 (작성 중)

### 4. 게시글 생성 API (`POST /api/posts`)
**파일**: `app/api/posts/route.ts`

- RESTful API 엔드포인트
- JSON 요청 본문 처리
- 필드 유효성 검사
- 새 게시글 생성 및 응답

**요청 본문**:
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용",
  "author": "작성자명"
}
```

**응답**:
- 성공 시: 201 Created + 생성된 게시글 객체
- 실패 시: 400/500 에러 코드 + 에러 메시지

## 데이터 모델

### Post 인터페이스
**파일**: `types/post.ts`

```typescript
interface Post {
  id: number;           // 게시글 고유 ID
  title: string;        // 게시글 제목
  content: string;      // 게시글 내용
  author: string;       // 작성자명
  createdAt: Date;      // 작성일시
  views: number;        // 조회수
}
```

## 데이터 관리

**파일**: `lib/posts.ts`

현재 **메모리 내 임시 데이터 저장소**를 사용합니다 (배열 기반).

### 제공 함수

1. **getPosts()**: Post[]
   - 모든 게시글을 최신순으로 정렬하여 반환

2. **getPost(id: number)**: Post | undefined
   - 특정 ID의 게시글 조회
   - 조회 시 views 카운트 자동 증가

3. **createPost(data)**: Post
   - 새 게시글 생성
   - 자동 ID 할당 (기존 최대 ID + 1)
   - createdAt 자동 설정 (현재 시간)
   - views 초기값 0

4. **deletePost(id: number)**: boolean
   - 게시글 삭제 (현재 UI에서는 미사용)
   - 성공 시 true, 실패 시 false 반환

### 초기 데이터

프로젝트에는 3개의 샘플 게시글이 포함되어 있습니다:
1. "Next.js 게시판에 오신 것을 환영합니다!"
2. "Next.js 시작하기"
3. "TypeScript와 함께하는 개발"

## 라우팅 구조

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `app/page.tsx` | 게시글 목록 (메인 페이지) |
| `/posts/new` | `app/posts/new/page.tsx` | 게시글 작성 페이지 |
| `/posts/[id]` | `app/posts/[id]/page.tsx` | 게시글 상세 페이지 (동적) |
| `POST /api/posts` | `app/api/posts/route.ts` | 게시글 생성 API |

## 스타일링 특징

- **Tailwind CSS 유틸리티 클래스** 사용
- **반응형 디자인** (모바일 친화적)
- **다크 모드 지원** (Tailwind dark: 클래스)
- **Google Fonts**: Geist Sans, Geist Mono

### 주요 디자인 요소
- 배경: `bg-gray-50`
- 카드: `bg-white rounded-lg shadow`
- 버튼: 파란색 (primary), 회색 (secondary)
- 호버 효과: `hover:bg-*` 트랜지션

## 실행 방법

### 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```
브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드
```bash
npm run build
npm start
```

### 린팅
```bash
npm run lint
```

## 제한사항 및 개선 방향

### 현재 제한사항

1. **데이터 영속성 없음**
   - 메모리 기반 데이터 저장
   - 서버 재시작 시 데이터 소실

2. **인증 없음**
   - 누구나 게시글 작성 가능
   - 작성자 검증 없음

3. **기본 기능만 제공**
   - 수정/삭제 UI 미구현 (deletePost 함수는 존재)
   - 검색 기능 없음
   - 페이지네이션 없음
   - 댓글 기능 없음

### 개선 방향

1. **데이터베이스 연동**
   - PostgreSQL, MySQL, MongoDB 등
   - Prisma, Drizzle 같은 ORM 사용 권장

2. **추가 기능 구현**
   - 게시글 수정/삭제 기능
   - 페이지네이션 또는 무한 스크롤
   - 검색 및 필터링
   - 카테고리/태그 시스템

3. **사용자 인증**
   - NextAuth.js 또는 Clerk 통합
   - 작성자 검증
   - 권한 관리

4. **UX 개선**
   - 로딩 스피너
   - 토스트 알림
   - 폼 검증 강화 (길이 제한, XSS 방지)
   - 에러 바운더리

5. **성능 최적화**
   - 이미지 업로드 및 최적화
   - 캐싱 전략
   - ISR (Incremental Static Regeneration)

6. **테스트**
   - 유닛 테스트 (Jest, Vitest)
   - E2E 테스트 (Playwright, Cypress)

## 주요 코드 참조

### 메인 페이지 (Server Component)
- 파일: `app/page.tsx`
- 서버에서 데이터 패칭
- SEO 친화적

### 작성 페이지 (Client Component)
- 파일: `app/posts/new/page.tsx`
- 클라이언트 상태 관리 필요 (`useState`)
- API 호출 (`fetch`)

### API 라우트
- 파일: `app/api/posts/route.ts`
- Next.js Route Handlers 사용
- RESTful 패턴

## 기여 방법

이 프로젝트는 Next.js 학습용으로 만들어졌습니다. 기능 추가나 개선 사항이 있다면:

1. 프로젝트 Fork
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 학습 목적으로 만들어졌습니다.

## 문의

프로젝트 관련 문의사항이 있으시면 Issue를 생성해주세요.

---

**마지막 업데이트**: 2025-01-12
**Next.js 버전**: 16.0.1
**작성자**: Claude Code
