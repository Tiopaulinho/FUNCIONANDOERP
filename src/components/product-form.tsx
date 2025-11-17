
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, PackagePlus } from "lucide-react";

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

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: (Product & { id: string }) | null;
  onSuccess?: (product: Product & { id: string }) => void;
}

export default function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!initialData;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      price: 0,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({ ...initialData, price: initialData.price ?? 0 });
    } else {
      form.reset({ name: "", price: 0 });
    }
  }, [initialData, form]);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
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
