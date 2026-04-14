import type { NextAuthOptions } from "next-auth";
import RedditProvider from "next-auth/providers/reddit";

export const authOptions: NextAuthOptions = {
  providers: [
    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID ?? "",
      clientSecret: process.env.REDDIT_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "identity mysubreddits read history submit vote",
          duration: "permanent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.redditUsername = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        redditUsername: token.redditUsername as string,
      };
    },
  },
  pages: {
    signIn: "/",
  },
};
