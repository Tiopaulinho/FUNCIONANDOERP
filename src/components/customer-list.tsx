
"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FilePenLine, Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import CustomerRegistrationForm from "./customer-registration-form";
import type { Customer } from "@/lib/schemas";

const allCustomers: (Customer & { id: string })[] = [
  {
    id: "1",
    name: "José da Silva",
    email: "jose.silva@example.com",
    phone: "(11) 98765-4321",
    zip: "01001-000",
    street: "Praça da Sé",
    number: "s/n",
    complement: "lado ímpar",
    neighborhood: "Sé",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "(21) 91234-5678",
    zip: "20040-004",
    street: "Av. Rio Branco",
    number: "156",
    complement: "",
    neighborhood: "Centro",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    id: "3",
    name: "Carlos Pereira",
    email: "carlos.pereira@example.com",
    phone: "(31) 95555-4444",
    zip: "30110-044",
    street: "Av. do Contorno",
    number: "6594",
    complement: "Sala 501",
    neighborhood: "Savassi",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@example.com",
    phone: "(71) 99999-8888",
    zip: "40020-000",
    street: "Largo do Pelourinho",
    number: "10",
    complement: "",
    neighborhood: "Pelourinho",
    city: "Salvador",
    state: "BA",
  },
];

export default function CustomerList() {
  const [nameFilter, setNameFilter] = React.useState("");
  const [emailFilter, setEmailFilter] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState(allCustomers);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const lowercasedNameFilter = nameFilter.toLowerCase();
    const lowercasedEmailFilter = emailFilter.toLowerCase();

    const filtered = allCustomers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(lowercasedNameFilter);
      const emailMatch = customer.email.toLowerCase().includes(lowercasedEmailFilter);
      return nameMatch && emailMatch;
    });
    setFilteredCustomers(filtered);
  }, [nameFilter, emailFilter]);
  
  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  }

  const handleFormSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
    // Here you would refetch the customer list from the database
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Clientes Cadastrados</CardTitle>
                <CardDescription>
                  Visualize e gerencie os clientes cadastrados no sistema.
                </CardDescription>
            </div>
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
          </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="Filtrar por nome..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            <Input
              placeholder="Filtrar por email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.state}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(customer)}>
                          <FilePenLine className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="sr-only">Editar Cliente</DialogTitle>
              </DialogHeader>
              <CustomerRegistrationForm
                initialData={editingCustomer}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>
      </CardContent>
    </Card>
  );
}
