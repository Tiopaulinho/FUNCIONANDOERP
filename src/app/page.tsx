
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
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
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, CollectionReference, DocumentReference } from "firebase/firestore";
import AnalyticsDashboard from "@/components/analytics-dashboard";


export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const clientesCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'clientes') : null, [firestore, user]);
  const productsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'products') : null, [firestore, user]);
  const ordersCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'orders') : null, [firestore, user]);
  const leadsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'leads') : null, [firestore, user]);
  const proposalsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'proposals') : null, [firestore, user]);
  const settingsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'settings') : null, [firestore, user]);
  
  const shippingSettingsDoc = useMemoFirebase(() => settingsCollection ? doc(settingsCollection, 'shipping') : null, [settingsCollection]);

  const { data: customers = [], isLoading: customersLoading } = useCollection<Customer>(clientesCollection);
  const { data: products = [], isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: orders = [], isLoading: ordersLoading } = useCollection<SalesOrder>(ordersCollection);
  const { data: leads = [], isLoading: leadsLoading } = useCollection<Lead>(leadsCollection);
  const { data: proposals = [], isLoading: proposalsLoading } = useCollection<Proposal>(proposalsCollection);
  
  const [shippingSettings, setShippingSettings] = React.useState<ShippingSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (shippingSettingsDoc) {
      const { onSnapshot } = require("firebase/firestore");
      const unsubscribe = onSnapshot(shippingSettingsDoc, (doc) => {
        if (doc.exists()) {
          setShippingSettings(doc.data() as ShippingSettings);
        } else {
          setShippingSettings({
            originZip: "01001-000",
            tiers: [
              { minDistance: 0, maxDistance: 50, cost: 10 },
              { minDistance: 51, maxDistance: 200, cost: 25 },
            ],
            reactivationPeriodDays: 14,
          });
        }
        setSettingsLoading(false);
      });
      return () => unsubscribe();
    } else if (!isUserLoading && user) {
        // If there's a user but no doc, means we can stop loading for settings.
        setSettingsLoading(false);
    }
  }, [shippingSettingsDoc, isUserLoading, user]);


  const [editingOrder, setEditingOrder] = React.useState<SalesOrder | null>(null);
  const [leadForOrder, setLeadForOrder] = React.useState<Lead | null>(null);
  const [proposalForOrder, setProposalForOrder] = React.useState<Proposal | null>(null);
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = React.useState(false);
  const [isSalesOrderDialogOpen, setIsSalesOrderDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("funnel");

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!productsCollection) return;
    await addDocumentNonBlocking(productsCollection, newProduct);
    setIsNewProductDialogOpen(false);
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    if (!productsCollection) return;
    const docRef = doc(productsCollection, updatedProduct.id);
    await updateDocumentNonBlocking(docRef, updatedProduct);
  };

  const deleteProduct = async (productId: string) => {
    if (!productsCollection) return;
    await deleteDocumentNonBlocking(doc(productsCollection, productId));
  };
  
  const handleOrderSave = async (savedOrder: SalesOrder) => {
    if (!ordersCollection) return;

    if (savedOrder.id && orders.some(o => o.id === savedOrder.id)) {
      await updateDocumentNonBlocking(doc(ordersCollection, savedOrder.id), savedOrder);
    } else {
      const orderData: Omit<SalesOrder, 'id'> = { ...savedOrder };
      delete (orderData as any).id;
      await addDocumentNonBlocking(ordersCollection, orderData);
    }
    
    if (leadForOrder) {
      const today = new Date().toISOString();
      const newHistoryEntry = { status: 'Aprovado' as const, date: today };
      await updateLead({ ...leadForOrder, status: 'Aprovado', statusHistory: [...(leadForOrder.statusHistory || []), newHistoryEntry] });
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!ordersCollection) return;
    await deleteDocumentNonBlocking(doc(ordersCollection, orderId));
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

  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<DocumentReference | undefined> => {
    if (!clientesCollection) return undefined;
    return addDocumentNonBlocking(clientesCollection, customerData);
  }
  
  const addLead = async (leadData: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => {
    if (!leadsCollection) return;
    const today = new Date().toISOString();
    const newLead: Omit<Lead, 'id'> = {
      ...leadData,
      status: "Lista de Leads",
      statusHistory: [{ status: "Lista de Leads", date: today }],
    };
    await addDocumentNonBlocking(leadsCollection, newLead);
  };
  
  const updateLead = async (updatedLead: Lead) => {
    if (!leadsCollection) return;
    await updateDocumentNonBlocking(doc(leadsCollection, updatedLead.id), updatedLead);
  };

  const deleteLead = async (leadId: string) => {
     if (!leadsCollection) return;
    await deleteDocumentNonBlocking(doc(leadsCollection, leadId));
  };

  const handleProposalSave = async (proposal: Omit<Proposal, 'id'> | Proposal) => {
    if (!proposalsCollection) return;
    let proposalId = 'id' in proposal ? proposal.id : undefined;

    if (proposalId) {
        await updateDocumentNonBlocking(doc(proposalsCollection, proposalId), proposal);
    } else {
        const newDocRef = await addDocumentNonBlocking(proposalsCollection, proposal);
        proposalId = newDocRef?.id;
    }
    
    const leadToUpdate = leads.find(l => l.id === proposal.leadId);
    if (leadToUpdate && !leadToUpdate.proposalId && proposalId) {
      await updateLead({ ...leadToUpdate, proposalId });
    }
    return proposalId;
  };

  const handleProposalSent = async (proposal: Omit<Proposal, 'id'>) => {
    const newProposalWithStatus = { ...proposal, status: 'Sent' as const };
    const proposalId = await handleProposalSave(newProposalWithStatus);
    
    const leadToUpdate = leads.find(l => l.id === proposal.leadId);
    if (leadToUpdate && proposalId) {
      const today = new Date().toISOString();
      const newHistoryEntry = { status: 'Negociação' as const, date: today };
      await updateLead({ 
        ...leadToUpdate, 
        status: 'Negociação', 
        statusHistory: [...(leadToUpdate.statusHistory || []), newHistoryEntry],
        proposalId: proposalId 
      });
    }
  };

  const deleteProposal = async (proposalId: string) => {
    if (!proposalsCollection) return;
    const proposalToDelete = proposals.find(p => p.id === proposalId);
    await deleteDocumentNonBlocking(doc(proposalsCollection, proposalId));
    
    if (proposalToDelete) {
        const leadToUpdate = leads.find(l => l.proposalId === proposalId);
        if (leadToUpdate) {
            const { proposalId: _, ...rest } = leadToUpdate;
            await updateLead(rest as Lead);
        }
    }
  };

  const saveShippingSettings = async (settings: ShippingSettings) => {
    if (!shippingSettingsDoc) return;
    await updateDocumentNonBlocking(shippingSettingsDoc, settings, true); // `true` for set with merge
    setShippingSettings(settings);
  };

  const isLoading = isUserLoading || !user || customersLoading || productsLoading || ordersLoading || leadsLoading || proposalsLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
        <p>Carregando seu ERP...</p>
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
                        <MenubarItem onClick={() => setActiveTab('shipping')}>Frete & Reativação</MenubarItem>
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
                    <MenubarTrigger onClick={() => setActiveTab('analytics')}>Análises</MenubarTrigger>
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
              onUpdateLead={updateLead}
              onDeleteLead={deleteLead}
              onAddLead={addLead}
              onOpenNewOrder={openNewOrderDialog}
              customers={customers}
              products={products}
              proposals={proposals}
              onProposalSave={handleProposalSave}
              onProposalSent={handleProposalSent}
              shippingSettings={shippingSettings}
              orders={orders}
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
            <div className="grid gap-6">
              <ShippingSettingsComponent
                settings={shippingSettings}
                onSave={saveShippingSettings}
              />
              <ReactivationSettings
                settings={shippingSettings}
                onSave={saveShippingSettings}
              />
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsDashboard
                orders={orders}
                products={products}
                customers={customers}
                leads={leads}
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
                onSuccess={handleOrderSave}
                initialData={editingOrder}
                leadData={leadForOrder}
                proposalData={proposalForOrder}
                customers={customers}
                onCustomerAdd={(customerData) => addCustomer(customerData)}
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
