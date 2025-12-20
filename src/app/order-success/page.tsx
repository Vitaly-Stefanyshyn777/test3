import OrderSuccessSection from "@/components/sections/OrderSuccessSection/OrderSuccessSection";

interface OrderSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderId = typeof params.orderId === 'string' ? params.orderId : null;

  return <OrderSuccessSection initialOrderId={orderId} />;
}
