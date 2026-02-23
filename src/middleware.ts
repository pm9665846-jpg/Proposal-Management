import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/clients/:path*", "/visits/:path*", "/my-visits/:path*", "/proposals/:path*", "/reports/:path*"],
};
