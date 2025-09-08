import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	return (
		<header className="p-2 flex gap-2 bg-background justify-between border-b border-border h-[6vh]">
			<nav className="px-2 font-bold text-primary flex flex-row items-center gap-2">
				<div className="flex items-center gap-1">
					<img src="/logobanachat.png" alt="Logo" className="inline w-8" />
					<Link to="/">BananaChat</Link>
				</div>
			</nav>
			<div className="px-2 my-auto">
				<ModeToggle />
			</div>
		</header>
	);
}
