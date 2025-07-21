
import { nextHandler } from "@genkit-ai/next/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const handler = nextHandler();
    return handler(req);
}
