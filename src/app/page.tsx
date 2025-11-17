import CustomerRegistrationForm from "@/components/customer-registration-form";
import CustomerList from "@/components/customer-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-accent/30 p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <Tabs defaultValue="register">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Cliente
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Clientes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="register">
            <CustomerRegistrationForm />
          </TabsContent>
          <TabsContent value="manage">
            <Card className="shadow-2xl">
              <CardContent className="p-6">
                <CustomerList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
