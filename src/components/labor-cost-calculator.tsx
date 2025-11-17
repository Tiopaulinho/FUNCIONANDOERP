
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

interface LaborCostCalculatorProps {
  onApplyCost: (costPerMinute: number) => void;
}

export default function LaborCostCalculator({ onApplyCost }: LaborCostCalculatorProps) {
  const [salary, setSalary] = React.useState(6000);
  const [fixedCosts, setFixedCosts] = React.useState(1200);
  const [hoursPerDay, setHoursPerDay] = React.useState(8);
  const [daysPerWeek, setDaysPerWeek] = React.useState(5);

  const costPerMinute = React.useMemo(() => {
    const totalMonthlyCost = salary + fixedCosts;
    const weeklyHours = hoursPerDay * daysPerWeek;
    const monthlyHours = weeklyHours * 4.33; // Average weeks in a month
    const monthlyMinutes = monthlyHours * 60;
    
    return monthlyMinutes > 0 ? totalMonthlyCost / monthlyMinutes : 0;
  }, [salary, fixedCosts, hoursPerDay, daysPerWeek]);

  const handleApplyCost = () => {
    onApplyCost(costPerMinute);
  };

  return (
    <Card className="w-full shadow-none border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Calculadora de Custo de Mão de Obra
        </CardTitle>
        <CardDescription>
          Preencha os campos para descobrir o custo do seu minuto de trabalho.
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
                <CardTitle className="text-2xl text-primary">{costPerMinute.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardTitle>
            </CardHeader>
        </Card>

      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleApplyCost}>
          Aplicar Custo por Minuto e Fechar
        </Button>
      </CardFooter>
    </Card>
  );
}

    