export const localUserId = 'local';

export function userSettingKey(userId: string, key: string) {
  return userId === localUserId ? key : `${key}:${userId}`;
}
