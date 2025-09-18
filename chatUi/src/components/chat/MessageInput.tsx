import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyPress={handleKeyPress}
				placeholder="Digite uma mensagem..."
				className="flex-1"
			/>
			<Button type="submit" disabled={!value.trim()}>
				Enviar
			</Button>
		</form>
	);
}
