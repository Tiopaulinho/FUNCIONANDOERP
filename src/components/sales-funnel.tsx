
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
import { DollarSign, Building, User, Upload, FilePenLine, Trash2, StickyNote, Loader2, FileText, Phone, Send, Save, FileCheck2, ShoppingCart, Users, History } from "lucide-react";
import type { Lead, LeadStatus, Customer, Product, Proposal } from "@/lib/schemas";
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


const funnelStatuses: LeadStatus[] = ["Lista de Leads", "Contato", "Proposta", "Negociação", "Aprovado", "Reprovado"];

const LeadCard = ({ lead, onDragStart, onClick, proposals }: { lead: Lead, onDragStart: (e: React.DragEvent, leadId: string) => void, onClick: () => void, proposals: Proposal[] }) => {
  const proposal = proposals.find(p => p.id === lead.proposalId);

  return (
    <Card 
      className="mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group/lead-card" 
      draggable={lead.status !== 'Aprovado'}
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
    >
      <CardHeader className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-bold flex items-center gap-2 flex-1 min-w-0">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{lead.name}</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
                {lead.proposalNotes && !lead.proposalId && (
                    <StickyNote className="h-4 w-4 text-amber-500" title="Existem observações para esta proposta" />
                )}
                {proposal && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {proposal.total?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </Badge>
                )}
            </div>
        </div>
        <CardDescription className="text-sm flex items-center gap-2 pt-1">
            <User className="h-4 w-4 text-muted-foreground" />
            {lead.contact}
        </CardDescription>
         {lead.phone && (
            <CardDescription className="text-sm flex items-center gap-2 pt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead.phone}
            </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
};


const GroupedLeadCard = ({ group, onNewPurchase, onView }: { group: Lead[], onNewPurchase: (lead: Lead) => void, onView: (group: Lead[]) => void }) => {
    const representativeLead = group[0];
  
    const handleNewPurchaseClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onNewPurchase(representativeLead);
    };
  
    return (
      <Card 
        className="mb-4 cursor-pointer hover:shadow-md transition-shadow group/lead-card"
        onClick={() => onView(group)}
      >
        <CardHeader className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              {representativeLead.name}
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {group.length}
            </Badge>
          </div>
          <CardDescription className="text-sm flex items-center gap-2 pt-1">
            <User className="h-4 w-4 text-muted-foreground" />
            {representativeLead.contact}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Button 
            className="w-full opacity-0 group-hover/lead-card:opacity-100 transition-opacity" 
            size="sm"
            onClick={handleNewPurchaseClick}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nova Compra
          </Button>
        </CardContent>
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
                            {proposal.total?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
      if (lead.proposalId) {
        const proposal = proposals.find(p => p.id === lead.proposalId);
        if (proposal && proposal.total) {
          return proposal.total;
        }
      }
      return lead.value;
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
                    <p className="font-bold text-lg">{getProposalValue(lead)?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
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
  customers: (Customer & { id: string })[];
  products: (Product & { id: string })[];
  onProductAdd: (newProduct: Product & { id: string }) => void;
  proposals: Proposal[];
  onProposalSave: (proposal: Proposal) => void;
  onProposalSent: (proposal: Proposal) => void;
}

export default function SalesFunnel({ 
    leads, 
    setLeads, 
    onOpenNewOrder, 
    onUpdateLead,
    onDeleteLead,
    products,
    onProductAdd,
    proposals,
    onProposalSave,
    onProposalSent
}: SalesFunnelProps) {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [editingLead, setEditingLead] = React.useState<Lead | null>(null);
  const [proposalLead, setProposalLead] = React.useState<Lead | null>(null);
  const [generateProposalLead, setGenerateProposalLead] = React.useState<Lead | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
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
        const leadWithProposal = { ...generateProposalLead, proposalId: savedProposal.id };
        onProposalSent(savedProposal);
        updateLeadWithHistory(leadWithProposal, 'Negociação');
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


  const leadsByStatus = React.useMemo(() => {
    const grouped: { [key in LeadStatus]?: Lead[] } = {};
    for (const status of funnelStatuses) {
        grouped[status] = [];
    }
    for (const lead of leads) {
      if (grouped[lead.status]) {
        grouped[lead.status]!.push(lead);
      }
    }
    return grouped;
  }, [leads]);
  
  const approvedLeadsGrouped = React.useMemo(() => {
    const approved = leadsByStatus['Aprovado'] || [];
    return approved.reduce((acc, lead) => {
      const key = lead.customerId || lead.name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);
  }, [leadsByStatus]);

  return (
    <div className="w-full">
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold">Funil de Vendas</h2>
                <p className="text-muted-foreground">Arraste e solte os leads para atualizar o status.</p>
            </div>
            <Button onClick={simulateImport} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar Leads (Simulação)
            </Button>
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
                        {status === 'Aprovado' ? Object.keys(approvedLeadsGrouped).length : leadsByStatus[status]?.length || 0}
                    </Badge>
                  </div>
              </div>
              <Card className="bg-muted/30 border-dashed flex-grow">
                  <CardContent className="p-4 min-h-[200px]">
                  {status === 'Aprovado' ? (
                     Object.values(approvedLeadsGrouped).map((group, index) => (
                        <GroupedLeadCard 
                          key={index} 
                          group={group}
                          onNewPurchase={handleNewPurchase}
                          onView={handleViewGroup}
                        />
                      ))
                  ) : (
                    leadsByStatus[status]?.map((lead) => (
                        <LeadCard 
                          key={lead.id} 
                          lead={lead} 
                          onDragStart={handleDragStart}
                          onClick={() => handleCardClick(lead)}
                          proposals={proposals}
                        />
                    ))
                  )}

                  {((status === 'Aprovado' && Object.keys(approvedLeadsGrouped).length === 0) ||
                    (status !== 'Aprovado' && leadsByStatus[status]?.length === 0)) && (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          Arraste um lead aqui
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Lead</DialogTitle>
              </DialogHeader>
              <LeadForm
                initialData={editingLead}
                onSuccess={handleEditSuccess}
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

    
