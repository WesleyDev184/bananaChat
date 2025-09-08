import { TanstackDevtools } from "@tanstack/react-devtools";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Header from "../components/Header";

export const Route = createRootRoute({
	component: () => (
		<>
			<Header />
			<div className="h-[calc(100vh-6vh)] max-h-[calc(100vh-6vh)] flex flex-col">
				<Outlet />
			</div>
			<TanstackDevtools
				config={{
					position: "bottom-left",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</>
	),
});
