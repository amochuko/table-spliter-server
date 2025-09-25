/**
 * This class contains authentication related methods
 */

export class AuthService {
  private isActive: boolean = false;

  constructor() {}

  authenticate(username: string, password: string) {
    // TODO: replace this simulated logic

    if (username === "admin" && password === "12345") {
      this.isActive = true;
      return true;
    }

    return false;
  }

  isLoggedIn(): Promise<boolean> {
    return new Promise((res, rej) => res(true));
  }

  getCurrentUser() {
    return {
      id: "101",
      username: "adamsmither",
    };
  }
}
