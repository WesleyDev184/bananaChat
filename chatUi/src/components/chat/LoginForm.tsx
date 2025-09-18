import type { ConnectionStatus } from "@/components/chat/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function LoginForm({
	username,
	setUsername,
	connectionStatus,
	isLoadingHistory,
	onJoinChat,
	onKeyPress,
}: {
	username: string;
	setUsername: (username: string) => void;
	connectionStatus: ConnectionStatus;
	isLoadingHistory: boolean;
	onJoinChat: () => void;
	onKeyPress: (e: React.KeyboardEvent) => void;
}) {
	return (
		<div className="h-full w-full rounded-lg border bg-background shadow-sm flex items-center justify-center p-4">
			<div className="bg-card border rounded-xl shadow-xl max-w-md w-full mx-auto">
				{/* Header */}
				<div className="text-center px-8 pt-8 pb-6">
					<div className="mb-4">
						<div className="flex items-center justify-center gap-1">
							<img src="/logobanachat.png" alt="Logo" className="inline w-14" />
							<h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
								BananaChat
							</h1>
						</div>
						<p className="text-muted-foreground text-base">
							Entre no chat e comece a conversar!
						</p>
					</div>
				</div>

				{/* Loading State */}
				{isLoadingHistory && (
					<div className="px-8 mb-6">
						<div className="text-center">
							<div className="text-sm text-yellow-500 mb-3 font-medium">
								Preparando o chat...
							</div>
							<Progress value={60} className="w-full h-2" />
						</div>
					</div>
				)}

				{/* Connection Status */}
				<div className="px-8 mb-8">
					<div className="bg-muted/50 rounded-lg p-4">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-medium text-muted-foreground">
								Status da conexão:
							</span>
							<span
								className={`text-sm font-semibold flex items-center gap-2 ${
									connectionStatus === "Conectado"
										? "text-green-500"
										: connectionStatus === "Conectando..."
											? "text-yellow-500"
											: "text-red-500"
								}`}
							>
								<div
									className={`w-2 h-2 rounded-full ${
										connectionStatus === "Conectado"
											? "bg-green-500"
											: connectionStatus === "Conectando..."
												? "bg-yellow-500 animate-pulse"
												: "bg-red-500"
									}`}
								/>
								{connectionStatus}
							</span>
						</div>
						<div
							className={`h-1.5 rounded-full transition-all duration-300 ${
								connectionStatus === "Conectado"
									? "bg-green-500"
									: connectionStatus === "Conectando..."
										? "bg-yellow-500 animate-pulse"
										: "bg-red-500"
							}`}
						/>
					</div>
				</div>

				{/* Form */}
				<div className="px-8 pb-6">
					<div className="space-y-6">
						<div className="space-y-3">
							<Label
								htmlFor="username-input"
								className="text-sm font-medium text-foreground"
							>
								Seu nome de usuário
							</Label>
							<Input
								id="username-input"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								onKeyPress={onKeyPress}
								placeholder="Digite seu nome..."
								disabled={connectionStatus !== "Conectado"}
								className="w-full h-12 text-base"
								autoFocus
							/>
						</div>

						<Button
							onClick={onJoinChat}
							disabled={connectionStatus !== "Conectado" || !username.trim()}
							className="w-full h-12 text-base font-medium"
							size="lg"
						>
							{connectionStatus === "Conectando..."
								? "Conectando..."
								: "Entrar no Chat"}
						</Button>
					</div>
				</div>

				{/* Footer */}
				<div className="px-8 pb-8">
					<div className="bg-muted/30 rounded-lg p-4 text-center">
						<p className="text-xs text-muted-foreground leading-relaxed">
							Ao entrar, você poderá conversar no chat global ou enviar
							mensagens privadas para outros usuários online.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
