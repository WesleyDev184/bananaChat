import type { CreateGroupRequest } from "@/components/chat/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CreateGroupDialogProps {
  onCreateGroup: (request: CreateGroupRequest) => Promise<void>;
  isLoading: boolean;
}

export default function CreateGroupDialog({
  onCreateGroup,
  isLoading,
}: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    type: "PRIVATE",
    maxMembers: 100,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação simples
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (formData.maxMembers && formData.maxMembers < 2) {
      newErrors.maxMembers = "Mínimo de 2 membros";
    }

    if (formData.maxMembers && formData.maxMembers > 1000) {
      newErrors.maxMembers = "Máximo de 1000 membros";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onCreateGroup(formData);
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          type: "PUBLIC",
          maxMembers: 100,
        });
        setErrors({});
      } catch (error) {
        console.error("Erro ao criar grupo:", error);
      }
    }
  };

  const handleInputChange = (field: keyof CreateGroupRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
            <DialogDescription>
              Crie um grupo para conversar com várias pessoas ao mesmo tempo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                placeholder="Ex: Equipe de Desenvolvimento"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito do grupo..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo do Grupo</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    e.target.value as "PUBLIC" | "PRIVATE" | "RESTRICTED"
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="PRIVATE">Privado (apenas por convite)</option>
                <option value="PUBLIC">
                  Público (qualquer um pode entrar)
                </option>
                <option value="RESTRICTED">
                  Restrito (aprovação necessária)
                </option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxMembers">Máximo de Membros</Label>
              <Input
                id="maxMembers"
                type="number"
                min="2"
                max="1000"
                value={formData.maxMembers}
                onChange={(e) =>
                  handleInputChange(
                    "maxMembers",
                    parseInt(e.target.value) || 100
                  )
                }
                className={errors.maxMembers ? "border-red-500" : ""}
              />
              {errors.maxMembers && (
                <span className="text-sm text-red-500">
                  {errors.maxMembers}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
