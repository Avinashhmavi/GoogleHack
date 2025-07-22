import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { studentRosterDb } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const students = await studentRosterDb.getStudents(user.uid);
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const student = await req.json();
  await studentRosterDb.addStudent(user.uid, student);
  const students = await studentRosterDb.getStudents(user.uid);
  return NextResponse.json({ students });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const { id } = await req.json();
  await studentRosterDb.deleteStudent(user.uid, id);
  const students = await studentRosterDb.getStudents(user.uid);
  return NextResponse.json({ students });
} 