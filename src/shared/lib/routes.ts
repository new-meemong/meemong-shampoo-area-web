export const ROUTES = {
  HOME: '/',
  POSTS: '/posts',
  POSTS_CREATE: '/posts/create',
  POSTS_DETAIL: (postId: string | number) => `/posts/${postId}`,
  POSTS_EDIT: (id: string) => `/posts/edit/${id}`,
} as const;

/**
 * 타입 안정성을 위한 네비게이션 함수 생성 함수
 * @param push 네비게이션 함수
 * @returns 네비게이션 함수 객체
 */
export const createNavigation = (push: (href: string) => void) => ({
  toHome: () => push(ROUTES.HOME),
  toPosts: () => push(ROUTES.POSTS),
  toPostsCreate: () => push(ROUTES.POSTS_CREATE),
  toPostsDetail: (postId: string | number) => push(ROUTES.POSTS_DETAIL(postId)),
});
