
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, History } from "lucide-react";
import { ShippingSettings } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

interface ReactivationSettingsProps {
  settings: ShippingSettings;
  onSave: (settings: ShippingSettings) => void;
}

export default function ReactivationSettings({
  settings,
  onSave,
}: ReactivationSettingsProps) {
  const { toast } = useToast();
  const [period, setPeriod] = React.useState(settings.reactivationPeriodDays || 14);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onSave({ ...settings, reactivationPeriodDays: period });

    toast({
      title: "Configurações Salvas!",
      description: "O período para reativação de clientes foi atualizado.",
    });

    setIsSubmitting(false);
  };

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <History className="h-6 w-6" />
          Configurações de Reativação
        </CardTitle>
        <CardDescription>
          Defina após quantos dias um cliente aprovado deve ser movido para a
          coluna de "Reativar" para um novo contato de venda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="reactivation-period" className="text-base font-semibold">
            Período para Reativação (em dias)
          </Label>
          <Input
            id="reactivation-period"
            type="number"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="max-w-xs mt-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Um lead na coluna "Aprovado" será movido para "Reativar" após este
            número de dias desde a última aprovação.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
