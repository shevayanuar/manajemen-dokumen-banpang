import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ step: "user_not_found", email });

    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({ 
      step: "done",
      userFound: true,
      passwordValid: isValid,
      passwordHashPrefix: user.password.substring(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ step: "error", error: String(error) });
  }
}