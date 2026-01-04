import { redirect } from "next/navigation";

// 🚀 Redirect automático a LEADMACHINE
export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	redirect("/app/leads");
}
