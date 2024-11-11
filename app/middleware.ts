import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// Configuração opcional para páginas protegidas específicas
export const config = {
  matcher: ["/checkout/:path*", "/admin/:path*", "!/api/status-pagamento"],
};
