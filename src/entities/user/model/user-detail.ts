import type { User } from './user';

export type UserModelInfo = {
  details?: Record<string, unknown> | null;
};

export type UserDetail = User & {
  modelInfo?: UserModelInfo | null;
  designerInfo?: Record<string, unknown> | null;
};
