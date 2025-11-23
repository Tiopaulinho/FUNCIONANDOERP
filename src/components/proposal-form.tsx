
"use client";

import * as React from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2, FileText, Percent, Truck, MapPin } from "lucide-react";
import type { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "./ui/separator";
import type { Product, Lead, Proposal, Customer, ShippingSettings, ShippingTier } from "@/lib/schemas";
import { proposalSchema } from "@/lib/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ShippingOption {
    value: string;
    label: string;
    cost: number;
}

interface ProposalFormProps {
  lead: Lead;
  onSuccess: (proposal: Proposal) => void;
  products: (Product & { id: string })[];
  onProductAdd: (newProduct: Product & { id: string }) => void;
  initialData?: Proposal | null;
  customers: (Customer & { id: string })[];
  shippingSettings: ShippingSettings;
  onUpdateLead: (lead: Lead) => void;
}


export default function ProposalForm({ 
  lead, 
  onSuccess, 
  products, 
  onProductAdd, 
  initialData, 
  customers, 
  shippingSettings,
  onUpdateLead
}: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([]);
  const [currentLead, setCurrentLead] = React.useState<Lead>(lead);
  const isEditMode = !!initialData;

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: initialData || {
      leadId: lead.id,
      items: [{ productId: "", productName: "", quantity: 1, price: 0 }],
      discount: 0,
      shipping: 0,
      shippingMethod: "A Combinar",
      observations: lead.proposalNotes || "",
      paymentMethods: "",
      date: new Date().toISOString().split('T')[0],
      status: "Draft",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch('items');
  const watchedDiscount = form.watch('discount');
  const watchedShipping = form.watch('shipping');

  const total = React.useMemo(() => {
    const sub = (watchedItems || []).reduce((acc, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return acc + (quantity * price);
    }, 0);
    const discountValue = Number(watchedDiscount) || 0;
    const shippingValue = Number(watchedShipping) || 0;
    const discountAmount = sub * (discountValue / 100);
    return sub - discountAmount + shippingValue;
  }, [watchedItems, watchedDiscount, watchedShipping]);

  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      update(index, {
        ...(watchedItems?.[index] || {}),
        productId: product.id,
        productName: product.name,
        price: product.price,
      });
    }
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const distance = parseFloat(e.target.value);
    setCurrentLead(prev => ({ ...prev, distance: isNaN(distance) ? undefined : distance }));
  };
  
  const handleDistanceBlur = () => {
    onUpdateLead(currentLead);
  };
  
  const openMaps = () => {
    if (shippingSettings?.originZip && currentLead.zip) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${shippingSettings.originZip}&destination=${currentLead.zip}`;
        window.open(url, "_blank");
    }
  };

  const setupShippingOptions = React.useCallback((leadForShipping: Lead) => {
    const baseOptions: ShippingOption[] = [
        { value: 'Retirada', label: 'Retirada no local', cost: 0 },
        { value: 'A Combinar', label: 'A Combinar (valor a definir)', cost: 0 },
    ];
    
    let calculatedOption: ShippingOption | null = null;
    
    if (leadForShipping.distance && shippingSettings?.tiers?.length) {
        const tier = shippingSettings.tiers.find(t => 
          leadForShipping.distance! >= t.minDistance && leadForShipping.distance! <= t.maxDistance
        );
        
        if (tier) {
            calculatedOption = {
                value: `Calculado-${tier.cost}`,
                label: `Frete Calculado: ${tier.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                cost: tier.cost
            };
        }
    }
    
    const newOptions = calculatedOption ? [calculatedOption, ...baseOptions] : baseOptions;
    setShippingOptions(newOptions);
    
    const chosenMethod = form.getValues("shippingMethod");

    if (calculatedOption && chosenMethod !== calculatedOption.value) {
        form.setValue('shippingMethod', calculatedOption.value);
        form.setValue('shipping', calculatedOption.cost, { shouldValidate: true });
    } else if (!calculatedOption && chosenMethod !== 'A Combinar') {
        form.setValue('shippingMethod', 'A Combinar');
        form.setValue('shipping', 0, { shouldValidate: true });
    }

  }, [shippingSettings, form]);


  React.useEffect(() => {
    if (initialData) {
        form.reset(initialData);
    }
    setCurrentLead(lead);
    setupShippingOptions(lead);
  }, [initialData, lead, form, setupShippingOptions]);

  React.useEffect(() => {
    setupShippingOptions(currentLead);
  }, [currentLead, setupShippingOptions]);

  const handleShippingMethodChange = (value: string) => {
      const selectedOption = shippingOptions.find(opt => opt.value === value);
      if (selectedOption) {
          form.setValue('shipping', selectedOption.cost, { shouldValidate: true });
          form.setValue('shippingMethod', selectedOption.value);
      }
  };

  async function onSubmit(data: ProposalFormValues) {
    setIsSubmitting(true);
    onUpdateLead(currentLead);

    const finalTotal = total;

    const finalProposal: Proposal = {
      ...initialData,
      ...data,
      id: initialData?.id || `prop-${lead.id}`,
      date: new Date().toISOString().split('T')[0],
      items: data.items.map(item => ({ ...item, id: item.id || `pitem-${Date.now()}-${Math.random()}` })),
      total: finalTotal,
      status: initialData?.status || "Draft",
    };
    
    console.log("Nova proposta:", finalProposal);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSuccess(finalProposal);
    setIsSubmitting(false);
  }

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <FormLabel>Empresa</FormLabel>
                <Input readOnly value={lead.name} className="bg-muted/50" />
            </div>
            <div className="space-y-1">
                <FormLabel>Contato</FormLabel>
                <Input readOnly value={lead.contact} className="bg-muted/50" />
            </div>
          </div>


          <div className="space-y-2">
            <h3 className="text-md font-semibold">Itens da Proposta</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Produto</TableHead>
                  <TableHead className="w-1/5">Qtd.</TableHead>
                  <TableHead className="w-1/5">Preço Unit.</TableHead>
                  <TableHead className="w-1/5 text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} className="align-top">
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={(value) => { field.onChange(value); handleProductSelect(value, index); }} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="mt-1 text-xs" />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => ( <FormItem><FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? 1} onChange={e => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value, 10))} /></FormControl></FormItem> )} />
                    </TableCell>
                    <TableCell>
                      <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? 0} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} /></FormControl></FormItem> )} />
                    </TableCell>
                    <TableCell className="text-right">{( (Number(watchedItems?.[index]?.quantity) || 0) * (Number(watchedItems?.[index]?.price) || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell>
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", productName: "", quantity: 1, price: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>
            {form.formState.errors.items?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.root.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="observations" render={({ field }) => (
                <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl><Textarea placeholder="Detalhes importantes, termos, etc." {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
             <FormField control={form.control} name="paymentMethods" render={({ field }) => (
                <FormItem>
                    <FormLabel>Formas de Pagamento</FormLabel>
                    <FormControl><Textarea placeholder="Ex: 50% de entrada, 50% na entrega." {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <FormLabel>Distância (KM)</FormLabel>
                <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        placeholder="0" 
                        value={currentLead.distance || ""}
                        onChange={handleDistanceChange}
                        onBlur={handleDistanceBlur}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={openMaps}
                      disabled={!currentLead.zip || !shippingSettings?.originZip}
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="sr-only">Calcular no Maps</span>
                    </Button>
                </div>
              </div>
              <FormField
                control={form.control}
                name="shippingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Truck className="h-4 w-4" /> Frete</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); handleShippingMethodChange(value); }} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o frete" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shippingOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Percent className="h-4 w-4" /> Desconto (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}/></FormControl>
                  </FormItem>
                )}
              />
          </div>


          <Separator />

          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div></div>
             <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Total da Proposta</p>
                    <p className="text-3xl font-bold">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>
                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</> : <><FileText className="mr-2 h-5 w-5" /> {isEditMode ? "Atualizar Proposta" : "Criar Proposta"}</>}
                </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
