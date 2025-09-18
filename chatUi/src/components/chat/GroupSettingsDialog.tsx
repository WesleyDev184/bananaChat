import type { GroupDto } from "@/components/chat/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Crown,
  Edit3,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface GroupSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupDto | null;
  currentUsername: string;
  onUpdateGroup: (
    groupId: number,
    name: string,
    description: string
  ) => Promise<void>;
  onRemoveMember: (groupId: number, username: string) => Promise<void>;
  onDeleteGroup: (groupId: number) => Promise<void>;
  isLoading?: boolean;
}

export default function GroupSettingsDialog({
  isOpen,
  onClose,
  group,
  currentUsername,
  onUpdateGroup,
  onRemoveMember,
  onDeleteGroup,
  isLoading = false,
}: GroupSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  // Resetar valores quando o grupo mudar
  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description || "");
    }
  }, [group]);

  const handleUpdateGroup = async () => {
    if (!group || !groupName.trim()) return;

    try {
      await onUpdateGroup(group.id, groupName.trim(), groupDescription.trim());
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
    }
  };

  const handleRemoveMember = (username: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover ${username} do grupo? Esta ação não pode ser desfeita.`
      )
    ) {
      if (group) {
        onRemoveMember(group.id, username);
      }
    }
  };

  const handleDeleteGroup = () => {
    if (
      window.confirm(
        `Tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita e todos os membros perderão acesso ao grupo.`
      )
    ) {
      if (group) {
        onDeleteGroup(group.id);
      }
    }
  };

  const handleClose = () => {
    // Resetar valores ao fechar
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description || "");
    }
    setActiveTab("general");
    onClose();
  };

  if (!group) return null;

  const isOwner = group.owner?.username === currentUsername;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configurações do Grupo
          </DialogTitle>
          <DialogDescription>
            Gerencie as configurações, membros e permissões do grupo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="members">Membros</TabsTrigger>
              <TabsTrigger value="danger">Zona de Perigo</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[400px] overflow-hidden">
              <TabsContent
                value="general"
                className="space-y-4 h-full overflow-auto"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Nome do Grupo</Label>
                    <Input
                      id="group-name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Digite o nome do grupo"
                      disabled={!isOwner}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-description">Descrição</Label>
                    <Textarea
                      id="group-description"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Digite uma descrição para o grupo"
                      rows={3}
                      disabled={!isOwner}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{group.members?.length || 0} membros</span>
                  </div>

                  {isOwner && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpdateGroup}
                        disabled={isLoading || !groupName.trim()}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Salvar Alterações
                      </Button>
                    </div>
                  )}

                  {!isOwner && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Apenas o criador do grupo pode editar essas
                        configurações.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="members"
                className="space-y-4 h-full overflow-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Membros do Grupo</h3>
                    <Badge variant="secondary">
                      {group.members?.length || 0} membros
                    </Badge>
                  </div>

                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {group.members?.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {member.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{member.username}</p>
                              {member.username === group.owner?.username && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Crown className="h-3 w-3" />
                                  Criador
                                </div>
                              )}
                            </div>
                          </div>

                          {isOwner && member.username !== currentUsername && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveMember(member.username)
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {!isOwner && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Apenas o criador do grupo pode gerenciar membros.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="danger"
                className="space-y-4 h-full overflow-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Zona de Perigo</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Deletar Grupo
                      </h4>
                      <p className="text-sm text-red-700 mb-4">
                        Esta ação irá deletar permanentemente o grupo e remover
                        todos os membros. Esta ação não pode ser desfeita.
                      </p>

                      {isOwner ? (
                        <Button
                          variant="destructive"
                          onClick={handleDeleteGroup}
                          className="flex items-center gap-2"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          Deletar Grupo
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Apenas o criador do grupo pode deletá-lo.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
