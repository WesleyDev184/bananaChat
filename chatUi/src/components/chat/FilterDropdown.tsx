import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMessageFilters } from "@/hooks/useMessageFilters";
import { MoreHorizontal, Search, X } from "lucide-react";

export default function FilterDropdown() {
  const {
    messageTypes,
    setMessageTypes,
    period,
    setPeriod,
    searchTerm,
    setSearchTerm,
  } = useMessageFilters();

  const toggleMessageType = (type: string) => {
    if (messageTypes.includes(type)) {
      setMessageTypes(messageTypes.filter((t) => t !== type));
    } else {
      setMessageTypes([...messageTypes, type]);
    }
  };

  const clearFilters = () => {
    setMessageTypes(["CHAT", "JOIN", "LEAVE"]);
    setPeriod("all");
    setSearchTerm("");
  };

  const hasActiveFilters =
    messageTypes.length !== 3 || period !== "all" || searchTerm !== "";

  return (
    <div className="flex items-center gap-2">
      {/* Indicadores de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1">
          {searchTerm && (
            <Badge variant="secondary" className="h-5 text-xs">
              Busca: {searchTerm}
            </Badge>
          )}
          {period !== "all" && (
            <Badge variant="secondary" className="h-5 text-xs">
              {period === "today" && "📅 Hoje"}
              {period === "week" && "📊 Semana"}
              {period === "month" && "📈 Mês"}
            </Badge>
          )}
          {messageTypes.length !== 3 && (
            <Badge variant="secondary" className="h-5 text-xs">
              {messageTypes.length} tipos
            </Badge>
          )}
        </div>
      )}

      {/* Dropdown com 3 pontinhos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            <MoreHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {/* Busca dentro do dropdown */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Tipos de Mensagem</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={messageTypes.includes("CHAT")}
            onCheckedChange={() => toggleMessageType("CHAT")}
          >
            💬 Mensagens de Chat
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={messageTypes.includes("JOIN")}
            onCheckedChange={() => toggleMessageType("JOIN")}
          >
            👋 Usuários Entrando
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={messageTypes.includes("LEAVE")}
            onCheckedChange={() => toggleMessageType("LEAVE")}
          >
            🚪 Usuários Saindo
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Período</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={period === "all"}
            onCheckedChange={() => setPeriod("all")}
          >
            🕒 Todas as mensagens
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={period === "today"}
            onCheckedChange={() => setPeriod("today")}
          >
            📅 Hoje
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={period === "week"}
            onCheckedChange={() => setPeriod("week")}
          >
            📊 Esta semana
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={period === "month"}
            onCheckedChange={() => setPeriod("month")}
          >
            📈 Este mês
          </DropdownMenuCheckboxItem>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
