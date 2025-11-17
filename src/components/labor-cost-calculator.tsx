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
import { Calculator } from "lucide-react";
import { Separator } from "./ui/separator";

interface LaborCostCalculatorProps {
  onApplyCost: (cost: number) => void;
}

export default function LaborCostCalculator({ onApplyCost }: LaborCostCalculatorProps) {
  const [salary, setSalary] = React.useState(6000);
  const [fixedCosts, setFixedCosts] = React.useState(1200);
  const [hoursPerDay, setHoursPerDay] = React.useState(8);
  const [daysPerWeek, setDaysPerWeek] = React.useState(5);
  const [productionMinutes, setProductionMinutes] = React.useState(0);

  const { costPerMinute, totalLaborCost } = React.useMemo(() => {
    const totalMonthlyCost = salary + fixedCosts;
    const weeklyHours = hoursPerDay * daysPerWeek;
    const monthlyHours = weeklyHours * 4.33; // Average weeks in a month
    const monthlyMinutes = monthlyHours * 60;
    
    const costPerMinute = monthlyMinutes > 0 ? totalMonthlyCost / monthlyMinutes : 0;
    const totalLaborCost = costPerMinute * productionMinutes;

    return { costPerMinute, totalLaborCost };
  }, [salary, fixedCosts, hoursPerDay, daysPerWeek, productionMinutes]);

  const handleApplyCost = () => {
    onApplyCost(totalLaborCost);
  };

  return (
    <Card className="w-full shadow-none border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Calculadora de Custo de Mão de Obra
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para descobrir o custo do seu minuto de trabalho e aplicá-lo ao produto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <h3 className="font-semibold text-muted-foreground">Custos Mensais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="salary">Salário/Pró-labore Desejado (R$)</Label>
                    <Input id="salary" type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
                </div>
                <div>
                    <Label htmlFor="fixed-costs">Outros Custos Fixos (Aluguel, Luz) (R$)</Label>
                    <Input id="fixed-costs" type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} />
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold text-muted-foreground">Jornada de Trabalho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="hours-day">Horas trabalhadas por Dia</Label>
                    <Input id="hours-day" type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))} />
                </div>
                <div>
                    <Label htmlFor="days-week">Dias trabalhados por Semana</Label>
                    <Input id="days-week" type="number" value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} />
                </div>
            </div>
        </div>
        
        <Card className="bg-muted/50">
            <CardHeader>
                <CardDescription>Custo Total por Minuto</CardDescription>
                <CardTitle className="text-2xl">{costPerMinute.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardTitle>
            </CardHeader>
        </Card>

        <Separator />

        <div className="space-y-4">
            <h3 className="font-semibold">Custo para este Produto</h3>
            <div>
                <Label htmlFor="production-minutes">Minutos para produzir este item</Label>
                <Input id="production-minutes" type="number" value={productionMinutes} onChange={(e) => setProductionMinutes(Number(e.target.value))} />
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardDescription>Custo de Mão de Obra para o Produto</CardDescription>
                <CardTitle className="text-2xl text-primary">{totalLaborCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardTitle>
            </CardHeader>
        </Card>

      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleApplyCost}>
          Aplicar Custo e Fechar
        </Button>
      </CardFooter>
    </Card>
  );
}
