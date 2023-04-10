export const VERSION = "2023.9"

export type GetProfile = {
  id: URL;
  avatarUrl: URL | null;
  username: string | null;
  name: string | null;
};
