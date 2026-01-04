"use client";
import { config } from "@repo/config";
import { Logo } from "@shared/components/Logo";
import { cn } from "@ui/lib";
import {
	HomeIcon,
	UsersIcon,
	TrendingUpIcon,
	BarChart3Icon,
	InboxIcon,
	ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 🔓 NavBar sin autenticación
export function NavBar() {
	const pathname = usePathname();
	const { useSidebarLayout } = config.ui.saas;

	const menuItems = [
		{
			label: "Leads",
			href: "/app/leads",
			icon: UsersIcon,
			isActive: pathname.includes("/leads"),
		},
		{
			label: "Pipeline",
			href: "/app/pipeline",
			icon: TrendingUpIcon,
			isActive: pathname.includes("/pipeline"),
		},
		{
			label: "Analytics",
			href: "/app/analytics",
			icon: BarChart3Icon,
			isActive: pathname.includes("/analytics"),
		},
		{
			label: "Inbox",
			href: "/app/inbox",
			icon: InboxIcon,
			isActive: pathname.includes("/inbox"),
		},
		{
			label: "Persistence",
			href: "/app/persistence",
			icon: ZapIcon,
			isActive: pathname.includes("/persistence"),
		},
	];

	return (
		<nav
			className={cn("w-full", {
				"w-full md:fixed md:top-0 md:left-0 md:h-full md:w-[280px]":
					useSidebarLayout,
			})}
		>
			<div
				className={cn("container max-w-6xl py-4", {
					"container max-w-6xl py-4 md:flex md:h-full md:flex-col md:px-6 md:pt-6 md:pb-0":
						useSidebarLayout,
				})}
			>
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div
						className={cn("flex items-center gap-4 md:gap-2", {
							"md:flex md:w-full md:flex-col md:items-stretch md:align-stretch":
								useSidebarLayout,
						})}
					>
						<Link href="/app/leads" className="block">
							<Logo />
						</Link>
					</div>
				</div>

				<ul
					className={cn(
						"no-scrollbar -mx-4 -mb-4 mt-6 flex list-none items-center justify-start gap-4 overflow-x-auto px-4 text-sm",
						{
							"md:mx-0 md:my-4 md:flex md:flex-col md:items-stretch md:gap-1 md:px-0":
								useSidebarLayout,
						},
					)}
				>
					{menuItems.map((menuItem) => (
						<li key={menuItem.href}>
							<Link
								href={menuItem.href}
								className={cn(
									"flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3",
									[
										menuItem.isActive
											? "border-primary font-bold"
											: "border-transparent",
									],
									{
										"md:-mx-6 md:border-b-0 md:border-l-2 md:px-6 md:py-2":
											useSidebarLayout,
									},
								)}
								prefetch
							>
								<menuItem.icon
									className={`size-4 shrink-0 ${
										menuItem.isActive
											? "text-primary"
											: "opacity-50"
									}`}
								/>
								<span>{menuItem.label}</span>
							</Link>
						</li>
					))}
				</ul>

				{/* UserMenu removido - sin autenticación */}
			</div>
		</nav>
	);
}
