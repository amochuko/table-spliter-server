export type AuthUser = {
  userId: string;
  email?: string;
  username?: string;
  role?: "user" | "admin";
};
