
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
import type { Product, SalesOrder, Lead, Customer, Proposal } from "@/lib/schemas";
import SalesFunnel from "@/components/sales-funnel";
import ProposalList from "@/components/proposal-list";


const initialProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Notebook Pro", price: 7500 },
    { id: "prod-2", name: "Mouse Sem Fio", price: 120.50 },
    { id: "prod-3", name: "Teclado Mecânico", price: 450 },
    { id: "prod-4", name: "Monitor 4K", price: 2300 },
];

const initialOrders: SalesOrder[] = [
  { id: "ORD-001", customerId: "1", customerName: "José da Silva", date: "2024-07-28", total: 150.50, status: "Entregue", items: [ {id: "item-1", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 150.50} ] },
  { id: "ORD-002", customerId: "2", customerName: "Maria Oliveira", date: "2024-07-27", total: 299.99, status: "Enviado", items: [ {id: "item-2", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 2, price: 120}, {id: "item-3", productId: "prod-3", productName: "Teclado", quantity: 1, price: 59.99} ] },
  { id: "ORD-003", customerId: "3", customerName: "Carlos Pereira", date: "2024-07-26", total: 75.00, status: "Processando", items: [ {id: "item-4", productId: "prod-4", productName: "Monitor 4K", quantity: 1, price: 75.00} ] },
  { id: "ORD-004", customerId: "4", customerName: "Ana Costa", date: "2024-07-25", total: 500.00, status: "Pendente", items: [ {id: "item-5", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 500} ] },
  { id: "ORD-005", customerId: "1", customerName: "José da Silva", date: "2024-07-24", total: 99.90, status: "Entregue", items: [ {id: "item-6", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 1, price: 99.90} ] },
];

const initialLeads: Lead[] = [
  { id: "lead-1", name: "Empresa Alpha", contact: "João", phone: "(11) 91111-1111", value: 15000, status: "Contato", proposalNotes: "Criar proposta para 10 licenças anuais do software X." },
  { id: "lead-2", name: "Startup Beta", contact: "Mariana", phone: "(21) 92222-2222", value: 8000, status: "Proposta", proposalNotes: "Proposta para desenvolvimento de app mobile." },
  { id: "lead-3", name: "Comércio Gama", contact: "Carlos", phone: "(31) 93333-3333", value: 25000, status: "Criar Pedido (Aprovado)" },
  { id: "lead-4", name: "Serviços Delta", contact: "Fernanda", phone: "(41) 94444-4444", value: 5000, status: "Lista de Leads" },
  { id: "lead-5", name: "Indústria Epsilon", contact: "Ricardo", phone: "(51) 95555-5555", value: 50000, status: "Criar Pedido (Aprovado)" },
  { id: "lead-6", name: "Varejo Zeta", contact: "Ana", phone: "(61) 96666-6666", value: 12000, status: "Reprovado" },
];

const initialCustomers: (Customer & { id: string })[] = [
  { id: "1", name: "José da Silva", email: "jose.silva@example.com", phone: "(11) 98765-4321", zip: "01001-000", street: "Praça da Sé", number: "s/n", complement: "lado ímpar", neighborhood: "Sé", city: "São Paulo", state: "SP" },
  { id: "2", name: "Maria Oliveira", email: "maria.oliveira@example.com", phone: "(21) 91234-5678", zip: "20040-004", street: "Av. Rio Branco", number: "156", complement: "", neighborhood: "Centro", city: "Rio de Janeiro", state: "RJ" },
  { id: "3", name: "Carlos Pereira", email: "carlos.pereira@example.com", phone: "(31) 95555-4444", zip: "30110-044", street: "Av. do Contorno", number: "6594", complement: "Sala 501", neighborhood: "Savassi", city: "Belo Horizonte", state: "MG" },
  { id: "4", name: "Ana Costa", email: "ana.costa@example.com", phone: "(71) 99999-8888", zip: "40020-000", street: "Largo do Pelourinho", number: "10", complement: "", neighborhood: "Pelourinho", city: "Salvador", state: "BA" },
];


export default function Home() {
  const [products, setProducts] = React.useState(initialProducts);
  const [orders, setOrders] = React.useState<SalesOrder[]>(initialOrders);
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [customers, setCustomers] = React.useState(initialCustomers);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);

  const [editingOrder, setEditingOrder] = React.useState<SalesOrder | null>(null);
  const [leadForOrder, setLeadForOrder] = React.useState<Lead | null>(null);
  const [proposalForOrder, setProposalForOrder] = React.useState<Proposal | null>(null);
  
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
    // After saving order, move lead to a final state if it came from a lead
    if (leadForOrder) {
      updateLead({ ...leadForOrder, status: 'Criar Pedido (Aprovado)' }); 
    }
    setIsSalesOrderDialogOpen(false);
    setEditingOrder(null);
    setLeadForOrder(null);
    setProposalForOrder(null);
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
    if (lead) {
      setLeadForOrder(lead);
      if (lead.proposalId) {
        const proposal = proposals.find(p => p.id === lead.proposalId);
        setProposalForOrder(proposal || null);
      } else {
        setProposalForOrder(null);
      }
    } else {
      setLeadForOrder(null);
      setProposalForOrder(null);
    }
    setIsSalesOrderDialogOpen(true);
  }

  const addCustomer = (customerData: Omit<Customer, 'id'>): Customer & { id: string } => {
    const newCustomer = { ...customerData, id: `cust-${Date.now()}` };
    setCustomers(prev => [...prev, newCustomer]);

    // If a lead was being processed, update it with the new customer ID
    if (leadForOrder) {
      const updatedLead = { ...leadForOrder, contact: newCustomer.name, customerId: newCustomer.id };
      updateLead(updatedLead);
      setLeadForOrder(updatedLead);
    }
    return newCustomer;
  }
  
  const updateLead = (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const deleteLead = (leadId: string) => {
    setLeads(prevLeads => prevLeads.filter(l => l.id !== leadId));
  };

  const handleProposalSave = (proposal: Proposal) => {
    setProposals(prev => {
        const existing = prev.find(p => p.id === proposal.id);
        if (existing) {
            return prev.map(p => p.id === proposal.id ? proposal : p);
        }
        return [...prev, proposal];
    });
    const leadToUpdate = leads.find(l => l.id === proposal.leadId);
    if (leadToUpdate && !leadToUpdate.proposalId) {
      updateLead({ ...leadToUpdate, proposalId: proposal.id });
    }
};

const handleProposalSent = (proposal: Proposal) => {
    handleProposalSave({ ...proposal, status: 'Sent' });
    const leadToUpdate = leads.find(l => l.id === proposal.leadId);
    if (leadToUpdate) {
      updateLead({ ...leadToUpdate, status: 'Negociação' });
    }
};

  const deleteProposal = (proposalId: string) => {
    setProposals(prev => prev.filter(p => p.id !== proposalId));
    // Also remove from lead
    const leadToUpdate = leads.find(l => l.proposalId === proposalId);
    if (leadToUpdate) {
        const { proposalId, ...rest } = leadToUpdate;
        updateLead(rest as Lead);
    }
  };


  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-background p-4 md:p-8">
      <div className="w-full max-w-7xl">
        <Tabs defaultValue="customers" className="w-full">
          <div className="mb-4 flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="funnel">Funil de Venda</TabsTrigger>
              <TabsTrigger value="proposals">Propostas</TabsTrigger>
              <TabsTrigger value="orders">Pedidos de Venda</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="customers">
            <CustomerList customers={customers} setCustomers={setCustomers} onAddCustomer={addCustomer} />
          </TabsContent>
          <TabsContent value="funnel">
            <SalesFunnel 
              leads={leads} 
              setLeads={setLeads} 
              onOpenNewOrder={openNewOrderDialog}
              customers={customers}
              products={products}
              onProductAdd={addProduct}
              onUpdateLead={updateLead}
              onDeleteLead={deleteLead}
              proposals={proposals}
              onProposalSave={handleProposalSave}
              onProposalSent={handleProposalSent}
            />
          </TabsContent>
           <TabsContent value="proposals">
            <ProposalList 
              proposals={proposals}
              leads={leads}
              customers={customers}
              onDeleteProposal={deleteProposal}
            />
          </TabsContent>
          <TabsContent value="orders">
             <SalesOrderList 
              orders={orders}
              setOrders={setOrders}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onNewOrderClick={() => openNewOrderDialog()}
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
        
        <Dialog open={isSalesOrderDialogOpen} onOpenChange={(isOpen) => {
            setIsSalesOrderDialogOpen(isOpen);
            if (!isOpen) {
              setEditingOrder(null);
              setLeadForOrder(null);
              setProposalForOrder(null);
            }
        }}>
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
                proposalData={proposalForOrder}
                customers={customers}
                onCustomerAdd={addCustomer}
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
