
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, UserPlus, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { customerRegistrationSchema, type Customer, type ShippingSettings, type ShippingTier } from "@/lib/schemas";
import { registerCustomerAction } from "@/app/actions";
import { Separator } from "./ui/separator";

type CustomerFormValues = z.infer<typeof customerRegistrationSchema>;

interface CustomerRegistrationFormProps {
  initialData?: Partial<Customer> | null;
  onSuccess?: (data: Omit<Customer, 'id'>) => void;
  shippingSettings: ShippingSettings;
}

export default function CustomerRegistrationForm({
  initialData,
  onSuccess,
  shippingSettings
}: CustomerRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = React.useState(false);
  const [shippingTier, setShippingTier] = React.useState<ShippingTier | null>(null);
  const isEditMode = !!(initialData && 'id' in initialData && initialData.id);
  const cameFromLead = !!(initialData && (!('id' in initialData) || !initialData.id));

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerRegistrationSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      zip: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      distance: 0,
    },
  });
  
  const { reset } = form;

  React.useEffect(() => {
    if (initialData) {
        reset({
            name: initialData.name || "",
            companyName: initialData.companyName || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            zip: initialData.zip || "",
            street: initialData.street || "",
            number: initialData.number || "",
            complement: initialData.complement || "",
            neighborhood: initialData.neighborhood || "",
            city: initialData.city || "",
            state: initialData.state || "",
            distance: initialData.distance || 0,
        });
    }
  }, [initialData, reset]);

  const watchedDistance = form.watch("distance");

  React.useEffect(() => {
    if (typeof watchedDistance === 'number' && shippingSettings?.tiers?.length) {
      const tier = shippingSettings.tiers.find(t => 
        watchedDistance >= t.minDistance && watchedDistance <= t.maxDistance
      );
      setShippingTier(tier || null);
    } else {
        setShippingTier(null);
    }
  }, [watchedDistance, shippingSettings]);


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


  async function onSubmit(data: CustomerFormValues) {
    setIsSubmitting(true);
    // This is a simplified action handler. 
    // In a real app, you might call a server action here.
    try {
        if (onSuccess) {
          onSuccess(data);
        } else {
          // Fallback to server action if no onSuccess prop is provided
          const result = await registerCustomerAction(data);
           if (result.success) {
            toast({
              title: "Sucesso!",
              description: isEditMode
                ? "Cliente atualizado com sucesso!"
                : result.message,
            });
            if (!isEditMode) {
              form.reset();
            }
          } else {
             toast({
              variant: "destructive",
              title: isEditMode ? "Erro na atualização" : "Erro no cadastro",
              description: result.message || "Ocorreu um erro. Tente novamente.",
            });
          }
        }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro no servidor. Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full shadow-none border-0">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">
          {isEditMode ? "Editar Cliente" : "Cadastro de Cliente"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Altere os dados abaixo para atualizar o cliente."
            : cameFromLead 
            ? "Complete os dados de endereço do cliente para finalizar o cadastro."
            : "Preencha os campos abaixo para adicionar um novo cliente."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">
                Informações Pessoais e de Contato
              </h3>
              <Separator />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa <span className="text-xs text-muted-foreground">(Opcional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Ex: joao.silva@email.com"
                          {...field}
                        />
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
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Endereço</h3>
              <Separator />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>CEP</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Ex: 01001-000" 
                            {...field} 
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Av. Paulista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        Complemento{" "}
                        <span className="text-xs text-muted-foreground">
                          (Opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Apto 101, Bloco B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-end">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Bela Vista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6">
                 <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distância (KM)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="md:col-span-2 flex items-center h-10 text-sm text-muted-foreground">
                  {shippingTier ? (
                     <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
                        <Truck className="h-4 w-4 text-primary" />
                        <span>Faixa de frete: {shippingTier.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                  ) : watchedDistance > 0 ? (
                    <span className="text-destructive">Nenhuma faixa de frete encontrada para esta distância.</span>
                  ) : null}
                </div>
               </div>
            </div>
            <CardFooter className="p-0 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isEditMode ? "Salvando..." : "Cadastrando..."}
                  </>
                ) : isEditMode ? (
                  "Salvar Alterações"
                ) : (
                  "Cadastrar Cliente"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
