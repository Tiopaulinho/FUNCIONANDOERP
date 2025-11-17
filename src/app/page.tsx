
"use client";

import * as React from "react";
import CustomerRegistrationForm from "@/components/customer-registration-form";
import CustomerList from "@/components/customer-list";
import SalesOrderList from "@/components/sales-order-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SalesOrderForm from "@/components/sales-order-form";
import ProductList from "@/components/product-list";
import ProductForm from "@/components/product-form";
import type { Product, SalesOrder, Lead } from "@/lib/schemas";
import SalesFunnel from "@/components/sales-funnel";

const initialProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Notebook Pro", price: 7500 },
    { id: "prod-2", name: "Mouse Sem Fio", price: 120.50 },
    { id: "prod-3", name: "Teclado Mecânico", price: 450 },
    { id: "prod-4", name: "Monitor 4K", price: 2300 },
];

const initialOrders: SalesOrder[] = [
  { id: "ORD-001", customerId: "1", customerName: "José da Silva", date: "2024-07-28", total: 150.50, status: "Entregue", items: [ {id: "item-1", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 150.50} ] },
  { id: "ORD-002", customerId: "2", customerName: "Maria Oliveira", date: "2024-07-27", total: 299.99, status: "Enviado", items: [ {id: "item-2", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 2, price: 120}, {id: "item-3", productId: "prod-3", productName: "Teclado", quantity: 1, price: 59.99} ] },
  { id: "ORD-003", customerId: "1", customerName: "Carlos Pereira", date: "2024-07-26", total: 75.00, status: "Processando", items: [ {id: "item-4", productId: "prod-4", productName: "Monitor 4K", quantity: 1, price: 75.00} ] },
  { id: "ORD-004", customerId: "2", customerName: "Ana Costa", date: "2024-07-25", total: 500.00, status: "Pendente", items: [ {id: "item-5", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 500} ] },
  { id: "ORD-005", customerId: "1", customerName: "José da Silva", date: "2024-07-24", total: 99.90, status: "Entregue", items: [ {id: "item-6", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 1, price: 99.90} ] },
];

const initialLeads: Lead[] = [
  { id: "lead-1", name: "Empresa Alpha", contact: "João", value: 15000, status: "Contato" },
  { id: "lead-2", name: "Startup Beta", contact: "Mariana", value: 8000, status: "Proposta" },
  { id: "lead-3", name: "Comércio Gama", contact: "Carlos", value: 25000, status: "Negociação" },
  { id: "lead-4", name: "Serviços Delta", contact: "Fernanda", value: 5000, status: "Lista de Leads" },
  { id: "lead-5", name: "Indústria Epsilon", contact: "Ricardo", value: 50000, status: "Criar Pedido (Aprovado)" },
  { id: "lead-6", name: "Varejo Zeta", contact: "Ana", value: 12000, status: "Reprovado" },
];


export default function Home() {
  const [products, setProducts] = React.useState(initialProducts);
  const [orders, setOrders] = React.useState<SalesOrder[]>(initialOrders);
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [editingOrder, setEditingOrder] = React.useState<SalesOrder | null>(null);
  const [leadForOrder, setLeadForOrder] = React.useState<Lead | null>(null);
  
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = React.useState(false);
  const [isSalesOrderDialogOpen, setIsSalesOrderDialogOpen] = React.useState(false);


  const addProduct = (newProduct: Product & { id: string }) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setIsNewProductDialogOpen(false);
  };
  
  const updateProduct = (updatedProduct: Product & { id: string }) => {
    setProducts((prevProducts) => 
      prevProducts.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
  };
  
  const handleOrderSave = (savedOrder: SalesOrder) => {
    const isEditing = !!savedOrder.id && orders.some(o => o.id === savedOrder.id);
    if (isEditing) {
      setOrders(prevOrders => prevOrders.map(o => o.id === savedOrder.id ? savedOrder : o));
    } else {
      setOrders(prevOrders => [...prevOrders, { ...savedOrder, id: `ORD-${Date.now()}` }]);
    }
    setIsSalesOrderDialogOpen(false);
    setEditingOrder(null);
    setLeadForOrder(null);
  }

  const handleEditOrder = (order: SalesOrder) => {
    setEditingOrder(order);
    setIsSalesOrderDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
  }

  const openNewOrderDialog = (lead?: Lead) => {
    setEditingOrder(null);
    if(lead) {
      setLeadForOrder(lead);
    }
    setIsSalesOrderDialogOpen(true);
  }

  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-background p-4 md:p-8">
      <div className="w-full max-w-7xl">
        <Tabs defaultValue="customers" className="w-full">
          <div className="mb-4 flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="funnel">Funil de Venda</TabsTrigger>
              <TabsTrigger value="orders">Pedidos de Venda</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="customers">
            <CustomerList />
          </TabsContent>
          <TabsContent value="funnel">
            <SalesFunnel leads={leads} setLeads={setLeads} onOpenNewOrder={openNewOrderDialog} />
          </TabsContent>
          <TabsContent value="orders">
             <SalesOrderList 
              orders={orders}
              setOrders={setOrders}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onNewOrderClick={openNewOrderDialog}
            />
          </TabsContent>
          <TabsContent value="products">
            <ProductList 
              products={products}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              onNewProductClick={() => setIsNewProductDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>
        
        <Dialog open={isSalesOrderDialogOpen} onOpenChange={setIsSalesOrderDialogOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingOrder ? "Editar Pedido de Venda" : "Novo Pedido de Venda"}</DialogTitle>
              </DialogHeader>
              <SalesOrderForm
                products={products}
                onProductAdd={addProduct}
                onSuccess={handleOrderSave}
                initialData={editingOrder}
                leadData={leadForOrder}
              />
            </DialogContent>
        </Dialog>
         <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Produto</DialogTitle>
              </DialogHeader>
              <ProductForm onSuccess={addProduct} />
            </DialogContent>
          </Dialog>

      </div>
    </main>
  );
}
