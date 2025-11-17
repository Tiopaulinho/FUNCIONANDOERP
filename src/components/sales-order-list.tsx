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
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FilePenLine, Trash2 } from "lucide-react";

type Order = {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: "Pendente" | "Processando" | "Enviado" | "Entregue";
};

const allOrders: Order[] = [
  { id: "ORD-001", customerName: "José da Silva", date: "2024-07-28", total: 150.50, status: "Entregue" },
  { id: "ORD-002", customerName: "Maria Oliveira", date: "2024-07-27", total: 299.99, status: "Enviado" },
  { id: "ORD-003", customerName: "Carlos Pereira", date: "2024-07-26", total: 75.00, status: "Processando" },
  { id: "ORD-004", customerName: "Ana Costa", date: "2024-07-25", total: 500.00, status: "Pendente" },
  { id: "ORD-005", customerName: "José da Silva", date: "2024-07-24", total: 99.90, status: "Entregue" },
];

const statusVariant: { [key in Order["status"]]: "default" | "secondary" | "outline" | "destructive" } = {
  Pendente: "destructive",
  Processando: "outline",
  Enviado: "secondary",
  Entregue: "default",
};


export default function SalesOrderList() {

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle>Pedidos de Venda</CardTitle>
        <CardDescription>
          Visualize e gerencie os pedidos de venda dos clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                   <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </TableCell>
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
