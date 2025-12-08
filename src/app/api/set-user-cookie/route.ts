import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    console.log("🍪 [set-user-cookie] POST запит отримано:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      isProduction: process.env.NODE_ENV === "production",
    });

    if (!token) {
      console.log("🍪 [set-user-cookie] Токен відсутній, повертаю 400");
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("bfb_user_jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 днів
    });

    console.log("🍪 [set-user-cookie] Кукі встановлено:", {
      name: "bfb_user_jwt",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: "30 days",
    });

    return res;
  } catch (e) {
    console.error("🍪 [set-user-cookie] Помилка:", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bfb_user_jwt", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
