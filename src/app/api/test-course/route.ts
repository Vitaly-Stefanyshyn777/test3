import { NextRequest, NextResponse } from "next/server";
import { fetchCourse } from "@/lib/bfbApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const course = await fetchCourse(courseId);

    return NextResponse.json({
      course_data: course.course_data,
      has_what_learn: !!(course.course_data?.What_learn && course.course_data.What_learn.length > 0),
      has_course_include: !!(course.course_data?.Course_include && course.course_data.Course_include.length > 0),
      has_course_themes: !!(course.course_data?.Course_themes && course.course_data.Course_themes.length > 0)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}
