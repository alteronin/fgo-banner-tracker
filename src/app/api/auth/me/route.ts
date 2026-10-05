import { authConfigured, readSession } from "@/lib/server/session";
import { loadUser, syncConfigured } from "@/lib/server/store";

export async function GET() {
  const configured = authConfigured() && syncConfigured();
  const session = await readSession();
  if (!session || !configured) {
    return Response.json({ user: null, configured });
  }
  const user = await loadUser(session.sub);
  return Response.json({
    user: user
      ? { sub: user.sub, name: user.name, email: user.email, picture: user.picture }
      : null,
    configured,
  });
}
