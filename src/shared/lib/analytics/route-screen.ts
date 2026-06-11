import type { AnalyticsScreenInfo } from './types';

type RouteMatcher = {
  pattern: RegExp;
  screenName: string;
  screenPathTemplate: string;
};

const routeMatchers: RouteMatcher[] = [
  {
    pattern: /^\/$/,
    screenName: 'shampoo_area_root',
    screenPathTemplate: '/',
  },
  {
    pattern: /^\/posts$/,
    screenName: 'shampoo_area_posts',
    screenPathTemplate: '/posts',
  },
  {
    pattern: /^\/posts\/create$/,
    screenName: 'shampoo_area_post_create',
    screenPathTemplate: '/posts/create',
  },
  {
    pattern: /^\/posts\/video-ad$/,
    screenName: 'shampoo_area_video_ad_detail',
    screenPathTemplate: '/posts/video-ad',
  },
  {
    pattern: /^\/posts\/edit\/[^/]+$/,
    screenName: 'shampoo_area_post_edit',
    screenPathTemplate: '/posts/edit/:id',
  },
  {
    pattern: /^\/posts\/select-region$/,
    screenName: 'shampoo_area_select_region',
    screenPathTemplate: '/posts/select-region',
  },
  {
    pattern: /^\/posts\/[^/]+$/,
    screenName: 'shampoo_area_post_detail',
    screenPathTemplate: '/posts/:postId',
  },
];

export function resolveAnalyticsScreen(pathname: string): AnalyticsScreenInfo {
  const normalizedPathname = normalizePathname(pathname);
  const matcher = routeMatchers.find((routeMatcher) =>
    routeMatcher.pattern.test(normalizedPathname),
  );

  if (matcher) {
    return {
      screenName: matcher.screenName,
      screenPathTemplate: matcher.screenPathTemplate,
    };
  }

  const screenPathTemplate = normalizeDynamicRouteTemplate(normalizedPathname);

  return {
    screenName: `shampoo_area_${screenPathTemplate
      .replace(/:[^/]+/g, 'detail')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()}`,
    screenPathTemplate,
  };
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';

  return pathname.replace(/\/+$/, '') || '/';
}

function normalizeDynamicRouteTemplate(pathname: string): string {
  if (pathname === '/') return '/';

  const segments = pathname.split('/').filter(Boolean);

  return `/${segments
    .map((segment) => {
      if (/^\d+$/.test(segment)) {
        return ':id';
      }

      if (/^[0-9a-fA-F-]{16,}$/.test(segment)) {
        return ':id';
      }

      return segment;
    })
    .join('/')}`;
}
