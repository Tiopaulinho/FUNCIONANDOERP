
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, PlusCircle, Trash2, UserPlus } from "lucide-react";

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
import type { Customer, Product, SalesOrder, Lead, Proposal, ProposalItem } from "@/lib/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import ProductForm from "./product-form";
import CustomerRegistrationForm from "./customer-registration-form";
import { CardDescription } from "./ui/card";

const salesOrderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Selecione um produto."),
  productName: z.string(), // To display name
  quantity: z.coerce.number().min(1, "A quantidade deve ser no mínimo 1."),
  price: z.coerce.number().min(0.01, "O preço deve ser positivo."),
});

const salesOrderSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().min(1, "Selecione um cliente."),
  customerName: z.string().optional(), // For data handling
  date: z.string().optional(), // For data handling
  status: z.enum(["Pendente", "Processando", "Enviado", "Entregue"]).optional(),
  items: z.array(salesOrderItemSchema).min(1, "Adicione pelo menos um item ao pedido."),
});


type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

interface SalesOrderFormProps {
  initialData?: SalesOrder | null;
  onSuccess: (order: SalesOrder) => void;
  products: (Product & { id: string })[];
  onProductAdd: (newProduct: Product & { id: string }) => void;
  leadData?: Lead | null;
  proposalData?: Proposal | null;
  customers: (Customer & { id: string })[];
  onCustomerAdd: (customerData: Omit<Customer, 'id'>) => Customer & { id: string };
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
}: SalesOrderFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = React.useState(false);
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
      items: [{ productId: "", productName: "", quantity: 1, price: 0 }],
    },
  });

  React.useEffect(() => {
    let defaultItems = [{ productId: "", productName: "", quantity: 1, price: 0 }];

    if (proposalData?.items && proposalData.items.length > 0) {
        defaultItems = proposalData.items.map((item: ProposalItem) => ({
            id: `item-${Date.now()}-${Math.random()}`,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity || 1,
            price: item.price || 0,
        }));
    }

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
        items: defaultItems,
      });
    } else {
      form.reset({
        customerId: "",
        items: defaultItems,
      });
    }
  }, [initialData, leadData, proposalData, cameFromLead, isEditMode, customerForLead, form]);


  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch("items");
  const total = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);

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

  const handleNewCustomerSuccess = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer = onCustomerAdd(customerData);
    if (newCustomer) {
      form.setValue('customerId', newCustomer.id, { shouldValidate: true });
      toast({
          title: "Cliente Adicionado!",
          description: "O novo cliente já foi selecionado no pedido.",
      });
    }
    setIsCustomerDialogOpen(false);
  }

  async function onSubmit(data: SalesOrderFormValues) {
    setIsSubmitting(true);

    const customer = customers.find(c => c.id === data.customerId);
    
    if(!customer) {
      toast({
        variant: "destructive",
        title: "Cliente não encontrado",
        description: "Por favor, cadastre o cliente antes de criar o pedido.",
      });
      setIsCustomerDialogOpen(true);
      setIsSubmitting(false);
      return;
    }


    const finalOrderData: SalesOrder = {
      ...initialData,
      ...data,
      id: initialData?.id || `ORD-${Date.now()}`,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'Pendente',
      customerName: customer?.name || 'Cliente Desconhecido',
      total: total,
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

  const getCustomerRegistrationInitialData = () => {
    if (cameFromLead && !customerForLead && leadData) {
      return { 
        name: leadData.contact, 
        email: leadData.email || "", 
        phone: leadData.phone || "" 
      };
    }
    return null;
  };

  const selectedCustomerId = form.watch("customerId");

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                            value={customerForLead?.name || leadData?.contact || ""}
                            className="bg-muted/50"
                          />
                          {!customerForLead && (
                            <CardDescription className="text-xs text-destructive mt-1">
                                Este cliente não tem cadastro. Clique no botão `+` para completar.
                            </CardDescription>
                          )}
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
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                       )}
                      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" disabled={isEditMode || (cameFromLead && !!customerForLead)}>
                            <UserPlus className="h-4 w-4" />
                            <span className="sr-only">Novo Cliente</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">
                          <DialogHeader>
                            <DialogTitle className="sr-only">Cadastro de Cliente</DialogTitle>
                          </DialogHeader>
                          <CustomerRegistrationForm 
                             initialData={getCustomerRegistrationInitialData()}
                             onSuccess={handleNewCustomerSuccess} 
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                                <Button variant="outline" size="icon">
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
            <DialogContent className="sm:max-w-md">
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

          <div className="flex justify-end items-center gap-4">
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
        </form>
      </Form>
    </div>
  );
}


    

    
