import { ContactSection } from "@/components/sections/ContactSection";

export default function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  return <ContactSection segment="" searchParams={searchParams} />;
}
