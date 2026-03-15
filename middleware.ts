export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/calendar/:path*", "/pipeline/:path*", "/import/:path*", "/api/tasks/:path*", "/api/import/:path*"]
};
