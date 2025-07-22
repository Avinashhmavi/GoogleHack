import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { gradesDb } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const grades = await gradesDb.getGrades(user.uid);
  return NextResponse.json({ grades });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const grade = await req.json();
  await gradesDb.addGrade(user.uid, grade);
  const grades = await gradesDb.getGrades(user.uid);
  return NextResponse.json({ grades });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
  }
  const { id } = await req.json();
  await gradesDb.deleteGrade(user.uid, id);
  const grades = await gradesDb.getGrades(user.uid);
  return NextResponse.json({ grades });
} 