import { NextResponse } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { UserError } from "./errors";

/** Wraps a route handler: user-facing errors become 4xx JSON, everything else a generic 500. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  return async (...args: A) => {
    try {
      return NextResponse.json(await fn(...args));
    } catch (e) {
      if (e instanceof UserError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        const issue = e.issues[0];
        const field = issue?.path.join(".");
        return NextResponse.json(
          { error: issue ? (field ? `${field}: ${issue.message}` : issue.message) : "Invalid request" },
          { status: 400 },
        );
      }
      console.error(e);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new UserError("Request body must be JSON");
  }
  return schema.parse(json);
}
