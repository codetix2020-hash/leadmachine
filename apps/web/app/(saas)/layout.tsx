import { config } from "@repo/config";
import { SessionProvider } from "@saas/auth/components/SessionProvider";
import { sessionQueryKey } from "@saas/auth/lib/api";
import { getOrganizationList, getSession } from "@saas/auth/lib/server";
import { ActiveOrganizationProvider } from "@saas/organizations/components/ActiveOrganizationProvider";
import { organizationListQueryKey } from "@saas/organizations/lib/api";
import { ConfirmationAlertProvider } from "@saas/shared/components/ConfirmationAlertProvider";
import { Document } from "@shared/components/Document";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { PropsWithChildren } from "react";

// 🔓 Layout sin autenticación - SIMPLIFICADO AL MÁXIMO
export default async function SaaSLayout({ children }: PropsWithChildren) {
	const locale = await getLocale();
	const messages = await getMessages();
	const queryClient = getServerQueryClient();

	// 🔓 Render directo sin ningún provider que pueda bloquear
	return (
		<Document locale={locale}>
			<NextIntlClientProvider messages={messages}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					{children}
				</HydrationBoundary>
			</NextIntlClientProvider>
		</Document>
	);
}
