import { Section, Container } from "@/components/craft";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import PdfViewer from "@/components/estimate-details/PdfViewer";
import ImageGalleryClient from "@/components/estimate-details/ImageGalleryClient";

type PageProps = {
  params: Promise<{
    tenantId: string;
    submissionId: string;
  }>;
  searchParams: Promise<{
    tenant_id?: string;
    estimate_id?: string;
  }>;
};

type Submission = {
  submission_id: string;
  tenant_id: string;
  title: string | null;
  summary: string | null;
  connected_person_id: string | null;
};

type Person = {
  first_name: string | null;
  last_name: string | null;
  email_primary: string | null;
};

type SubmissionFile = {
  file_name: string | null;
  file_url: string | null;
  file_mime_type: string | null;
  file_position: number | null;
};

type InquiryPhotoAnnotation = {
  id: string;
  photo_url: string | null;
  is_top_picture: boolean;
  created_at: string;
};

// Helper function to extract filename from URL
const extractFilenameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  try {
    // Remove the hash/anchor part (e.g., #photoId=...)
    const urlWithoutHash = url.split("#")[0];
    // Get the last segment after the last slash
    const segments = urlWithoutHash.split("/");
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
};

const isPdfFile = (file: SubmissionFile) =>
  (file.file_mime_type || "").toLowerCase().includes("pdf") ||
  (file.file_name || "").toLowerCase().endsWith(".pdf");

export default async function EstimateDetailsPage({ params, searchParams }: PageProps) {
  const { tenantId: pathTenantId, submissionId: pathSubmissionId } = await params;
  const { tenant_id: queryTenantId, estimate_id: querySubmissionId } = await searchParams;

  // Use query parameters if available, otherwise fall back to path parameters
  const tenantId = queryTenantId ?? pathTenantId;
  const submissionId = querySubmissionId ?? pathSubmissionId;
  const supabase = await getSupabaseServiceClient();

  const { data: submission } = await supabase
    .from("form_submissions")
    .select("submission_id, tenant_id, title, summary, connected_person_id")
    .eq("tenant_id", tenantId)
    .eq("submission_id", submissionId)
    .maybeSingle<Submission>();

  // Step 1: Fetch photo annotations from inquiry_photo_annotations table
  const { data: photoAnnotations } = await supabase
    .from("inquiry_photo_annotations")
    .select("id, photo_url, is_top_picture, created_at")
    .eq("submission_id", submissionId)
    .eq("tenant_id", tenantId)
    .eq("is_top_picture", true)
    .returns<InquiryPhotoAnnotation[]>();

  // Step 2: Fetch all files from form_submission_files table for this submission
  const { data: submissionFiles } = await supabase
    .from("form_submission_files")
    .select("file_name, file_url, file_mime_type, file_position")
    .eq("submission_id", submissionId)
    .returns<SubmissionFile[]>();

  // Step 3: Build image files directly from inquiry_photo_annotations
  const imageFiles = (photoAnnotations ?? [])
    .map((annotation) => ({
      file_name: extractFilenameFromUrl(annotation.photo_url),
      file_url: annotation.photo_url,
      file_mime_type: "image",
      file_position: null,
      _created_at: annotation.created_at,
    }))
    .filter((file) => Boolean(file.file_url))
    .sort((a, b) => {
      const aTime = new Date(a._created_at).getTime();
      const bTime = new Date(b._created_at).getTime();
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      return (a.file_name || "").localeCompare(b.file_name || "");
    })
    .map(({ _created_at, ...file }) => file);

  const personId = submission?.connected_person_id ?? null;
  const { data: person } = personId
    ? await supabase
        .from("sa_persons")
        .select("first_name, last_name, email_primary")
        .eq("person_id", personId)
        .maybeSingle<Person>()
    : { data: null };

  const pdfFile = (submissionFiles ?? []).find(isPdfFile) ?? null;

  return (
    <Section className="py-6 md:py-8">
      <Container className="max-w-none px-5 py-6 sm:px-5 sm:py-8">
        <div className="space-y-6">
          <header className="space-y-2 text-center">
            <p className="text-[35px] leading-tight tracking-wide text-foreground">
              Angebot{" "}
              <span className="text-primary font-semibold">6607</span> und
              Schadensbilder zum Download
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {person ? `Hallo Herr ${person.last_name ?? ""},`.trim() : "Hallo there"}
            </h1>
            <p className="mx-auto max-w-3xl text-[20px] leading-relaxed text-muted-foreground">
              hier finden Sie Ihr Angebot zum Download inklusive der Schadensbilder.
            </p>
          </header>

          <div className="grid w-full items-start gap-6 md:grid-cols-2">
            <section className="rounded-lg border bg-background p-4 shadow-sm">
              {pdfFile?.file_url && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">PDF Preview</h2>
                    <span className="text-xs text-muted-foreground">Supabase</span>
                  </div>
                  <a
                    href={`/api/pdf?url=${encodeURIComponent(pdfFile.file_url)}&download=1&filename=${encodeURIComponent(pdfFile.file_name ?? "PDF preview")}`}
                    className="rounded-md border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Download
                  </a>
                </div>
              )}
              <div className="rounded-md border border-dashed p-4">
                {pdfFile?.file_url ? (
                  <PdfViewer
                    url={pdfFile.file_url}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No PDF uploaded for this estimate yet.
                  </span>
                )}
              </div>
              {pdfFile?.file_url && (
                <div className="flex justify-center mt-4">
                  <a
                    href={`/api/pdf?url=${encodeURIComponent(pdfFile.file_url)}&download=1&filename=${encodeURIComponent(pdfFile.file_name ?? "PDF preview")}`}
                    className="rounded-md border px-6 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Download
                  </a>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                This area embeds the PDF file linked to the submission.
              </p>
            </section>

            <ImageGalleryClient
              imageFiles={imageFiles}
              showDynamic={true}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
