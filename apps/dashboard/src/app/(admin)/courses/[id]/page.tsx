import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { CourseEditor, type Course, type Registration } from "@/components/courses/CourseEditor";

export const metadata: Metadata = { title: "Course" };

/** Course builder: details, units and lessons, publishing, registrations. */
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [{ lang, t }, course, regs] = await Promise.all([
    getDict(),
    apiGet<{ course: Course }>(`/admin/courses/${id}`),
    apiGet<{ items: Registration[] }>(`/admin/courses/${id}/registrations`),
  ]);
  if (course.status === 404) notFound();
  const portalUrl = process.env.PORTAL_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/courses" className="self-start text-sm font-semibold text-blue hover:text-navy">
        {lang === "ar" ? "→" : "←"} {t.courses.back}
      </Link>
      {!course.data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{course.status === 503 ? t.apiDown : t.error}</p>
      ) : (
        <CourseEditor
          key={course.data.course.id}
          course={course.data.course}
          registrations={regs.data?.items ?? []}
          lang={lang}
          portalUrl={portalUrl}
          t={t.courses}
          image={t.content.image}
          error={t.error}
          previewT={t.preview}
        />
      )}
    </div>
  );
}
