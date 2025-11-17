"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, PlusCircle, Trash2 } from "lucide-react";

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
import type { Customer, Product } from "@/lib/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import ProductForm from "./product-form";

// Mock data, replace with actual data fetching
const allCustomers: (Customer & { id: string })[] = [
    { id: "1", name: "José da Silva", email: "jose.silva@example.com", phone: "(11) 98765-4321", zip: "01001-000", street: "Praça da Sé", number: "s/n", complement: "lado ímpar", neighborhood: "Sé", city: "São Paulo", state: "SP" },
    { id: "2", name: "Maria Oliveira", email: "maria.oliveira@example.com", phone: "(21) 91234-5678", zip: "20040-004", street: "Av. Rio Branco", number: "156", complement: "", neighborhood: "Centro", city: "Rio de Janeiro", state: "RJ" },
];

const allProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Notebook Pro", price: 7500 },
    { id: "prod-2", name: "Mouse Sem Fio", price: 120.50 },
    { id: "prod-3", name: "Teclado Mecânico", price: 450 },
    { id: "prod-4", name: "Monitor 4K", price: 2300 },
];

const salesOrderSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente."),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Selecione um produto."),
        productName: z.string(), // To display name
        quantity: z.coerce.number().min(1, "A quantidade deve ser no mínimo 1."),
        price: z.coerce.number().min(0.01, "O preço deve ser positivo."),
      })
    )
    .min(1, "Adicione pelo menos um item ao pedido."),
});

type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

interface SalesOrderFormProps {
  onSuccess?: () => void;
}

export default function SalesOrderForm({ onSuccess }: SalesOrderFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
  const [products, setProducts] = React.useState(allProducts);

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", productName: "", quantity: 1, price: 0 }],
    },
  });

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

  const handleNewProductSuccess = () => {
    // In a real app, you'd refetch products. Here we'll just add a mock one.
    const newProduct = { id: `prod-${Date.now()}`, name: "Novo Produto", price: 10 };
    setProducts([...products, newProduct]);
    setIsProductDialogOpen(false);
    toast({
      title: "Produto Adicionado!",
      description: "O novo produto já está disponível para seleção.",
    });
  }


  async function onSubmit(data: SalesOrderFormValues) {
    setIsSubmitting(true);
    console.log("Novo pedido:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    toast({
      title: "Sucesso!",
      description: "Pedido de venda criado com sucesso!",
    });

    if (onSuccess) {
      onSuccess();
    }
    form.reset();
  }

  return (
    <Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens do Pedido</h3>
            <Separator />
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
                                defaultValue={field.value}
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
                                <Button variant="outline" size="icon" onClick={() => setIsProductDialogOpen(true)}>
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
                              <Input type="number" placeholder="0" {...field} />
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
                              <Input type="number" step="0.01" placeholder="0,00" {...field} />
                          </FormControl>
                          <FormMessage className="mt-1 text-xs"/>
                          </FormItem>
                      )}
                      />
                  </TableCell>
                  <TableCell className="text-right">
                      {(watchedItems[index]?.quantity * watchedItems[index]?.price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", productName: "", quantity: 1, price: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
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
                  "Criar Pedido"
                  )}
              </Button>
          </div>
        </form>
      </Form>
       <DialogContent open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <ProductForm onSuccess={handleNewProductSuccess} />
      </DialogContent>
    </Dialog>
  );
}
