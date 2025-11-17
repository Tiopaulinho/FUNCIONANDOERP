import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

const dummyCustomers = [
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
  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle>Clientes Cadastrados</CardTitle>
        <CardDescription>
          Visualize e gerencie os clientes cadastrados no sistema.
        </CardDescription>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyCustomers.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>{customer.state}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
