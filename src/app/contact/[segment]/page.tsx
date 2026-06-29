import { ContactSection } from "@/components/sections/ContactSection";

export default async function ContactSubPage({
  params,
  searchParams,
}: {
  params: Promise<{ segment: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { segment } = await params;
  return <ContactSection segment={segment} searchParams={searchParams} />;
}
