
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Building } from "lucide-react";

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
import { leadSchema, type Lead } from "@/lib/schemas";
import { Textarea } from "./ui/textarea";

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  initialData?: Lead | null;
  onSuccess: (lead: Lead) => void;
}

export default function LeadForm({ initialData, onSuccess }: LeadFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!initialData;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: isEditMode ? {
      name: initialData.name,
      contact: initialData.contact,
      phone: initialData.phone || "",
      value: initialData.value,
      proposalNotes: initialData.proposalNotes || "",
    } : {
      name: "",
      contact: "",
      phone: "",
      value: 0,
      proposalNotes: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        phone: initialData.phone || "",
        proposalNotes: initialData.proposalNotes || "",
        value: initialData.value ?? 0,
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: LeadFormValues) {
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (!initialData) {
        // This should not happen in the current flow, but as a safeguard
        setIsSubmitting(false);
        return;
    }

    const updatedLead: Lead = {
      ...initialData,
      ...data,
    };

    console.log("Lead atualizado:", updatedLead);
    
    onSuccess(updatedLead);
    setIsSubmitting(false);
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-2 text-muted-foreground">
          Altere os dados para atualizar o lead.
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
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: (11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Ex: 15000,00" 
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="proposalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações da Proposta</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes para a criação da proposta..." {...field} />
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
                "Salvar Alterações"
              )}
            </Button>
          </form>
        </Form>
    </div>
  );
}
