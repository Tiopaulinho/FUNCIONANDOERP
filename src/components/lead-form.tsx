
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Building, MapPin } from "lucide-react";

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
import { leadSchema, type Lead, type ShippingSettings } from "@/lib/schemas";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  initialData?: Lead | null;
  onSuccess: (lead: Lead) => void;
  shippingSettings: ShippingSettings;
}

export default function LeadForm({ initialData, onSuccess, shippingSettings }: LeadFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = React.useState(false);
  const isEditMode = !!initialData;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: initialData?.name || "",
      contact: initialData?.contact || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      value: initialData?.value ?? 0,
      proposalNotes: initialData?.proposalNotes || "",
      zip: initialData?.zip || "",
      street: initialData?.street || "",
      number: initialData?.number || "",
      complement: initialData?.complement || "",
      neighborhood: initialData?.neighborhood || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      distance: initialData?.distance ?? 0,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        phone: initialData.phone || "",
        email: initialData.email || "",
        proposalNotes: initialData.proposalNotes || "",
        value: initialData.value ?? 0,
        zip: initialData.zip || "",
        street: initialData.street || "",
        number: initialData.number || "",
        complement: initialData.complement || "",
        neighborhood: initialData.neighborhood || "",
        city: initialData.city || "",
        state: initialData.state || "",
        distance: initialData.distance ?? 0,
      });
    }
  }, [initialData, form]);

  const watchedZip = form.watch("zip");

  const handleZipBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const zipCode = e.target.value.replace(/\D/g, '');
    if (zipCode.length !== 8) {
      return;
    }

    setIsFetchingAddress(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast({
            variant: "destructive",
            title: "CEP não encontrado",
            description: "Por favor, verifique o CEP e tente novamente.",
        });
        form.setValue("street", "");
        form.setValue("neighborhood", "");
        form.setValue("city", "");
        form.setValue("state", "");
      } else {
        form.setValue("street", data.logradouro);
        form.setValue("neighborhood", data.bairro);
        form.setValue("city", data.localidade);
        form.setValue("state", data.uf);
        toast({
            title: "Endereço encontrado!",
            description: "Os campos de endereço foram preenchidos.",
        });
      }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao buscar CEP",
            description: "Não foi possível buscar o endereço. Tente novamente.",
        });
    } finally {
      setIsFetchingAddress(false);
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: (11) 99999-9999" {...field} value={field.value || ''} />
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
                        <Input type="email" placeholder="contato@empresa.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                        value={field.value ?? 0}
                        onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
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
                      <Textarea placeholder="Detalhes para a criação da proposta..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              <Separator />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Ex: 01001-000" 
                            {...field} 
                            value={field.value || ''}
                            onBlur={(e) => {
                                field.onBlur();
                                handleZipBlur(e);
                            }}
                          />
                        </FormControl>
                        {isFetchingAddress && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Av. Paulista" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField control={form.control} name="number" render={({ field }) => ( <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="Ex: 1000" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="complement" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Complemento</FormLabel><FormControl><Input placeholder="Ex: Apto 101" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField control={form.control} name="neighborhood" render={({ field }) => ( <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Ex: Bela Vista" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="Ex: São Paulo" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel>Estado</FormLabel><FormControl><Input placeholder="Ex: SP" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                 </div>
                 <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distância (KM)</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
