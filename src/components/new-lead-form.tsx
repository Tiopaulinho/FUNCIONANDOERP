
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";

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
import { newLeadSchema, type Lead } from "@/lib/schemas";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type NewLeadFormValues = z.infer<typeof newLeadSchema>;

interface NewLeadFormProps {
  onSuccess: (data: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => void;
}

export default function NewLeadForm({ onSuccess }: NewLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<NewLeadFormValues>({
    resolver: zodResolver(newLeadSchema),
    defaultValues: {
      type: "pj",
      name: "",
      contact: "",
      phone: "",
      email: "",
    },
  });
  
  const leadType = form.watch("type");

  async function onSubmit(data: NewLeadFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const finalData = {
        ...data,
        name: data.type === 'pf' ? data.contact : data.name!,
    }

    onSuccess(finalData);
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Lead</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pj" />
                    </FormControl>
                    <FormLabel className="font-normal">Pessoa Jurídica</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pf" />
                    </FormControl>
                    <FormLabel className="font-normal">Pessoa Física</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {leadType === "pj" && (
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
        )}
        
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{leadType === 'pj' ? 'Nome do Contato' : 'Nome Completo'}</FormLabel>
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
              <FormLabel>Telefone <span className="text-xs text-muted-foreground">(Opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email <span className="text-xs text-muted-foreground">(Opcional)</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Lead"
          )}
        </Button>
      </form>
    </Form>
  );
}

    