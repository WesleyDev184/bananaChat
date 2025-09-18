import type { GroupDto } from "@/components/chat/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Globe, Lock, UserMinus, UserPlus, Users } from "lucide-react";

interface GroupListProps {
  groups: GroupDto[];
  currentUsername: string;
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
  onJoinGroup: (groupId: number) => Promise<void>;
  onLeaveGroup: (groupId: number) => Promise<void>;
  isLoading: boolean;
}

export default function GroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onJoinGroup,
  onLeaveGroup,
  isLoading,
}: GroupListProps) {
  const getGroupIcon = (type: string) => {
    switch (type) {
      case "PUBLIC":
        return <Globe className="h-4 w-4" />;
      case "PRIVATE":
        return <Lock className="h-4 w-4" />;
      case "RESTRICTED":
        return <Users className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (
    type: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "PUBLIC":
        return "default";
      case "PRIVATE":
        return "secondary";
      case "RESTRICTED":
        return "outline";
      default:
        return "default";
    }
  };

  const handleGroupAction = async (group: GroupDto) => {
    if (group.isUserMember) {
      if (group.isUserOwner) {
        // Owner não pode sair do próprio grupo
        return;
      }
      await onLeaveGroup(group.id);
    } else {
      await onJoinGroup(group.id);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Users className="h-8 w-8 mb-2" />
        <p className="text-sm">Nenhum grupo disponível</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
              selectedGroupId === group.id
                ? "bg-accent border-accent-foreground/20"
                : "bg-card"
            }`}
            onClick={() => onSelectGroup(group.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getGroupIcon(group.type)}
                <h4 className="font-medium text-sm truncate flex-1">
                  {group.name}
                </h4>
                {group.isUserOwner && (
                  <div title="Você é o dono">
                    <Crown className="h-3 w-3 text-yellow-500" />
                  </div>
                )}
              </div>
              <Badge
                variant={getTypeBadgeVariant(group.type)}
                className="text-xs"
              >
                {group.type}
              </Badge>
            </div>

            {group.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {group.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                  {group.memberCount}/{group.maxMembers}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {group.isUserMember ? (
                  <>
                    <Badge variant="outline" className="text-xs">
                      Membro
                    </Badge>
                    {!group.isUserOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupAction(group);
                        }}
                        disabled={isLoading}
                        className="h-6 px-2 text-xs"
                      >
                        <UserMinus className="h-3 w-3" />
                        Sair
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupAction(group);
                    }}
                    disabled={
                      isLoading ||
                      !group.isActive ||
                      group.memberCount >= group.maxMembers
                    }
                    className="h-6 px-2 text-xs"
                  >
                    <UserPlus className="h-3 w-3" />
                    Entrar
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              <span>Criado por: {group.owner.displayName}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
