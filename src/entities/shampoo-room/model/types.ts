export type ShampooRoomCategory = 'FREE' | 'EDUCATION' | 'PRODUCT' | 'MARKET';

export type ShampooRoomImage = {
  imageUrl: string;
};

export type ShampooRoomUser = {
  name: string;
  anonymousNumber: number;
};

export type ShampooRoomListItem = {
  id: number;
  title: string;
  category: ShampooRoomCategory;
  content: string;
  images: ShampooRoomImage[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
  user: ShampooRoomUser;
};

export type ShampooRoomDetail = ShampooRoomListItem & {
  isLiked: boolean;
  isRead: boolean;
};

export type ShampooRoomCommentReply = {
  id: number;
  content: string;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
  user: ShampooRoomUser;
};

export type ShampooRoomComment = {
  id: number;
  content: string;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
  user: ShampooRoomUser;
  replies: ShampooRoomCommentReply[];
};

export type ShampooRoomListQuery = {
  __nextCursor?: string;
  __limit?: number;
  isMine?: boolean;
  isLiked?: boolean;
  isRead?: boolean;
  category?: ShampooRoomCategory;
  addresses?: string[];
};

export type ShampooRoomCommentListQuery = {
  __nextCursor?: string;
  __limit?: number;
};

export type CreateShampooRoomRequest = {
  title: string;
  category: ShampooRoomCategory;
  content: string;
  images?: ShampooRoomImage[];
};

export type UpdateShampooRoomRequest = Partial<CreateShampooRoomRequest>;

export type CreateShampooRoomCommentRequest = {
  content: string;
  parentCommentId?: number;
  isSecret?: boolean;
};

export type UpdateShampooRoomCommentRequest = {
  content: string;
  isSecret?: boolean;
};
