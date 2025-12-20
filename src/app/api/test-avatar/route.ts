import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Прямий запит до WooCommerce API
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_UPSTREAM_BASE}/wp-json/wc/v3/products/${courseId}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('ck_fbd08d0a763d79d93aff6c3a56306214710ebb71:cs_871e6f287926ed84839018c2d7578ef9a71865c4').toString('base64'),
        'Content-Type': 'application/json'
      }
    });

    if (!wcResponse.ok) {
      throw new Error(`WC API error: ${wcResponse.status}`);
    }

    const wcCourse = await wcResponse.json();
    const courseCoachData = wcCourse.acf?.course_coach;

    // Імітуємо логіку getAvatarUrl з компонента
    const getAvatarUrl = (coach: any) => {
      if (!coach?.img_link_avatar) {
        return "/images/instructor-course1.png";
      }

      if (Array.isArray(coach.img_link_avatar)) {
        return coach.img_link_avatar[0] || "/images/instructor-course1.png";
      }

      if (typeof coach.img_link_avatar === "string") {
        if (coach.img_link_avatar.startsWith("http")) {
          return coach.img_link_avatar;
        }

        try {
          const parsed = JSON.parse(coach.img_link_avatar);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
          if (typeof parsed === "string") {
            return parsed;
          }
        } catch {
          return coach.img_link_avatar;
        }
      }

      return "/images/instructor-course1.png";
    };

    const avatarUrl = getAvatarUrl(courseCoachData);

    return NextResponse.json({
      course_id: wcCourse.id,
      coach_data: courseCoachData,
      img_link_avatar: courseCoachData?.img_link_avatar,
      avatar_url: avatarUrl,
      is_fallback: avatarUrl === "/images/instructor-course1.png"
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to test avatar",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
