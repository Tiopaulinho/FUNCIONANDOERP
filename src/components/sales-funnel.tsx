
"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { DollarSign, Building, User, Upload, FilePenLine, Trash2, StickyNote, Loader2, FileText, Phone, Send, Save, FileCheck2, ShoppingCart, Users, History, PlusCircle } from "lucide-react";
import type { Lead, LeadStatus, Customer, Product, Proposal, ShippingSettings } from "@/lib/schemas";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import LeadForm from "./lead-form";
import { Textarea } from "./ui/textarea";
import ProposalForm from "./proposal-form";
import { Input } from "./ui/input";
import NewLeadForm from "./new-lead-form";


const funnelStatuses: LeadStatus[] = ["Lista de Leads", "Contato", "Proposta", "Negociação", "Aprovado", "Reprovado"];

const LeadCard = ({ 
    lead, 
    onDragStart, 
    onClick, 
    proposals,
    onGenerateProposal,
}: { 
    lead: Lead;
    onDragStart: (e: React.DragEvent, leadId: string) => void;
    onClick: () => void;
    proposals: Proposal[];
    onGenerateProposal: (lead: Lead, isEditing: boolean) => void;
}) => {
  const proposal = proposals.find(p => p.id === lead.proposalId);

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateProposal(lead, false);
  };


  return (
    <Card 
      className="mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group/lead-card flex flex-col" 
      draggable={lead.status !== 'Aprovado'}
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
    >
      <CardHeader className="p-4 space-y-2 flex-grow">
        <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-bold flex items-start gap-2 flex-1 min-w-0">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                <span className="flex-1">{lead.name}</span>
            </CardTitle>
        </div>
        <CardDescription className="text-sm flex items-center gap-2 pt-1">
            <User className="h-4 w-4 text-muted-foreground" />
            {lead.contact}
        </CardDescription>
         {lead.phone && (
            <CardDescription className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead.phone}
            </CardDescription>
        )}
        {proposal && (
            <div className="flex items-center gap-2 pt-1">
                 <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {(proposal.total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Badge>
            </div>
        )}
      </CardHeader>
      
      {lead.status === 'Proposta' && !lead.proposalId && (
        <CardFooter className="p-4 pt-0">
            <Button size="sm" className="w-full" onClick={handleGenerateClick}>
                <FileText className="mr-2 h-4 w-4"/>
                Gerar Proposta
            </Button>
        </CardFooter>
      )}

      {lead.status === 'Aprovado' && (
         <CardFooter className="p-4 pt-0">
            <Button 
                className="w-full" 
                size="sm"
                onClick={(e) => { e.stopPropagation(); onClick() }}
            >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Nova Compra
            </Button>
        </CardFooter>
      )}
    </Card>
  );
};
  

const LeadDetailsModal = ({ 
  lead, 
  open, 
  onOpenChange,
  onEdit,
  onDelete,
  onGenerateProposal,
  onNewPurchase,
  proposals,
}: { 
  lead: Lead | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onGenerateProposal: (lead: Lead, isEditing: boolean) => void;
  onNewPurchase: (lead: Lead) => void;
  proposals: Proposal[];
}) => {
  if (!lead) return null;

  const proposal = proposals.find(p => p.id === lead.proposalId);

  const handleGenerateClick = () => {
    onGenerateProposal(lead, !!lead.proposalId);
  }

  const handleNewPurchaseClick = () => {
    onOpenChange(false);
    onNewPurchase(lead);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead: <span className="font-bold text-primary">{lead.name}</span></DialogTitle>
          <DialogDescription>
            Contato: {lead.contact}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-4">
             {lead.phone && (
                <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-semibold">{lead.phone}</p>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2">
                 <Badge variant="secondary">{lead.status}</Badge>
            </div>
            {proposal && (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Valor da Proposta</p>
                        <p className="font-semibold text-lg">
                            {(proposal.total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                    </div>
                </div>
            )}
            {lead.proposalNotes && (
                 <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><StickyNote className="h-4 w-4" /> Observações da Proposta</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">{lead.proposalNotes}</p>
                </div>
            )}
            {lead.statusHistory && lead.statusHistory.length > 0 && (
                 <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><History className="h-4 w-4" /> Histórico de Status</h4>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border space-y-2">
                        {lead.statusHistory.map((history, index) => (
                             <div key={index} className="flex justify-between items-center">
                                <span>{history.status}</span>
                                <span className="text-xs">{new Date(history.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <Separator />
        <div className="flex justify-end items-center gap-2">
            {lead.status === 'Aprovado' && (
              <Button onClick={handleNewPurchaseClick} variant="default">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Nova Compra
              </Button>
            )}
            {(lead.status === 'Proposta' || lead.status === 'Negociação' || lead.proposalId) && (
              <Button onClick={handleGenerateClick}>
                {lead.proposalId ? <FilePenLine className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                {lead.proposalId ? 'Ver/Editar Proposta' : 'Gerar Proposta'}
              </Button>
            )}
            <Button variant="outline" onClick={() => onEdit(lead)}>
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
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o lead.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(lead.id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const GroupedLeadsModal = ({
    group,
    open,
    onOpenChange,
    onViewLead,
    proposals,
  }: {
    group: Lead[] | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onViewLead: (lead: Lead) => void;
    proposals: Proposal[];
  }) => {
    if (!group) return null;
    
    const getProposalValue = (lead: Lead) => {
        const proposal = proposals.find(p => p.id === lead.proposalId);
        return proposal?.total ?? 0;
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Oportunidades Aprovadas: {group[0].name}</DialogTitle>
            <DialogDescription>
              Todas as oportunidades ganhas para este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {group.map(lead => (
              <Card key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewLead(lead)}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Oportunidade #{lead.id.slice(-4)}</CardTitle>
                    <p className="font-bold text-lg">{(getProposalValue(lead) ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                  {lead.proposalId && <CardDescription>Proposta: {lead.proposalId}</CardDescription>}
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
};


const ProposalNotesModal = ({
    lead,
    open,
    onOpenChange,
    onSave,
  }: {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (notes: string) => void;
  }) => {
    const [notes, setNotes] = React.useState(lead?.proposalNotes || "");
  
    React.useEffect(() => {
      if (lead) {
        setNotes(lead.proposalNotes || "");
      }
    }, [lead]);
  
    if (!lead) return null;

    const handleSave = () => {
        onSave(notes);
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5"/> Adicionar Observações à Proposta</DialogTitle>
            <DialogDescription>
              Adicione detalhes para a proposta do lead <span className="font-bold">{lead.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <Textarea 
                placeholder="Ex: Criar proposta para 5 canecas personalizadas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Salvar e Mover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };


interface SalesFunnelProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  onOpenNewOrder: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => void;
  customers: (Customer & { id: string })[];
  products: (Product & { id: string })[];
  onProductAdd: (newProduct: Product & { id: string }) => void;
  proposals: Proposal[];
  onProposalSave: (proposal: Proposal) => void;
  onProposalSent: (proposal: Proposal) => void;
  shippingSettings: ShippingSettings;
}

export default function SalesFunnel({ 
    leads, 
    setLeads, 
    onOpenNewOrder, 
    onUpdateLead,
    onDeleteLead,
    onAddLead,
    customers,
    products,
    onProductAdd,
    proposals,
    onProposalSave,
    onProposalSent,
    shippingSettings
}: SalesFunnelProps) {
  const { toast } = useToast();
  const [nameFilter, setNameFilter] = React.useState("");
  const [contactFilter, setContactFilter] = React.useState("");
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [editingLead, setEditingLead] = React.useState<Lead | null>(null);
  const [proposalLead, setProposalLead] = React.useState<Lead | null>(null);
  const [generateProposalLead, setGenerateProposalLead] = React.useState<Lead | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = React.useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = React.useState(false);
  const [isGenerateProposalModalOpen, setIsGenerateProposalModalOpen] = React.useState(false);
  const [isGroupedLeadsModalOpen, setIsGroupedLeadsModalOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<Lead[] | null>(null);

  const [savedProposal, setSavedProposal] = React.useState<Proposal | null>(null);
  const [isPostProposalActionsModalOpen, setIsPostProposalActionsModalOpen] = React.useState(false);

  const updateLeadWithHistory = (lead: Lead, newStatus: LeadStatus, updates?: Partial<Lead>) => {
    const today = new Date().toISOString();
    const newHistoryEntry = { status: newStatus, date: today };
    // Avoid duplicating the last status in history
    const lastHistory = lead.statusHistory?.[lead.statusHistory.length - 1];
    const newHistory = lastHistory?.status === newStatus ? lead.statusHistory : [...(lead.statusHistory || []), newHistoryEntry];
    
    onUpdateLead({ 
        ...lead, 
        ...updates,
        status: newStatus, 
        statusHistory: newHistory,
    });
  }

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const lead = leads.find(l => l.id === leadId);

    if (lead && lead.status !== newStatus) {
        if (newStatus === 'Proposta') {
            setProposalLead(lead);
            setIsProposalModalOpen(true);
            return;
        }

        if (newStatus === 'Negociação') {
            if (!lead.proposalId) {
                toast({
                    title: "Ação necessária",
                    description: "É preciso gerar uma proposta antes de mover para Negociação.",
                    variant: "destructive"
                });
                return;
            }
        }

        if (newStatus === 'Aprovado') {
            if (!lead.proposalId) {
                toast({
                    title: "Ação necessária",
                    description: "É preciso gerar e enviar uma proposta antes de aprovar o lead.",
                    variant: "destructive"
                });
                return;
            }
            // The status will be updated after the order is successfully saved.
            onOpenNewOrder(lead);
            return; 
        }
      
        updateLeadWithHistory(lead, newStatus);
    }
  };

  const handleSaveProposalNotes = (notes: string) => {
    if (proposalLead) {
        updateLeadWithHistory(proposalLead, 'Proposta', { proposalNotes: notes });
        toast({
            title: "Proposta Atualizada!",
            description: "As observações foram salvas e o lead movido.",
        });
    }
    setIsProposalModalOpen(false);
    setProposalLead(null);
  }

  const simulateImport = () => {
    const today = new Date().toISOString();
    const newLeads: Lead[] = [
      { id: `lead-${Date.now()}-7`, name: "TecnoCorp", contact: "Roberto", phone: "(11) 98877-6655", value: 22000, status: "Lista de Leads", statusHistory: [{ status: 'Lista de Leads', date: today }] },
      { id: `lead-${Date.now()}-8`, name: "InovaSoluções", contact: "Sandra", phone: "(21) 99988-7766", value: 33000, status: "Lista de Leads", statusHistory: [{ status: 'Lista de Leads', date: today }] },
    ];
    
    setLeads(prev => [...prev, ...newLeads]);

    toast({
      title: "Leads Importados!",
      description: "Novos leads foram adicionados ao seu funil."
    })
  }

  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };
  
  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (leadId: string) => {
    onDeleteLead(leadId);
    setIsDetailsModalOpen(false);
    toast({
      title: "Lead Excluído!",
      description: "O lead foi removido com sucesso.",
      variant: "destructive"
    });
  };
  
  const handleEditSuccess = (updatedLead: Lead) => {
    onUpdateLead(updatedLead);
    setIsEditModalOpen(false);
    setEditingLead(null);
    toast({
      title: "Sucesso!",
      description: "Lead atualizado com sucesso."
    });
  }

  const handleGenerateProposalClick = (lead: Lead, isEditing: boolean) => {
    if (isEditing) {
        const proposal = proposals.find(p => p.id === lead.proposalId);
        setSavedProposal(proposal || null);
    } else {
        setSavedProposal(null);
    }
    setGenerateProposalLead(lead);
    setIsDetailsModalOpen(false);
    setIsGenerateProposalModalOpen(true);
  }

  const handleProposalFormSuccess = (proposal: Proposal) => {
    onProposalSave(proposal);
    if(generateProposalLead) {
        const updatedLead = { ...generateProposalLead, proposalId: proposal.id };
        onUpdateLead(updatedLead);
        setGenerateProposalLead(updatedLead);
    }
    setSavedProposal(proposal);
    setIsGenerateProposalModalOpen(false);
    setIsPostProposalActionsModalOpen(true);
  }
  
  const handleFinalizeProposal = () => {
    if (savedProposal) {
      toast({
        title: "Proposta Salva!",
        description: `A proposta para ${generateProposalLead?.name} foi salva como rascunho.`
      });
    }
    resetProposalFlow();
  };
  
  const handleSendWhatsApp = () => {
    if (savedProposal && generateProposalLead) {
        onProposalSent(savedProposal);
        updateLeadWithHistory(generateProposalLead, 'Negociação', { proposalId: savedProposal.id });
        toast({
            title: "Proposta Enviada!",
            description: `Lead movido para Negociação.`
        });
    }
    resetProposalFlow();
  }

  const handleEditProposal = () => {
    setIsPostProposalActionsModalOpen(false);
    setIsGenerateProposalModalOpen(true);
  }

  const resetProposalFlow = () => {
    setIsPostProposalActionsModalOpen(false);
    setIsGenerateProposalModalOpen(false);
    setGenerateProposalLead(null);
    setSavedProposal(null);
  }

  const handleNewPurchase = (approvedLead: Lead) => {
    const today = new Date().toISOString();
    const newLead: Lead = {
      ...approvedLead,
      id: `lead-${Date.now()}`,
      status: 'Proposta',
      statusHistory: [{ status: 'Proposta', date: today }],
      proposalId: undefined, 
      proposalNotes: 'Nova compra para cliente existente.',
    };
    setLeads(prevLeads => [...prevLeads, newLead]);
    setGenerateProposalLead(newLead);
    setIsGenerateProposalModalOpen(true);

    toast({
      title: "Nova Oportunidade Criada!",
      description: `Inicie a proposta para a nova compra de ${approvedLead.name}.`,
    });
  };

  const handleViewGroup = (group: Lead[]) => {
    setSelectedGroup(group);
    setIsGroupedLeadsModalOpen(true);
  };

  const handleViewSingleLeadFromGroup = (lead: Lead) => {
    setIsGroupedLeadsModalOpen(false);
    handleCardClick(lead);
  };
  
  const handleNewLeadSuccess = (data: Omit<Lead, 'id' | 'status' | 'statusHistory'>) => {
    onAddLead(data);
    setIsNewLeadModalOpen(false);
    toast({
        title: "Lead Criado!",
        description: "O novo lead foi adicionado à coluna 'Lista de Leads'.",
    });
  };


  const filteredLeads = React.useMemo(() => {
    const lowercasedNameFilter = nameFilter.toLowerCase();
    const lowercasedContactFilter = contactFilter.toLowerCase();

    return leads.filter(lead => {
        const nameMatch = !lowercasedNameFilter || lead.name.toLowerCase().includes(lowercasedNameFilter);
        const contactMatch = !lowercasedContactFilter || lead.contact.toLowerCase().includes(lowercasedContactFilter);
        return nameMatch && contactMatch;
    });
}, [leads, nameFilter, contactFilter]);

  const leadsByStatus = React.useMemo(() => {
    const grouped: { [key in LeadStatus]?: Lead[] } = {};
    for (const status of funnelStatuses) {
        grouped[status] = [];
    }
    for (const lead of filteredLeads) {
      if (grouped[lead.status]) {
        grouped[lead.status]!.push(lead);
      }
    }
    return grouped;
  }, [filteredLeads]);
  

  return (
    <div className="w-full">
        <div className="mb-6 flex justify-between items-center gap-4 flex-wrap">
            <div>
                <h2 className="text-2xl font-bold">Funil de Vendas</h2>
                <p className="text-muted-foreground">Arraste e solte os leads para atualizar o status.</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => setIsNewLeadModalOpen(true)} >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Lead
                </Button>
                <Button onClick={simulateImport} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Leads (Simulação)
                </Button>
            </div>
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input
                placeholder="Filtrar por nome da empresa..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
            />
            <Input
                placeholder="Filtrar por nome do contato..."
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {funnelStatuses.map((status) => (
            <div 
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg capitalize">{status}</h3>
                    <Badge variant="secondary" className="rounded-full">
                        {leadsByStatus[status]?.length || 0}
                    </Badge>
                  </div>
              </div>
              <Card className="bg-muted/30 border-dashed flex-grow">
                  <CardContent className="p-4 min-h-[200px]">
                   {(leadsByStatus[status] || []).map((lead) => (
                      <LeadCard
                          key={lead.id}
                          lead={lead}
                          onDragStart={handleDragStart}
                          onClick={status === 'Aprovado' ? () => handleNewPurchase(lead) : () => handleCardClick(lead)}
                          proposals={proposals}
                          onGenerateProposal={handleGenerateProposalClick}
                      />
                  ))}

                  {(leadsByStatus[status]?.length === 0) && (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          {filteredLeads.length > 0 && leads.length > filteredLeads.length ? 'Nenhum lead encontrado com este filtro' : 'Arraste um lead aqui'}
                      </div>
                  )}
                  </CardContent>
              </Card>
            </div>
        ))}
        </div>
        
        <LeadDetailsModal 
          lead={selectedLead}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onGenerateProposal={handleGenerateProposalClick}
          onNewPurchase={handleNewPurchase}
          proposals={proposals}
        />

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Lead</DialogTitle>
              </DialogHeader>
              {editingLead && (
                <LeadForm
                    initialData={editingLead}
                    onSuccess={handleEditSuccess}
                    shippingSettings={shippingSettings}
                />
              )}
            </DialogContent>
        </Dialog>
        
        <Dialog open={isNewLeadModalOpen} onOpenChange={setIsNewLeadModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Lead</DialogTitle>
                <DialogDescription>Preencha os dados abaixo para adicionar um novo lead ao funil.</DialogDescription>
              </DialogHeader>
              <NewLeadForm
                leads={leads}
                customers={customers}
                onSuccess={handleNewLeadSuccess}
              />
            </DialogContent>
        </Dialog>

        <ProposalNotesModal 
            lead={proposalLead}
            open={isProposalModalOpen}
            onOpenChange={setIsProposalModalOpen}
            onSave={(notes) => handleSaveProposalNotes(notes)}
        />

        <Dialog open={isGenerateProposalModalOpen} onOpenChange={(open) => { if (!open) resetProposalFlow(); else setIsGenerateProposalModalOpen(true);}}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{savedProposal ? "Editar Proposta" : "Gerar Proposta"}</DialogTitle>
                    <DialogDescription>
                        Crie ou edite uma proposta comercial para o lead <span className="font-semibold text-foreground">{generateProposalLead?.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                {generateProposalLead && (
                    <ProposalForm 
                        lead={generateProposalLead}
                        products={products}
                        onProductAdd={onProductAdd}
                        onSuccess={handleProposalFormSuccess}
                        initialData={savedProposal}
                        customers={customers}
                        shippingSettings={shippingSettings}
                        onUpdateLead={onUpdateLead}
                    />
                )}
            </DialogContent>
        </Dialog>

        <Dialog open={isPostProposalActionsModalOpen} onOpenChange={(open) => { if (!open) resetProposalFlow() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Proposta Pronta</DialogTitle>
                    <DialogDescription>
                        A proposta para <span className="font-semibold text-foreground">{generateProposalLead?.name}</span> foi salva. O que você gostaria de fazer?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-2">
                    <Button onClick={handleFinalizeProposal}>
                        <Save className="mr-2 h-4 w-4" /> Apenas Salvar
                    </Button>
                    <Button onClick={handleSendWhatsApp} variant="secondary">
                        <Send className="mr-2 h-4 w-4" /> Salvar e Enviar
                    </Button>
                    <Button onClick={handleEditProposal} variant="outline" className="col-span-2">
                        <FilePenLine className="mr-2 h-4 w-4" /> Editar Proposta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <GroupedLeadsModal
            group={selectedGroup}
            open={isGroupedLeadsModalOpen}
            onOpenChange={setIsGroupedLeadsModalOpen}
            onViewLead={handleViewSingleLeadFromGroup}
            proposals={proposals}
        />

    </div>
  );
}
