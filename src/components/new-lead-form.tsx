
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, MapPin } from "lucide-react";

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
import { newLeadSchema, type Lead, type Customer, ShippingSettings } from "@/lib/schemas";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useToast } from "@/hooks/use-toast";

type NewLeadFormValues = z.infer<typeof newLeadSchema>;

interface NewLeadFormProps {
  onSuccess: (data: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => void;
  leads: Lead[];
  customers: (Customer & { id: string })[];
  shippingSettings: ShippingSettings;
}

export default function NewLeadForm({ onSuccess, leads, customers, shippingSettings }: NewLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<NewLeadFormValues>({
    resolver: zodResolver(newLeadSchema),
    defaultValues: {
      type: "pj",
      name: "",
      contact: "",
      phone: "",
      email: "",
      zip: "",
      distance: 0,
    },
  });
  
  const leadType = form.watch("type");
  const watchedZip = form.watch("zip");

  const openMaps = () => {
    const originZip = shippingSettings?.originZip;
    const destinationZip = form.getValues("zip");

    if (!originZip || !destinationZip) {
      toast({
        variant: "destructive",
        title: "CEP(s) faltando",
        description: "Certifique-se de que o CEP de origem (em Configurações de Frete) e o CEP do lead estão preenchidos.",
      });
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originZip}&destination=${destinationZip}`;
    window.open(url, "_blank");
  };

  async function onSubmit(data: NewLeadFormValues) {
    setIsSubmitting(true);

    const isDuplicate = () => {
        const normalizedContact = data.contact.trim().toLowerCase();
        if (data.type === 'pj') {
            const normalizedName = (data.name || "").trim().toLowerCase();
            return (customers || []).some(c => (c.companyName || '').toLowerCase() === normalizedName) ||
                   (leads || []).some(l => l.name.toLowerCase() === normalizedName);
        } else { // pf
            return (customers || []).some(c => c.name.toLowerCase() === normalizedContact) ||
                   (leads || []).some(l => l.contact.toLowerCase() === normalizedContact && l.name.toLowerCase() === normalizedContact);
        }
    };

    if (isDuplicate()) {
        toast({
            variant: "destructive",
            title: "Lead duplicado",
            description: "Já existe um lead ou cliente com esses dados.",
        });
        setIsSubmitting(false);
        return;
    }
    
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contato@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
         <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>CEP <span className="text-xs text-muted-foreground">(Opcional)</span></FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 01001-000" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distância (KM) <span className="text-xs text-muted-foreground">(Opcional)</span></FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={openMaps}
                  disabled={!watchedZip || !shippingSettings?.originZip}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="sr-only">Calcular no Maps</span>
                </Button>
              </div>
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
