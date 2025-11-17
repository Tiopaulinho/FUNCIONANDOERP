"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, PackagePlus, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { productSchema, type Product } from "@/lib/schemas";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import LaborCostCalculator from "./labor-cost-calculator";

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: (Product & { id: string }) | null;
  onSuccess?: (product: Product & { id: string }) => void;
}

export default function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = React.useState(false);
  const isEditMode = !!initialData;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      price: 0,
      rawMaterialCost: 0,
      laborCost: 0,
      suppliesCost: 0,
      fees: 0,
      taxes: 0,
      profitMargin: 0,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        price: initialData.price ?? 0,
        rawMaterialCost: initialData.rawMaterialCost ?? 0,
        laborCost: initialData.laborCost ?? 0,
        suppliesCost: initialData.suppliesCost ?? 0,
        fees: initialData.fees ?? 0,
        taxes: initialData.taxes ?? 0,
        profitMargin: initialData.profitMargin ?? 0,
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        rawMaterialCost: 0,
        laborCost: 0,
        suppliesCost: 0,
        fees: 0,
        taxes: 0,
        profitMargin: 0,
      });
    }
  }, [initialData, form]);

  const watchedFields = form.watch();

  const { baseCost, totalCost, suggestedPrice, actualProfit } = React.useMemo(() => {
    const rawMaterialCost = Number(watchedFields.rawMaterialCost) || 0;
    const laborCost = Number(watchedFields.laborCost) || 0;
    const suppliesCost = Number(watchedFields.suppliesCost) || 0;
    const feesPercent = Number(watchedFields.fees) || 0;
    const taxesPercent = Number(watchedFields.taxes) || 0;
    const profitMargin = Number(watchedFields.profitMargin) || 0;
    const chargedPrice = Number(watchedFields.price) || 0;

    const baseCost = rawMaterialCost + laborCost + suppliesCost;
    const feesValue = baseCost * (feesPercent / 100);
    const taxesValue = baseCost * (taxesPercent / 100);
    const totalCost = baseCost + feesValue + taxesValue;
    
    const profitValue = totalCost * (profitMargin / 100);
    const suggestedPrice = totalCost + profitValue;
    const actualProfit = chargedPrice - totalCost;

    return { baseCost, totalCost, suggestedPrice, actualProfit };
  }, [watchedFields]);
  

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newOrUpdatedProduct = {
      ...data,
      id: initialData?.id || `prod-${Date.now()}`,
    };

    console.log(isEditMode ? "Produto atualizado:" : "Novo produto:", newOrUpdatedProduct);

    toast({
      title: "Sucesso!",
      description: isEditMode ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!",
    });
    
    if (onSuccess) {
      onSuccess(newOrUpdatedProduct);
    }
    
    if (!isEditMode) {
      form.reset({ name: "", price: 0 });
    }
    
    setIsSubmitting(false);
  }

  const handleApplyLaborCost = (cost: number) => {
    form.setValue("laborCost", parseFloat(cost.toFixed(2)), { shouldDirty: true, shouldValidate: true });
    setIsCalculatorOpen(false);
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <PackagePlus className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-2 text-muted-foreground">
          {isEditMode ? "Altere os dados para atualizar o produto." : "Preencha os dados para adicionar um novo produto."}
        </p>
      </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camiseta Branca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Composição de Custos</h3>
               <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="rawMaterialCost" render={({ field }) => (
                    <FormItem><FormLabel>Custo da Matéria Prima (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="laborCost" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Custo de Mão de Obra (R$)</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" type="button">
                                        <Calculator className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl">
                                    <LaborCostCalculator onApplyCost={handleApplyLaborCost} />
                                </DialogContent>
                            </Dialog>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="suppliesCost" render={({ field }) => (
                    <FormItem><FormLabel>Custo de Insumos (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="fees" render={({ field }) => (
                    <FormItem><FormLabel>Taxas (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="taxes" render={({ field }) => (
                    <FormItem><FormLabel>Impostos (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card className="bg-muted/50">
                    <CardHeader className="p-4">
                        <CardDescription>Custo Base (Sem Taxas)</CardDescription>
                        <CardTitle className="text-2xl">{baseCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardTitle>
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader className="p-4">
                        <CardDescription>Custo Total (Com Taxas)</CardDescription>
                        <CardTitle className="text-2xl">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardTitle>
                    </CardHeader>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-lg font-semibold">Preço e Lucro</h3>
               <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FormField control={form.control} name="profitMargin" render={({ field }) => (
                        <FormItem><FormLabel>Margem de Lucro (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <Card className="bg-muted/50">
                        <CardHeader className="p-4">
                            <CardDescription>Preço Sugerido</CardDescription>
                            <CardTitle className="text-2xl">{suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor Cobrado (Preço de Venda)</FormLabel>
                            <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="Ex: 59,90" 
                                {...field}
                                value={field.value ?? ""}
                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} 
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Card>
                        <CardHeader className="p-4">
                            <CardDescription>Lucro Real</CardDescription>
                            <CardTitle className={`text-2xl ${actualProfit < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {actualProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                 </div>
            </div>


            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                isEditMode ? "Salvar Alterações" : "Salvar Produto"
              )}
            </Button>
          </form>
        </Form>
    </div>
  );
}
