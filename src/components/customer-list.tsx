
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

interface CustomerListProps {
  customers: (Customer & { id: string })[];
  setCustomers: React.Dispatch<React.SetStateAction<(Customer & { id: string })[]>>;
  onAddCustomer: (customerData: Omit<Customer, 'id'>) => Customer & { id: string };
}

export default function CustomerList({ customers, setCustomers, onAddCustomer }: CustomerListProps) {
  const [nameFilter, setNameFilter] = React.useState("");
  const [emailFilter, setEmailFilter] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState(customers);
  const [editingCustomer, setEditingCustomer] = React.useState<(Customer & { id: string}) | null>(null);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const lowercasedNameFilter = nameFilter.toLowerCase();
    const lowercasedEmailFilter = emailFilter.toLowerCase();

    const filtered = customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(lowercasedNameFilter);
      const emailMatch = customer.email.toLowerCase().includes(lowercasedEmailFilter);
      return nameMatch && emailMatch;
    });
    setFilteredCustomers(filtered);
  }, [nameFilter, emailFilter, customers]);
  
  const handleEditClick = (customer: Customer & { id: string }) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  }

  const handleFormSuccess = (customerData: Omit<Customer, 'id'>) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerData } : c));
    } else {
      // Add new customer
      onAddCustomer(customerData);
    }
    setIsEditDialogOpen(false);
    setIsNewCustomerDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Clientes Cadastrados</CardTitle>
                <CardDescription>
                  Visualize e gerencie os clientes cadastrados no sistema.
                </CardDescription>
            </div>
            <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
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
                  <CustomerRegistrationForm onSuccess={handleFormSuccess} />
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
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(customer.id)}>
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
                onSuccess={(data) => handleFormSuccess(data as Omit<Customer, 'id'>)}
              />
            </DialogContent>
          </Dialog>
      </CardContent>
    </Card>
  );
}
