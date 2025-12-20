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

    // Імітуємо логіку з coursesQueries.ts
    let courseCoach = null;
    if (typeof courseCoachData === 'object' && courseCoachData?.ID) {
      courseCoach = courseCoachData; // Використовуємо повний об'єкт
    }

    return NextResponse.json({
      course_id: wcCourse.id,
      course_title: wcCourse.name,
      raw_instructor: courseCoachData,
      processed_instructor: courseCoach,
      has_instructor: !!courseCoach,
      instructor_type: typeof courseCoach,
      instructor_id: courseCoach?.ID,
      instructor_title: courseCoach?.post_title || courseCoach?.title
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch instructor data",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
