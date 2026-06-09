import { describe, expect, test } from 'vitest';

import { resolveAnalyticsScreen } from './route-screen';

describe('resolveAnalyticsScreen', () => {
  test('maps post detail without exposing the post id', () => {
    expect(resolveAnalyticsScreen('/posts/12345')).toEqual({
      screenName: 'shampoo_area_post_detail',
      screenPathTemplate: '/posts/:postId',
    });
  });

  test('maps post edit without exposing the post id', () => {
    expect(resolveAnalyticsScreen('/posts/edit/12345')).toEqual({
      screenName: 'shampoo_area_post_edit',
      screenPathTemplate: '/posts/edit/:id',
    });
  });

  test('maps list and create screens', () => {
    expect(resolveAnalyticsScreen('/posts')).toEqual({
      screenName: 'shampoo_area_posts',
      screenPathTemplate: '/posts',
    });
    expect(resolveAnalyticsScreen('/posts/create')).toEqual({
      screenName: 'shampoo_area_post_create',
      screenPathTemplate: '/posts/create',
    });
  });
});
