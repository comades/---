import { User } from '../types';

export const getUserDisplayName = (user: User | null | undefined) => {
  if (!user) return '光光';
  
  const prefix = user.titlePrefix ? `${user.titlePrefix} ` : '';
  const title = user.title ? ` ${user.title}` : '';
  
  return `光光 ${prefix}${user.name}${title}`.trim();
};

export const getPlayerNameOnly = (user: User | null | undefined) => {
  return user?.name || '光光';
};
