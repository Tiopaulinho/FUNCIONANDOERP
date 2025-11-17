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
import { UserPlus, ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-accent/30 p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <Tabs defaultValue="customers" className="w-full">
          <div className="mb-4 flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="orders">Pedidos de Venda</TabsTrigger>
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
                    <DialogTitle className="sr-only">Cadastro de Cliente</DialogTitle>
                  </DialogHeader>
                  <CustomerRegistrationForm />
                </DialogContent>
              </Dialog>
               <Button variant="outline">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Novo Pedido
                </Button>
            </div>
          </div>
          <TabsContent value="customers">
            <CustomerList />
          </TabsContent>
          <TabsContent value="orders">
            <SalesOrderList />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
