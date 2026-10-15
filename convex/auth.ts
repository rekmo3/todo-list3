import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Зберігаємо ім'я з форми реєстрації в таблиці users,
      // щоб показати його в картці профілю на вкладці налаштувань.
      profile(params) {
        const email = String(params.email ?? "").trim().toLowerCase();
        const name = String(params.name ?? "").trim();
        return {
          email,
          ...(name ? { name } : {}),
        };
      },
    }),
  ],
});
