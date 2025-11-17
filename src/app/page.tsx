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

export default function Home() {
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
                  <SalesOrderForm />
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
                  <ProductForm />
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
            <ProductList />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
