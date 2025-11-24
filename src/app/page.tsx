
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
} from "@/components/ui/tabs";
import SalesOrderForm from "@/components/sales-order-form";
import ProductList from "@/components/product-list";
import ProductForm from "@/components/product-form";
import type { Product, SalesOrder, Lead, Customer, Proposal, ShippingSettings } from "@/lib/schemas";
import SalesFunnel from "@/components/sales-funnel";
import ProposalList from "@/components/proposal-list";
import ShippingSettingsComponent from "@/components/shipping-settings";
import ReactivationSettings from "@/components/reactivation-settings";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { collection } from "firebase/firestore";


const initialProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Eletrônicos - Notebook Pro", category: "Eletrônicos", price: 7500, rawMaterialCost: 4000, laborCost: 1000, suppliesCost: 200, fees: 50, taxes: 1000, profitMargin: 20 },
    { id: "prod-2", name: "Acessórios - Mouse Sem Fio", category: "Acessórios", price: 120.50, rawMaterialCost: 50, laborCost: 10, suppliesCost: 5, fees: 2, taxes: 15, profitMargin: 30 },
    { id: "prod-3", name: "Acessórios - Teclado Mecânico", category: "Acessórios", price: 450, rawMaterialCost: 200, laborCost: 50, suppliesCost: 20, fees: 10, taxes: 70, profitMargin: 25 },
    { id: "prod-4", name: "Eletrônicos - Monitor 4K", category: "Eletrônicos", price: 2300, rawMaterialCost: 1200, laborCost: 200, suppliesCost: 100, fees: 30, taxes: 400, profitMargin: 20 },
];

const initialOrders: SalesOrder[] = [
  { id: "ORD-001", leadId: "1-1", customerId: "1", customerName: "José da Silva", date: "2024-07-28", total: 150.50, status: "Entregue", shipping: 0, items: [ {id: "item-1", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 150.50} ] },
  { id: "ORD-002", leadId: "2-1", customerId: "2", customerName: "Maria Oliveira", date: "2024-07-27", total: 299.99, status: "Enviado", shipping: 0, items: [ {id: "item-2", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 2, price: 120}, {id: "item-3", productId: "prod-3", productName: "Teclado", quantity: 1, price: 59.99} ] },
  { id: "ORD-003", leadId: "3-1", customerId: "3", customerName: "Carlos Pereira", date: "2024-07-26", total: 75.00, status: "Processando", shipping: 0, items: [ {id: "item-4", productId: "prod-4", productName: "Monitor 4K", quantity: 1, price: 75.00} ] },
  { id: "ORD-004", leadId: "4-1", customerId: "4", customerName: "Ana Costa", date: "2024-07-25", total: 500.00, status: "Pendente", shipping: 0, items: [ {id: "item-5", productId: "prod-1", productName: "Notebook Pro", quantity: 1, price: 500} ] },
  { id: "ORD-005", leadId: "5-2", customerId: "1", customerName: "José da Silva", date: "2024-07-24", total: 99.90, status: "Entregue", shipping: 0, items: [ {id: "item-6", productId: "prod-2", productName: "Mouse Sem Fio", quantity: 1, price: 99.90} ] },
];

const initialLeads: Lead[] = [
  { id: "1-1", name: "Empresa Alpha", contact: "João", phone: "(11) 91111-1111", value: 15000, status: "Contato", proposalNotes: "Criar proposta para 10 licenças anuais do software X.", statusHistory: [{ status: "Contato", date: "2024-07-20"}] },
  { id: "2-1", name: "Startup Beta", contact: "Mariana", phone: "(21) 92222-2222", value: 8000, status: "Proposta", proposalNotes: "Proposta para desenvolvimento de app mobile.", statusHistory: [{ status: "Proposta", date: "2024-07-21"}] },
  { id: "3-1", name: "Comércio Gama", contact: "Carlos", phone: "(31) 93333-3333", value: 25000, status: "Aprovado", customerId: "cust-gama-1", proposalId: "prop-3-1", statusHistory: [{ status: "Aprovado", date: "2024-07-22"}] },
  { id: "4-1", name: "Serviços Delta", contact: "Fernanda", phone: "(41) 94444-4444", value: 5000, status: "Lista de Leads", statusHistory: [{ status: "Lista de Leads", date: "2024-07-23"}] },
  { id: "5-1", name: "Indústria Epsilon", contact: "Ricardo", phone: "(51) 95555-5555", value: 50000, status: "Aprovado", customerId: "cust-epsilon-1", proposalId: "prop-5-1", statusHistory: [{ status: "Aprovado", date: "2024-07-24"}] },
  { id: "6-1", name: "Varejo Zeta", contact: "Ana", phone: "(61) 96666-6666", value: 12000, status: "Reprovado", statusHistory: [{ status: "Reprovado", date: "2024-07-25"}] },
  { id: "7-1", name: "Consultoria Sigma", contact: "Beatriz", phone: "(71) 97777-7777", value: 18000, status: "Negociação", proposalId: "prop-7-1", statusHistory: [{ status: "Negociação", date: "2024-07-26"}] },
  { id: "8-2", name: "Comércio Gama", contact: "Carlos", phone: "(31) 93333-3333", value: 7000, status: "Aprovado", customerId: "cust-gama-1", proposalId: "prop-8-2", statusHistory: [{ status: "Aprovado", date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString() }] }, // Old approved to test reactivation
];

const initialProposals: Proposal[] = [
  { id: "prop-3-1", leadId: "3-1", date: "2024-07-21", status: "Sent", items: [{ id: "p-item-1", productId: "prod-1", productName: "Eletrônicos - Notebook Pro", quantity: 2, price: 7500 }], total: 15000, discount: 0, shipping: 100 },
  { id: "prop-8-2", leadId: "8-2", date: "2024-07-28", status: "Sent", items: [{ id: "p-item-2", productId: "prod-4", productName: "Eletrônicos - Monitor 4K", quantity: 3, price: 2300 }], total: 6900, discount: 0, shipping: 50 },
  { id: "prop-5-1", leadId: "5-1", date: "2024-07-23", status: "Sent", items: [{ id: "p-item-3", productId: "prod-1", productName: "Eletrônicos - Notebook Pro", quantity: 5, price: 7400 }], total: 37000, discount: 0, shipping: 250 },
  { id: "prop-7-1", leadId: "7-1", date: "2024-07-25", status: "Sent", items: [{ id: "p-item-4", productId: "prod-3", productName: "Acessórios - Teclado Mecânico", quantity: 10, price: 450 }], total: 4500, discount: 0, shipping: 0 },
];

const initialShippingSettings: ShippingSettings = {
  originZip: "01001-000",
  tiers: [
    { minDistance: 0, maxDistance: 50, cost: 10 },
    { minDistance: 51, maxDistance: 200, cost: 25 },
    { minDistance: 201, maxDistance: 1000, cost: 50 },
  ],
  reactivationPeriodDays: 14,
};


export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const clientesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'clientes');
  }, [firestore, user]);

  const { data: customers = [], isLoading: customersLoading } = useCollection<Customer>(clientesCollection);

  const [products, setProducts] = React.useState(initialProducts);
  const [orders, setOrders] = React.useState<SalesOrder[]>(initialOrders);
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [proposals, setProposals] = React.useState<Proposal[]>(initialProposals);
  const [shippingSettings, setShippingSettings] = React.useState<ShippingSettings>(initialShippingSettings);

  const [editingOrder, setEditingOrder] = React.useState<SalesOrder | null>(null);
  const [leadForOrder, setLeadForOrder] = React.useState<Lead | null>(null);
  const [proposalForOrder, setProposalForOrder] = React.useState<Proposal | null>(null);
  
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = React.useState(false);
  const [isSalesOrderDialogOpen, setIsSalesOrderDialogOpen] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("funnel");

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);


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
    // This will be replaced by a Firestore call in CustomerList
    console.error("addCustomer should be handled by Firestore now");
    const newCustomer = { ...customerData, id: `cust-${Date.now()}` };
    return newCustomer;
  }
  
  const addLead = (leadData: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => {
    const today = new Date().toISOString();

    const totalCount = leads.length + 1;
    const customerLeadCount = leads.filter(
        (l) => l.name.toLowerCase() === leadData.name.toLowerCase()
    ).length + 1;

    const newLead: Lead = {
      ...leadData,
      id: `${totalCount}-${customerLeadCount}`,
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


  if (isUserLoading || customersLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh w-full flex-col items-center bg-muted/30 p-4 md:p-8">
      <div className="w-full max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 flex items-center justify-between gap-4">
             <Menubar className="border-none bg-transparent p-0">
                <MenubarMenu>
                    <MenubarTrigger className="font-semibold text-primary" onClick={() => setActiveTab('funnel')}>Funil de Venda</MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Cadastros</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() => setActiveTab('customers')}>Clientes</MenubarItem>
                        <MenubarItem onClick={() => setActiveTab('products')}>Produtos</MenubarItem>
                        <MenubarItem onClick={() => setActiveTab('shipping')}>Frete</MenubarItem>
                        <MenubarItem onClick={() => setActiveTab('reactivation')}>Reativação</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                 <MenubarMenu>
                    <MenubarTrigger>Operacional</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={() => setActiveTab('proposals')}>Propostas</MenubarItem>
                        <MenubarItem onClick={() => setActiveTab('orders')}>Pedidos de Venda</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                 <MenubarMenu>
                    <MenubarTrigger disabled>Análises</MenubarTrigger>
                </MenubarMenu>
            </Menubar>
          </div>
          <TabsContent value="customers">
            <CustomerList 
                customers={customers} 
                shippingSettings={shippingSettings}
                collectionRef={clientesCollection}
            />
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
              shippingSettings={shippingSettings}
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
          <TabsContent value="reactivation">
            <ReactivationSettings
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
