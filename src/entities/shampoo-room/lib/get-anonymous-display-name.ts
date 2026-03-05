import type { ShampooRoomUser } from '../model/types';

export default function getAnonymousDisplayName(user: ShampooRoomUser) {
  if (user.anonymousNumber === 0) {
    return '글쓴이';
  }

  if (user.anonymousNumber >= 1) {
    return `익명${user.anonymousNumber}`;
  }

  return user.name;
}
