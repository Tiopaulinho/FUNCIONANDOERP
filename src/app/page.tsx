
"use client";

import * as React from "react";
import CustomerRegistrationForm from "@/components/customer-registration-form";
import CustomerList from "@/components/customer-list";
import SalesOrderList from "@/components/sales-order-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UserPlus, ShoppingCart, Package } from "lucide-react";
import SalesOrderForm from "@/components/sales-order-form";
import ProductList from "@/components/product-list";
import ProductForm from "@/components/product-form";
import type { Product } from "@/lib/schemas";

const initialProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Notebook Pro", price: 7500 },
    { id: "prod-2", name: "Mouse Sem Fio", price: 120.50 },
    { id: "prod-3", name: "Teclado Mecânico", price: 450 },
    { id: "prod-4", name: "Monitor 4K", price: 2300 },
];

export default function Home() {
  const [products, setProducts] = React.useState(initialProducts);

  const addProduct = (newProduct: Product & { id: string }) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const updateProducts = (updatedProducts: (Product & { id: string })[]) => {
    setProducts(updatedProducts);
  };


  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-accent/30 p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <Tabs defaultValue="customers" className="w-full">
          <div className="mb-4 flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="orders">Pedidos de Venda</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      Cadastro de Cliente
                    </DialogTitle>
                  </DialogHeader>
                  <CustomerRegistrationForm />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Novo Pedido
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Novo Pedido de Venda</DialogTitle>
                  </DialogHeader>
                  <SalesOrderForm products={products} onProductAdd={addProduct} />
                </DialogContent>
              </Dialog>
               <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Novo Produto</DialogTitle>
                  </DialogHeader>
                  <ProductForm onSuccess={(newProduct) => {
                     if (newProduct) {
                        addProduct(newProduct as Product & { id: string });
                      }
                  }} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <TabsContent value="customers">
            <CustomerList />
          </TabsContent>
          <TabsContent value="orders">
            <SalesOrderList />
          </TabsContent>
          <TabsContent value="products">
            <ProductList products={products} setProducts={updateProducts} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
