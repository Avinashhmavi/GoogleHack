import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { recognizeStudents } from "@/ai/flows/recognize-students";
import { studentRosterDb } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "User not authenticated." }, { status: 401 });
  }
  const { photoDataUri } = await req.json();
  try {
    const studentRoster = await studentRosterDb.getStudents(user.uid);
    const result = await recognizeStudents({ photoDataUri, studentRoster });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Recognition failed." });
  }
} 