import CustomerRegistrationForm from "@/components/customer-registration-form";
import CustomerList from "@/components/customer-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-accent/30 p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <div className="mb-4 flex justify-end">
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
        </div>
        <CustomerList />
      </div>
    </main>
  );
}