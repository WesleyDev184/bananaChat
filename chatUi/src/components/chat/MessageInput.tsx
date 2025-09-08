import { Button } from "@/components/ui/button";
import React from "react";

export default function MessageInput({
	onSend,
}: {
	onSend: (text: string) => void;
}) {
	const [value, setValue] = React.useState("");

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		const text = value.trim();
		if (!text) return;
		onSend(text);
		setValue("");
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Digite uma mensagem..."
				className="flex-1 rounded-md border px-3 py-2 outline-none"
			/>
			<Button type="submit">Enviar</Button>
		</form>
	);
}
