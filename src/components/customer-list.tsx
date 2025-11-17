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
import { FilePenLine, Trash2 } from "lucide-react";

const allCustomers = [
  {
    name: "José da Silva",
    email: "jose.silva@example.com",
    phone: "(11) 98765-4321",
    city: "São Paulo",
    state: "SP",
  },
  {
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "(21) 91234-5678",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    name: "Carlos Pereira",
    email: "carlos.pereira@example.com",
    phone: "(31) 95555-4444",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    name: "Ana Costa",
    email: "ana.costa@example.com",
    phone: "(71) 99999-8888",
    city: "Salvador",
    state: "BA",
  },
];

export default function CustomerList() {
  const [nameFilter, setNameFilter] = React.useState("");
  const [emailFilter, setEmailFilter] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState(allCustomers);

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

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle>Clientes Cadastrados</CardTitle>
        <CardDescription>
          Visualize e gerencie os clientes cadastrados no sistema.
        </CardDescription>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>{customer.state}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
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
      </CardContent>
    </Card>
  );
}
