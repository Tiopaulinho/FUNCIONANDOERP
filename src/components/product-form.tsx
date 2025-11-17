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
import { productSchema } from "@/lib/schemas";

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
    },
  });

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    console.log("Novo produto:", data);
    // Simulate API call to save the product
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In a real app, this would be an API call
    // const result = await saveProductAction(data);
    
    toast({
      title: "Sucesso!",
      description: "Produto cadastrado com sucesso!",
    });
    
    setIsSubmitting(false);
    
    if (onSuccess) {
      onSuccess();
    }
    form.reset();
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <PackagePlus className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-2 text-muted-foreground">
          Preencha os dados para adicionar um novo produto.
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
                      <Input type="number" step="0.01" placeholder="Ex: 59,90" {...field} />
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
                "Salvar Produto"
              )}
            </Button>
          </form>
        </Form>
    </div>
  );
}
