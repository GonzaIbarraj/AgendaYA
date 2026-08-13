import { BookingFlow } from "@/components/BookingFlow";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookingFlow slug={slug} />;
}
