
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
import { Truck, Package, CheckCircle, Clock, FilePenLine, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { SalesOrder, OrderStatus } from "@/lib/schemas";

const statuses: OrderStatus[] = ["Pendente", "Processando", "Enviado", "Entregue"];

const statusConfig: { [key in OrderStatus]: { variant: "destructive" | "outline" | "secondary" | "default"; icon: React.ElementType } } = {
  Pendente: { variant: "destructive", icon: Clock },
  Processando: { variant: "outline", icon: Package },
  Enviado: { variant: "secondary", icon: Truck },
  Entregue: { variant: "default", icon: CheckCircle },
};

const OrderCard = ({ order, onDragStart, onClick }: { order: SalesOrder, onDragStart: (e: React.DragEvent, orderId: string) => void, onClick: () => void }) => {
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

const OrderDetailsModal = ({ 
  order, 
  open, 
  onOpenChange,
  onEdit,
  onDelete
}: { 
  order: SalesOrder | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onEdit: (order: SalesOrder) => void;
  onDelete: (orderId: string) => void;
}) => {
  if (!order) return null;

  const handleDeleteClick = () => {
    onDelete(order.id);
  }

  const handleEditClick = () => {
    onEdit(order);
  }

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
                <span>{item.quantity}x {item.productName}</span>
                <span>{(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Total do Pedido</p>
                <p className="font-bold text-lg">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleEditClick}>
                  <FilePenLine className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o pedido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteClick}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SalesOrderListProps {
  orders: SalesOrder[];
  setOrders: React.Dispatch<React.SetStateAction<SalesOrder[]>>;
  onEditOrder: (order: SalesOrder) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function SalesOrderList({ orders, setOrders, onEditOrder, onDeleteOrder }: SalesOrderListProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = React.useState<SalesOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCardClick = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (orderId: string) => {
    onDeleteOrder(orderId);
    setIsModalOpen(false);
    toast({
      title: "Pedido Excluído!",
      description: "O pedido foi removido com sucesso.",
      variant: "destructive"
    });
  }

  const handleEdit = (order: SalesOrder) => {
    setIsModalOpen(false);
    onEditOrder(order);
  }
  
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
    const grouped: { [key in OrderStatus]?: SalesOrder[] } = {};
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
        <OrderDetailsModal 
            order={selectedOrder} 
            open={isModalOpen} 
            onOpenChange={setIsModalOpen}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    </div>
  );
}
