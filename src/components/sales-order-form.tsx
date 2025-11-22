
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, PlusCircle, Trash2, UserPlus, FileDown } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import type { Customer, Product, SalesOrder, Lead, Proposal, ProposalItem, ShippingSettings, ShippingTier } from "@/lib/schemas";
import { salesOrderSchema } from "@/lib/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import ProductForm from "./product-form";
import { CardDescription } from "./ui/card";
import CustomerRegistrationForm from "./customer-registration-form";

type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

interface ShippingOption {
    value: string;
    label: string;
    cost: number;
}


interface SalesOrderFormProps {
  initialData?: SalesOrder | null;
  onSuccess: (order: SalesOrder) => void;
  products: (Product & { id: string })[];
  onProductAdd: (newProduct: Product & { id: string }) => void;
  leadData?: Lead | null;
  proposalData?: Proposal | null;
  customers: (Customer & { id: string })[];
  onCustomerAdd: (customerData: Omit<Customer, 'id'>) => Customer & { id: string };
  shippingSettings: ShippingSettings;
}

export default function SalesOrderForm({ 
  initialData, 
  onSuccess, 
  products, 
  onProductAdd, 
  leadData,
  proposalData,
  customers,
  onCustomerAdd,
  shippingSettings,
}: SalesOrderFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = React.useState(false);
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([]);
  const isEditMode = !!initialData;
  const cameFromLead = !!leadData;
  
  const customerForLead = React.useMemo(() => {
    if (!leadData) return null;
    if (leadData.customerId) {
      return customers.find(c => c.id === leadData.customerId);
    }
    return null;
  }, [leadData, customers]);

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customerId: "",
      leadId: "",
      shipping: 0,
      shippingMethod: 'Retirada',
      items: [{ productId: "", productName: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const loadProposalData = React.useCallback(() => {
    if (proposalData?.items && proposalData.items.length > 0) {
      const proposalItems = proposalData.items.map((item: ProposalItem) => ({
        id: item.id || `item-${Date.now()}-${Math.random()}`,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));
      form.setValue('items', proposalItems);
      
      if(proposalData.shippingMethod) {
          form.setValue('shippingMethod', proposalData.shippingMethod);
          form.setValue('shipping', proposalData.shipping || 0);
      }

      toast({
        title: "Dados carregados!",
        description: "Os itens e o frete da proposta foram carregados no pedido.",
      });
    } else {
        toast({
            variant: "destructive",
            title: "Nenhum item encontrado",
            description: "A proposta não contém itens para carregar.",
        });
    }
  }, [proposalData, form, toast]);


  React.useEffect(() => {
    const resetForm = () => {
      let defaultItems = [{ productId: "", productName: "", quantity: 1, price: 0 }];
      
      if (isEditMode && initialData) {
        form.reset({
          ...initialData,
          items: initialData.items.map(item => ({
            ...item,
            quantity: item.quantity || 1,
            price: item.price || 0,
          }))
        });
      } else if (cameFromLead) {
        form.reset({
          customerId: customerForLead?.id || "",
          leadId: leadData?.id || "",
          shipping: proposalData?.shipping || 0,
          shippingMethod: proposalData?.shippingMethod || 'Retirada',
          items: proposalData?.items?.map(item => ({
            ...item,
            quantity: item.quantity || 1,
            price: item.price || 0,
          })) || defaultItems,
        });
      } else {
        form.reset({
          customerId: "",
          leadId: "",
          shipping: 0,
          shippingMethod: 'Retirada',
          items: defaultItems,
        });
      }
    };
  
    resetForm();
  }, [initialData, leadData, proposalData, isEditMode, cameFromLead, customerForLead, form]);

  React.useEffect(() => {
    if (proposalData) {
      loadProposalData();
    }
  }, [proposalData, loadProposalData]);


  const watchedItems = form.watch("items");
  const watchedShipping = form.watch("shipping") || 0;
  const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const total = subtotal + watchedShipping;


  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      update(index, {
        ...watchedItems[index],
        productId: product.id,
        productName: product.name,
        price: product.price,
      });
    }
  };

  const handleNewProductSuccess = (newProduct?: Product & { id: string }) => {
    if (newProduct) {
        onProductAdd(newProduct);
        toast({
          title: "Produto Adicionado!",
          description: "O novo produto já está disponível para seleção.",
        });
    }
    setIsProductDialogOpen(false);
  }
  
  const handleCustomerFormSuccess = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer = onCustomerAdd(customerData);
    if (newCustomer) {
      form.setValue("customerId", newCustomer.id, { shouldValidate: true });
      setIsCustomerDialogOpen(false);
      toast({
        title: "Cliente Cadastrado!",
        description: `O cliente ${newCustomer.name} foi selecionado.`,
      });
    }
  }

  const selectedCustomerId = form.watch("customerId");

  React.useEffect(() => {
    const baseOptions: ShippingOption[] = [
        { value: 'Retirada', label: 'Retirada no local', cost: 0 },
        { value: 'A Combinar', label: 'A Combinar (valor a definir)', cost: 0 },
    ];
    
    const customer = customers.find(c => c.id === selectedCustomerId);

    // If coming from a proposal, its shipping method takes precedence
    if (proposalData?.shippingMethod) {
        const proposalCost = proposalData.shipping || 0;
        const proposalOption: ShippingOption = {
            value: proposalData.shippingMethod,
            label: `${proposalData.shippingMethod}: ${proposalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
            cost: proposalCost
        };
         const finalOptions = [proposalOption, ...baseOptions.filter(o => o.value !== proposalOption.value)];
         setShippingOptions(finalOptions);
         form.setValue("shippingMethod", proposalOption.value);
         form.setValue("shipping", proposalOption.cost, { shouldValidate: true });
         return;
    }


    if (customer && typeof customer.distance === 'number' && shippingSettings?.tiers?.length) {
      const tier = shippingSettings.tiers.find(t => 
        customer.distance! >= t.minDistance && customer.distance! <= t.maxDistance
      );
      
      if (tier) {
        const calculatedOption: ShippingOption = {
          value: `Calculado-${tier.cost}`,
          label: `Frete Calculado: ${tier.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
          cost: tier.cost
        };
        setShippingOptions([calculatedOption, ...baseOptions]);
        form.setValue("shippingMethod", calculatedOption.value);
        form.setValue("shipping", calculatedOption.cost, { shouldValidate: true });
      } else {
        setShippingOptions(baseOptions);
        form.setValue("shippingMethod", 'A Combinar');
        form.setValue("shipping", 0, { shouldValidate: true });
      }
    } else {
      setShippingOptions(baseOptions);
      form.setValue("shippingMethod", 'A Combinar');
      form.setValue("shipping", 0, { shouldValidate: true });
    }
  }, [selectedCustomerId, customers, shippingSettings, form, proposalData]);


  const handleShippingMethodChange = (value: string) => {
      const selectedOption = shippingOptions.find(opt => opt.value === value);
      if (selectedOption) {
          form.setValue('shipping', selectedOption.cost, { shouldValidate: true });
          form.setValue('shippingMethod', selectedOption.value);
      }
  };


  async function onSubmit(data: SalesOrderFormValues) {
    setIsSubmitting(true);

    const customer = customers.find(c => c.id === data.customerId);
    
    if(!customer) {
      toast({
        variant: "destructive",
        title: "Cliente não encontrado",
        description: "Por favor, cadastre o cliente antes de criar o pedido.",
      });
      setIsSubmitting(false);
      return;
    }


    const finalOrderData: SalesOrder = {
      ...initialData,
      ...data,
      id: initialData?.id || `ORD-${Date.now()}`,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'Pendente',
      customerName: customer?.companyName || customer?.name || 'Cliente Desconhecido',
      total: total,
      shipping: data.shipping || 0,
      items: data.items.map(item => ({...item, id: item.id || `item-${Date.now()}-${Math.random()}`})),
    };
    
    console.log(isEditMode ? "Pedido atualizado:" : "Novo pedido:", finalOrderData);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSuccess(finalOrderData);

    toast({
      title: "Sucesso!",
      description: isEditMode ? "Pedido atualizado com sucesso!" : "Pedido de venda criado com sucesso!",
    });
    
    setIsSubmitting(false);
  }

  
  const leadCustomerData = React.useMemo(() => {
    if (!cameFromLead || customerForLead) return null;
    // Pass all available lead data to pre-fill the customer form
    return {
        name: leadData?.contact || "",
        companyName: leadData?.name,
        email: leadData?.email || "",
        phone: leadData?.phone || "",
        zip: leadData?.zip || "",
        street: leadData?.street || "",
        number: leadData?.number || "",
        complement: leadData?.complement || "",
        neighborhood: leadData?.neighborhood || "",
        city: leadData?.city || "",
        state: leadData?.state || "",
        distance: leadData?.distance || 0,
    }
  }, [cameFromLead, customerForLead, leadData]);


  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <div className="flex items-center gap-2">
                       {cameFromLead ? (
                         <div className="flex-grow">
                          <Input
                            readOnly
                            value={customerForLead?.companyName || customerForLead?.name || leadData?.name || ''}
                            className="bg-muted/50"
                          />
                         </div>
                       ) : (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isEditMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.companyName || customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                       )}
                       <DialogTrigger asChild>
                          <Button variant="outline" size="icon" disabled={isEditMode || (cameFromLead && !!customerForLead)} type="button">
                            <UserPlus className="h-4 w-4" />
                            <span className="sr-only">Novo Cliente</span>
                          </Button>
                       </DialogTrigger>
                    </div>
                     { (cameFromLead && !customerForLead) && (
                        <CardDescription className="text-xs text-destructive mt-1 font-semibold">
                            Este lead ainda não é um cliente. Clique no botão '+' para completar o cadastro.
                        </CardDescription>
                      )}
                      {!cameFromLead && !isEditMode && (
                         <CardDescription className="text-xs text-muted-foreground mt-1">
                            Não encontrou o cliente? Clique no botão '+' para cadastrar.
                        </CardDescription>
                      )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Cadastro de Cliente</DialogTitle>
                </DialogHeader>
                <CustomerRegistrationForm 
                    onSuccess={handleCustomerFormSuccess}
                    initialData={leadCustomerData}
                    shippingSettings={shippingSettings}
                />
              </DialogContent>
            </Dialog>

               {proposalData && (
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" size="sm" onClick={loadProposalData}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Carregar Dados da Proposta
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Proposta ID: <span className="font-mono text-foreground">{proposalData.id}</span>
                  </div>
                </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens do Pedido</h3>
            <Separator />
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-2/5">Produto</TableHead>
                          <TableHead className="w-1/5">Quantidade</TableHead>
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
                          <div className="flex gap-2">
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    handleProductSelect(value, index);
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                             <DialogTrigger asChild>
                                <Button variant="outline" size="icon" type="button">
                                    <Plus className="h-4 w-4"/>
                                    <span className="sr-only">Adicionar Produto</span>
                                </Button>
                             </DialogTrigger>
                          </div>
                          <FormMessage className="mt-1 text-xs"/>
                          </FormItem>
                      )}
                      />
                  </TableCell>
                  <TableCell>
                      <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                          <FormItem>
                          <FormControl>
                              <Input type="number" placeholder="0" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs"/>
                          </FormItem>
                      )}
                      />
                  </TableCell>
                  <TableCell>
                      <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                          <FormItem>
                          <FormControl>
                              <Input type="number" step="0.01" placeholder="0,00" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs"/>
                          </FormItem>
                      )}
                      />
                  </TableCell>
                  <TableCell className="text-right">
                      {((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.price || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell>
                      <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                      >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover item</span>
                      </Button>
                  </TableCell>
              </TableRow>
            ))}
            </TableBody>
            </Table>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                <DialogTitle>Novo Produto</DialogTitle>
                </DialogHeader>
                <ProductForm onSuccess={(product) => handleNewProductSuccess(product as Product & { id: string })} />
            </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", productName: "", quantity: 1, price: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
            {form.formState.errors.items?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.root.message}</p>}
          </div>

          <Separator />

          <div className="flex justify-end items-start gap-8">
              <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-medium">{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
              <div className="w-56">
                <FormField
                    control={form.control}
                    name="shippingMethod"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Frete</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); handleShippingMethodChange(value); }} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o frete..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {shippingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                {option.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage className="mt-1 text-xs"/>
                        </FormItem>
                    )}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total do Pedido</p>
                    <p className="text-2xl font-bold">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>
                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvando...
                    </>
                    ) : (
                      isEditMode ? "Salvar Alterações" : "Criar Pedido"
                    )}
                </Button>
              </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

    

    

    

    

    