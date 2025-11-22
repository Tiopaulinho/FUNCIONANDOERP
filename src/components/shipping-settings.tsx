
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
import { Loader2, Save, Ship } from "lucide-react";
import { ShippingSettings, ShippingTier } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

interface ShippingSettingsProps {
  settings: ShippingSettings;
  onSave: (settings: ShippingSettings) => void;
}

export default function ShippingSettingsComponent({
  settings,
  onSave,
}: ShippingSettingsProps) {
  const { toast } = useToast();
  const [originZip, setOriginZip] = React.useState(settings.originZip);
  const [tiers, setTiers] = React.useState<ShippingTier[]>(() => 
    // Ensure there are always 3 tiers, filling with empty ones if needed
    Array.from({ length: 3 }, (_, i) => settings.tiers[i] || { minDistance: 0, maxDistance: 0, cost: 0 })
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleTierChange = (index: number, field: keyof ShippingTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: Number(value) || 0 };
    setTiers(newTiers);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onSave({ originZip, tiers });

    toast({
      title: "Configurações Salvas!",
      description: "Sua tabela de frete foi atualizada com sucesso.",
    });

    setIsSubmitting(false);
  };

  return (
    <Card className="shadow-lg max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Ship className="h-6 w-6" />
          Configurações de Frete
        </CardTitle>
        <CardDescription>
          Defina o CEP de origem e as faixas de preço por distância para o cálculo
          automático do frete nos pedidos de venda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <Label htmlFor="origin-zip" className="text-base font-semibold">
            CEP de Origem
          </Label>
          <Input
            id="origin-zip"
            placeholder="Digite o CEP da sua empresa"
            value={originZip}
            onChange={(e) => setOriginZip(e.target.value)}
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground">
            Este CEP será usado como ponto de partida para calcular a distância
            até o cliente.
          </p>
        </div>
        
        <Separator />

        <div className="space-y-6">
          <h3 className="text-base font-semibold">Tabela de Frete por Distância</h3>
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-4 border rounded-lg bg-muted/20"
            >
              <div className="md:col-span-1 flex items-center">
                <Label className="font-bold text-primary">Faixa {index + 1}</Label>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`min-dist-${index}`}>Dist. Mínima (KM)</Label>
                <Input
                  id={`min-dist-${index}`}
                  type="number"
                  placeholder="0"
                  value={tier.minDistance}
                  onChange={(e) => handleTierChange(index, "minDistance", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`max-dist-${index}`}>Dist. Máxima (KM)</Label>
                <Input
                  id={`max-dist-${index}`}
                  type="number"
                  placeholder="50"
                  value={tier.maxDistance}
                  onChange={(e) => handleTierChange(index, "maxDistance", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`cost-${index}`}>Valor do Frete (R$)</Label>
                <Input
                  id={`cost-${index}`}
                  type="number"
                  step="0.01"
                  placeholder="15,00"
                  value={tier.cost}
                  onChange={(e) => handleTierChange(index, "cost", e.target.value)}
                />
              </div>
            </div>
          ))}
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
              Salvar Configurações de Frete
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
