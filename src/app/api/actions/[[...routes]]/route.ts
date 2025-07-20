
import { nextHandler } from "@genkit-ai/next/server";
import { NextRequest, NextResponse } from "next/server";
import {getAuthenticatedUser} from '@/lib/auth';

const handler = nextHandler();

export async function POST(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if(!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    return handler(req);
}
