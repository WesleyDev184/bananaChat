import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMessageFilters } from "@/hooks/useMessageFilters";
import {
  BarChart3,
  Calendar,
  Clock,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Search,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";

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

  const handlePeriodChange = (value: string) => {
    setPeriod(value as "today" | "week" | "month" | "all");
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
            <Badge
              variant="secondary"
              className="h-5 text-xs flex items-center gap-1"
            >
              {period === "today" && (
                <>
                  <Calendar className="h-3 w-3" />
                  Hoje
                </>
              )}
              {period === "week" && (
                <>
                  <BarChart3 className="h-3 w-3" />
                  Semana
                </>
              )}
              {period === "month" && (
                <>
                  <TrendingUp className="h-3 w-3" />
                  Mês
                </>
              )}
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
            <MessageCircle className="h-4 w-4 mr-2" />
            Mensagens de Chat
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={messageTypes.includes("JOIN")}
            onCheckedChange={() => toggleMessageType("JOIN")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Usuários Entrando
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={messageTypes.includes("LEAVE")}
            onCheckedChange={() => toggleMessageType("LEAVE")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Usuários Saindo
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Período</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={period}
            onValueChange={handlePeriodChange}
          >
            <DropdownMenuRadioItem value="all">
              <Clock className="h-4 w-4 mr-2" />
              Todas as mensagens
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="today">
              <Calendar className="h-4 w-4 mr-2" />
              Hoje
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="week">
              <BarChart3 className="h-4 w-4 mr-2" />
              Esta semana
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="month">
              <TrendingUp className="h-4 w-4 mr-2" />
              Este mês
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

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
                  <X className="h-4 w-4" />
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
