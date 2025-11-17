"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";

type OrderStatus = "Pendente" | "Processando" | "Enviado" | "Entregue";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
};

const allOrders: Order[] = [
  { id: "ORD-001", customerName: "José da Silva", date: "2024-07-28", total: 150.50, status: "Entregue", items: [ {id: "1", name: "Notebook Pro", quantity: 1, price: 150.50} ] },
  { id: "ORD-002", customerName: "Maria Oliveira", date: "2024-07-27", total: 299.99, status: "Enviado", items: [ {id: "2", name: "Mouse Sem Fio", quantity: 2, price: 120}, {id: "3", name: "Teclado", quantity: 1, price: 59.99} ] },
  { id: "ORD-003", customerName: "Carlos Pereira", date: "2024-07-26", total: 75.00, status: "Processando", items: [ {id: "4", name: "Monitor 4K", quantity: 1, price: 75.00} ] },
  { id: "ORD-004", customerName: "Ana Costa", date: "2024-07-25", total: 500.00, status: "Pendente", items: [ {id: "1", name: "Notebook Pro", quantity: 1, price: 500} ] },
  { id: "ORD-005", customerName: "José da Silva", date: "2024-07-24", total: 99.90, status: "Entregue", items: [ {id: "2", name: "Mouse Sem Fio", quantity: 1, price: 99.90} ] },
];

const statuses: OrderStatus[] = ["Pendente", "Processando", "Enviado", "Entregue"];

const statusConfig: { [key in OrderStatus]: { variant: "destructive" | "outline" | "secondary" | "default"; icon: React.ElementType } } = {
  Pendente: { variant: "destructive", icon: Clock },
  Processando: { variant: "outline", icon: Package },
  Enviado: { variant: "secondary", icon: Truck },
  Entregue: { variant: "default", icon: CheckCircle },
};

const OrderCard = ({ order, onDragStart, onClick }: { order: Order, onDragStart: (e: React.DragEvent, orderId: string) => void, onClick: () => void }) => {
  const { icon: Icon } = statusConfig[order.status];
  return (
    <Card 
      className="mb-4 cursor-grab active:cursor-grabbing hover:bg-accent" 
      onClick={onClick}
      draggable="true"
      onDragStart={(e) => onDragStart(e, order.id)}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-bold">{order.id}</CardTitle>
            <CardDescription className="text-xs">{order.customerName}</CardDescription>
          </div>
          <Badge variant={statusConfig[order.status].variant} className="capitalize text-xs">
            <Icon className="mr-1 h-3 w-3" />
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{new Date(order.date).toLocaleDateString("pt-BR")}</span>
          <span className="font-semibold">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderDetailsModal = ({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (open: boolean) => void; }) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido: <span className="font-bold text-primary">{order.id}</span></DialogTitle>
          <DialogDescription>
            Cliente: {order.customerName} | Data: {new Date(order.date).toLocaleDateString("pt-BR")}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div>
          <h3 className="mb-2 font-semibold">Itens do Pedido</h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                <span>{item.quantity}x {item.name}</span>
                <span>{(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex justify-end font-bold text-lg">
          <span className="mr-2">Total:</span>
          <span>{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function SalesOrderList() {
  const [orders, setOrders] = React.useState<Order[]>(allOrders);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("orderId", orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const ordersByStatus = React.useMemo(() => {
    const grouped: { [key in OrderStatus]?: Order[] } = {};
    for (const status of statuses) {
        grouped[status] = [];
    }
    for (const order of orders) {
      if (grouped[order.status]) {
        grouped[order.status]!.push(order);
      }
    }
    return grouped;
  }, [orders]);

  return (
    <div className="w-full">
        <div className="mb-6">
            <h2 className="text-2xl font-bold">Pedidos de Venda</h2>
            <p className="text-muted-foreground">Visualize e gerencie os pedidos de venda dos clientes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statuses.map((status) => (
            <div 
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center mb-4">
                  <h3 className="font-semibold text-lg capitalize">{status}</h3>
                  <Badge variant="secondary" className="ml-2">{ordersByStatus[status]?.length || 0}</Badge>
              </div>
              <Card className="bg-muted/40 border-dashed">
                  <CardContent className="p-4 min-h-[200px]">
                  {ordersByStatus[status]?.map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onClick={() => handleCardClick(order)}
                        onDragStart={handleDragStart}
                      />
                  ))}
                  {ordersByStatus[status]?.length === 0 && (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          Nenhum pedido aqui.
                      </div>
                  )}
                  </CardContent>
              </Card>
            </div>
        ))}
        </div>
        <OrderDetailsModal order={selectedOrder} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
