import type { CreateGroupRequest, GroupDto } from "@/components/chat/types";
import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api";

interface UseGroupsReturn {
  groups: GroupDto[];
  publicGroups: GroupDto[];
  userGroups: GroupDto[];
  isLoading: boolean;
  error: string | null;
  createGroup: (
    request: CreateGroupRequest,
    owner: string
  ) => Promise<GroupDto | null>;
  joinGroup: (groupId: number, username: string) => Promise<GroupDto | null>;
  leaveGroup: (groupId: number, username: string) => Promise<GroupDto | null>;
  searchPublicGroups: (query: string) => Promise<GroupDto[]>;
  loadUserGroups: (username: string) => Promise<void>;
  loadPublicGroups: () => Promise<void>;
  refreshGroups: (username: string) => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [publicGroups, setPublicGroups] = useState<GroupDto[]>([]);
  const [userGroups, setUserGroups] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(error);
    if (error.response?.data?.error) {
      setError(error.response.data.error);
    } else if (error.message) {
      setError(error.message);
    } else {
      setError(defaultMessage);
    }
  }, []);

  const createGroup = useCallback(
    async (
      request: CreateGroupRequest,
      owner: string
    ): Promise<GroupDto | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/groups?owner=${encodeURIComponent(owner)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        const group: GroupDto = await response.json();

        // Atualizar a lista de grupos do usuário
        setUserGroups((prev) => [...prev, group]);

        // Se for público, também adicionar à lista de grupos públicos
        if (group.type === "PUBLIC") {
          setPublicGroups((prev) => [...prev, group]);
        }

        return group;
      } catch (error: any) {
        handleError(error, "Erro ao criar grupo");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const joinGroup = useCallback(
    async (groupId: number, username: string): Promise<GroupDto | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/groups/${groupId}/members?username=${encodeURIComponent(
            username
          )}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        const group: GroupDto = await response.json();

        // Atualizar a lista de grupos do usuário
        setUserGroups((prev) => {
          const filtered = prev.filter((g) => g.id !== groupId);
          return [...filtered, group];
        });

        // Atualizar também na lista de grupos públicos se necessário
        setPublicGroups((prev) =>
          prev.map((g) => (g.id === groupId ? group : g))
        );

        return group;
      } catch (error: any) {
        handleError(error, "Erro ao entrar no grupo");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const leaveGroup = useCallback(
    async (groupId: number, username: string): Promise<GroupDto | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/groups/${groupId}/members?username=${encodeURIComponent(
            username
          )}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        const group: GroupDto = await response.json();

        // Remover da lista de grupos do usuário
        setUserGroups((prev) => prev.filter((g) => g.id !== groupId));

        // Atualizar na lista de grupos públicos se necessário
        setPublicGroups((prev) =>
          prev.map((g) => (g.id === groupId ? group : g))
        );

        return group;
      } catch (error: any) {
        handleError(error, "Erro ao sair do grupo");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const searchPublicGroups = useCallback(
    async (query: string): Promise<GroupDto[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/groups/public/search?query=${encodeURIComponent(
            query
          )}`
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const groups: GroupDto[] = await response.json();
        return groups;
      } catch (error: any) {
        handleError(error, "Erro ao buscar grupos");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const loadUserGroups = useCallback(
    async (username: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/groups/user/${encodeURIComponent(username)}`
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const groups: GroupDto[] = await response.json();
        setUserGroups(groups);
      } catch (error: any) {
        handleError(error, "Erro ao carregar grupos do usuário");
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const loadPublicGroups = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/groups/public`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const groups: GroupDto[] = await response.json();
      setPublicGroups(groups);
    } catch (error: any) {
      handleError(error, "Erro ao carregar grupos públicos");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const refreshGroups = useCallback(
    async (username: string): Promise<void> => {
      await Promise.all([loadUserGroups(username), loadPublicGroups()]);
    },
    [loadUserGroups, loadPublicGroups]
  );

  // Combinar grupos do usuário e públicos
  useEffect(() => {
    console.log("[useGroups] Combinando grupos...");
    console.log(
      "[useGroups] userGroups:",
      userGroups.length,
      userGroups.map((g) => ({ id: g.id, name: g.name }))
    );
    console.log(
      "[useGroups] publicGroups:",
      publicGroups.length,
      publicGroups.map((g) => ({ id: g.id, name: g.name }))
    );

    const allGroups = [...userGroups];

    // Adicionar grupos públicos que não estão na lista do usuário
    publicGroups.forEach((publicGroup) => {
      if (!userGroups.some((userGroup) => userGroup.id === publicGroup.id)) {
        allGroups.push(publicGroup);
      }
    });

    // Definir isUserMember para todos os grupos
    const groupsWithMembershipInfo = allGroups.map((group) => {
      const isUserMember = userGroups.some(
        (userGroup) => userGroup.id === group.id
      );
      const result = {
        ...group,
        isUserMember,
        isUserOwner: userGroups.some(
          (userGroup) => userGroup.id === group.id && userGroup.owner?.username
        ),
      };
      console.log(
        `[useGroups] Grupo ${group.id} (${group.name}): isUserMember=${isUserMember}`
      );
      return result;
    });

    console.log(
      "[useGroups] Grupos finais:",
      groupsWithMembershipInfo.length
    );
    setGroups(groupsWithMembershipInfo);
  }, [userGroups, publicGroups]);
  return {
    groups,
    publicGroups,
    userGroups,
    isLoading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    searchPublicGroups,
    loadUserGroups,
    loadPublicGroups,
    refreshGroups,
  };
}
