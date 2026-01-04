import type { PropsWithChildren } from "react";

// 🔓 Layout simplificado sin AppWrapper que puede estar bloqueando
export default function UserLayout({ children }: PropsWithChildren) {
	return <div>{children}</div>;
}
