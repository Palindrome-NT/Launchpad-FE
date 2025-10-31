import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && account.id_token) {
        token.idToken = account.id_token;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${account.id_token}`,
              },
              credentials: 'include',
            }
          );

          const backendData = await res.json();

          if (backendData.success && backendData.data) {
            token.backendToken = backendData.data.accessToken;
            token.refreshToken = backendData.data.refreshToken;
            token.userId = backendData.data.user._id;
            token.user = backendData.data.user;
          }
        } catch (error) {
          console.error("Backend authentication failed:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.backendToken = token.backendToken as string;
        session.refreshToken = token.refreshToken as string;
        session.userId = token.userId as string;
        session.user = token.user as any;
        session.idToken = token.idToken as string; // Pass idToken to session
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});

export { handler as GET, handler as POST };
