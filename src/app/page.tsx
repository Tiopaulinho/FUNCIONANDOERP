
"use client";

import * as React from "react";
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
import type { Product, SalesOrder, Lead, Customer, Proposal, ShippingSettings } from "@/lib/schemas";
import SalesFunnel from "@/components/sales-funnel";
import ProposalList from "@/components/proposal-list";
import ShippingSettingsComponent from "@/components/shipping-settings";


const initialProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Eletrônicos - Notebook Pro", category: "Eletrônicos", price: 7500, rawMaterialCost: 4000, laborCost: 1000, suppliesCost: 200, fees: 50, taxes: 1000, profitMargin: 20 },
    { id: "prod-2", name: "Acessórios - Mouse Sem Fio", category: "Acessórios", price: 120.50, rawMaterialCost: 50, laborCost: 10, suppliesCost: 5, fees: 2, taxes: 15, profitMargin: 30 },
    { id: "prod-3", name: "Acessórios - Teclado Mecânico", category: "Acessórios", price: 450, rawMaterialCost: 200, laborCost: 50, suppliesCost: 20, fees: 10, taxes: 70, profitMargin: 25 },
    { id: "prod-4", name: "Eletrônicos - Monitor 4K", category: "Eletrônicos", price: 2300, rawMaterialCost: 1200, laborCost: 200, suppliesCost: 100, fees: 30, taxes: 400, profitMargin: 20 },
];

const initialOrders: SalesOrder[] = [
  { id: "ORD-001", customerId: "1", customerName: "José da Silva", date: "2024-07-28", total: 150.50, status: "Entregue", shipping: 0, items: [ {id: "item-1", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 150.50} ] },
  { id: "ORD-002", customerId: "2", customerName: "Maria Oliveira", date: "2024-07-27", total: 299.99, status: "Enviado", shipping: 0, items: [ {id: "item-2", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 2, price: 120}, {id: "item-3", productId: "prod-3", productName: "Teclado", quantity: 1, price: 59.99} ] },
  { id: "ORD-003", customerId: "3", customerName: "Carlos Pereira", date: "2024-07-26", total: 75.00, status: "Processando", shipping: 0, items: [ {id: "item-4", productId: "prod-4", productName: "Monitor 4K", quantity: 1, price: 75.00} ] },
  { id: "ORD-004", customerId: "4", customerName: "Ana Costa", date: "2024-07-25", total: 500.00, status: "Pendente", shipping: 0, items: [ {id: "item-5", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 500} ] },
  { id: "ORD-005", customerId: "1", customerName: "José da Silva", date: "2024-07-24", total: 99.90, status: "Entregue", shipping: 0, items: [ {id: "item-6", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 1, price: 99.90} ] },
];

const initialLeads: Lead[] = [
  { id: "lead-1", name: "Empresa Alpha", contact: "João", phone: "(11) 91111-1111", value: 15000, status: "Contato", proposalNotes: "Criar proposta para 10 licenças anuais do software X.", statusHistory: [{ status: "Contato", date: "2024-07-20"}] },
  { id: "lead-2", name: "Startup Beta", contact: "Mariana", phone: "(21) 92222-2222", value: 8000, status: "Proposta", proposalNotes: "Proposta para desenvolvimento de app mobile.", statusHistory: [{ status: "Proposta", date: "2024-07-21"}] },
  { id: "lead-3", name: "Comércio Gama", contact: "Carlos", phone: "(31) 93333-3333", value: 25000, status: "Aprovado", customerId: "cust-gama-1", statusHistory: [{ status: "Aprovado", date: "2024-07-22"}] },
  { id: "lead-4", name: "Serviços Delta", contact: "Fernanda", phone: "(41) 94444-4444", value: 5000, status: "Lista de Leads", statusHistory: [{ status: "Lista de Leads", date: "2024-07-23"}] },
  { id: "lead-5", name: "Indústria Epsilon", contact: "Ricardo", phone: "(51) 95555-5555", value: 50000, status: "Aprovado", customerId: "cust-epsilon-1", statusHistory: [{ status: "Aprovado", date: "2024-07-24"}] },
  { id: "lead-6", name: "Varejo Zeta", contact: "Ana", phone: "(61) 96666-6666", value: 12000, status: "Reprovado", statusHistory: [{ status: "Reprovado", date: "2024-07-25"}] },
];

const initialProposals: Proposal[] = [];

const initialCustomers: (Customer & { id: string })[] = [
  { id: "1", name: "José da Silva", companyName: "Silva & Filhos", email: "jose.silva@example.com", phone: "(11) 98765-4321", zip: "01001-000", street: "Praça da Sé", number: "s/n", complement: "lado ímpar", neighborhood: "Sé", city: "São Paulo", state: "SP", distance: 10 },
  { id: "2", name: "Maria Oliveira", companyName: "Oliveira Transportes", email: "maria.oliveira@example.com", phone: "(21) 91234-5678", zip: "20040-004", street: "Av. Rio Branco", number: "156", complement: "", neighborhood: "Centro", city: "Rio de Janeiro", state: "RJ", distance: 450 },
  { id: "3", name: "Carlos Pereira", email: "carlos.pereira@example.com", phone: "(31) 95555-4444", zip: "30110-044", street: "Av. do Contorno", number: "6594", complement: "Sala 501", neighborhood: "Savassi", city: "Belo Horizonte", state: "MG", distance: 500 },
  { id: "4", name: "Ana Costa", email: "ana.costa@example.com", phone: "(71) 99999-8888", zip: "40020-000", street: "Largo do Pelourinho", number: "10", complement: "", neighborhood: "Pelourinho", city: "Salvador", state: "BA", distance: 1900 },
  { id: "cust-gama-1", name: "Comércio Gama", companyName: "Comércio Gama", email: "contato@comerciogama.com", phone: "(31) 93333-3333", zip: "30110-044", street: "Av. do Contorno", number: "7000", complement: "", neighborhood: "Savassi", city: "Belo Horizonte", state: "MG", distance: 500 },
  { id: "cust-epsilon-1", name: "Indústria Epsilon", companyName: "Indústria Epsilon", email: "contato@industriaepsilon.com", phone: "(51) 95555-5555", zip: "90010-000", street: "Av. Borges de Medeiros", number: "500", complement: "", neighborhood: "Centro Histórico", city: "Porto Alegre", state: "RS", distance: 1100 },
];

const initialShippingSettings: ShippingSettings = {
  originZip: "01001-000",
  tiers: [
    { minDistance: 0, maxDistance: 50, cost: 10 },
    { minDistance: 51, maxDistance: 200, cost: 25 },
    { minDistance: 201, maxDistance: 1000, cost: 50 },
  ]
};


export default function Home() {
  const [products, setProducts] = React.useState(initialProducts);
  const [orders, setOrders] = React.useState<SalesOrder[]>(initialOrders);
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [customers, setCustomers] = React.useState(initialCustomers);
  const [proposals, setProposals] = React.useState<Proposal[]>(initialProposals);
  const [shippingSettings, setShippingSettings] = React.useState<ShippingSettings>(initialShippingSettings);

  const [editingOrder, setEditingOrder] = React.useState<SalesOrder | null>(null);
  const [leadForOrder, setLeadForOrder] = React.useState<Lead | null>(null);
  const [proposalForOrder, setProposalForOrder] = React.useState<Proposal | null>(null);
  
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = React.useState(false);
  const [isSalesOrderDialogOpen, setIsSalesOrderDialogOpen] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("funnel");


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
    
    if (leadForOrder) {
      const today = new Date().toISOString();
      const newHistoryEntry = { status: 'Aprovado' as const, date: today };
      const newHistory = [...(leadForOrder.statusHistory || []), newHistoryEntry];
      updateLead({ ...leadForOrder, status: 'Aprovado', statusHistory: newHistory }); 
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
      const updatedLead = { ...leadForOrder, customerId: newCustomer.id };
      updateLead(updatedLead);
      setLeadForOrder(updatedLead);
    }
    return newCustomer;
  }
  
  const addLead = (leadData: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => {
    const today = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: "Lista de Leads",
      statusHistory: [{ status: "Lista de Leads", date: today }],
    };
    setLeads(prev => [newLead, ...prev]);
  };
  
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
      const today = new Date().toISOString();
      const newHistoryEntry = { status: 'Negociação' as const, date: today };
      const newHistory = [...(leadToUpdate.statusHistory || []), newHistoryEntry];
      updateLead({ ...leadToUpdate, status: 'Negociação', statusHistory: newHistory, proposalId: proposal.id });
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="funnel">Funil de Venda</TabsTrigger>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="proposals">Propostas</TabsTrigger>
              <TabsTrigger value="orders">Pedidos de Venda</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="shipping">Frete</TabsTrigger>
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
              onAddLead={addLead}
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
          <TabsContent value="shipping">
            <ShippingSettingsComponent
              settings={shippingSettings}
              onSave={setShippingSettings}
            />
          </TabsContent>
        </Tabs>
        
        <Dialog open={isSalesOrderDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingOrder(null);
              setLeadForOrder(null);
              setProposalForOrder(null);
            }
            setIsSalesOrderDialogOpen(isOpen);
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
                shippingSettings={shippingSettings}
              />
            </DialogContent>
        </Dialog>
         <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
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
