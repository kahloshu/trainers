import { NextRequest, NextResponse } from "next/server";
import { validateSession, SESSION_COOKIE, type TrainerSession } from "@/lib/trainer-auth";

type Handler<T extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  session: TrainerSession,
  params: T
) => Promise<NextResponse>;

export function withTrainerAuth<T extends Record<string, string> = Record<string, string>>(
  handler: Handler<T>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;
    return handler(request, session, params);
  };
}
