import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  isOnline: boolean;
  email: string;
}

interface UserSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (usernames: string[]) => void;
  groupName: string;
  currentMembers: string[]; // usernames já membros do grupo
  isLoading?: boolean;
}

const API_BASE_URL = "http://localhost:8080/api";

export default function UserSelectionDialog({
  isOpen,
  onClose,
  onAddMembers,
  groupName,
  currentMembers,
  isLoading = false,
}: UserSelectionDialogProps) {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Carregar lista de usuários
  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (response.ok) {
        const userData: UserInfo[] = await response.json();
        setUsers(userData);
      } else {
        console.error("Erro ao carregar usuários:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Carregar usuários quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUsers([]);
      setSearchTerm("");
    }
  }, [isOpen, loadUsers]);

  // Filtrar usuários disponíveis (excluir membros atuais)
  const availableUsers = users.filter(
    (user) => !currentMembers.includes(user.username)
  );

  // Filtrar por termo de busca
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar usuários online e offline
  const onlineUsers = filteredUsers.filter((user) => user.isOnline);
  const offlineUsers = filteredUsers.filter((user) => !user.isOnline);

  const handleUserToggle = (username: string) => {
    setSelectedUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const handleSelectAll = (userList: UserInfo[]) => {
    const usernames = userList.map((u) => u.username);
    const allSelected = usernames.every((username) =>
      selectedUsers.includes(username)
    );

    if (allSelected) {
      // Desmarcar todos
      setSelectedUsers((prev) =>
        prev.filter((username) => !usernames.includes(username))
      );
    } else {
      // Marcar todos
      setSelectedUsers((prev) => [
        ...prev.filter((username) => !usernames.includes(username)),
        ...usernames,
      ]);
    }
  };

  const handleSubmit = () => {
    if (selectedUsers.length > 0) {
      onAddMembers(selectedUsers);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchTerm("");
    onClose();
  };

  const UserListSection = ({
    title,
    users: userList,
    icon: Icon,
    badgeVariant,
  }: {
    title: string;
    users: UserInfo[];
    icon: React.ComponentType<{ className?: string }>;
    badgeVariant: "default" | "secondary";
  }) => {
    if (userList.length === 0) return null;

    const allSelected = userList.every((user) =>
      selectedUsers.includes(user.username)
    );

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium text-sm">{title}</span>
            <Badge variant={badgeVariant} className="text-xs">
              {userList.length}
            </Badge>
          </div>
          {userList.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectAll(userList)}
              className="h-6 px-2 text-xs"
            >
              {allSelected ? "Desmarcar todos" : "Marcar todos"}
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {userList.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => handleUserToggle(user.username)}
            >
              <Checkbox
                checked={selectedUsers.includes(user.username)}
                onCheckedChange={() => handleUserToggle(user.username)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Membros</DialogTitle>
          <DialogDescription>
            Selecione os usuários para adicionar ao grupo "{groupName}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              disabled={isLoadingUsers}
            />
          </div>

          {/* Lista de usuários */}
          <ScrollArea className="flex-1 min-h-0">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Carregando usuários...
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Nenhum usuário encontrado"
                    : "Todos os usuários já são membros do grupo"}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pr-2">
                <UserListSection
                  title="Usuários Online"
                  users={onlineUsers}
                  icon={UserCheck}
                  badgeVariant="default"
                />
                <UserListSection
                  title="Usuários Offline"
                  users={offlineUsers}
                  icon={User}
                  badgeVariant="secondary"
                />
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedUsers.length > 0 &&
                `${selectedUsers.length} usuário${
                  selectedUsers.length > 1 ? "s" : ""
                } selecionado${selectedUsers.length > 1 ? "s" : ""}`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedUsers.length === 0 || isLoading}
              >
                {isLoading
                  ? "Adicionando..."
                  : `Adicionar ${
                      selectedUsers.length > 0
                        ? `(${selectedUsers.length})`
                        : ""
                    }`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
