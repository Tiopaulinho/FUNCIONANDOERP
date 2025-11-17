
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
import { DollarSign, Building, User, Upload, FilePenLine, Trash2, StickyNote, Loader2, FileText, Phone, Wand2 } from "lucide-react";
import type { Lead, LeadStatus, Customer } from "@/lib/schemas";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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


const funnelStatuses: LeadStatus[] = ["Lista de Leads", "Contato", "Proposta", "Negociação", "Criar Pedido (Aprovado)", "Reprovado"];

const LeadCard = ({ lead, onDragStart, onClick }: { lead: Lead, onDragStart: (e: React.DragEvent, leadId: string) => void, onClick: () => void }) => {
  return (
    <Card 
      className="mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow" 
      draggable="true"
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
    >
      <CardHeader className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                {lead.name}
            </CardTitle>
            {lead.proposalNotes && (
                 <StickyNote className="h-4 w-4 text-amber-500" />
            )}
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

const GenerateProposalModal = ({
    lead,
    open,
    onOpenChange,
  }: {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [proposalText, setProposalText] = React.useState("");

    React.useEffect(() => {
        if(open) {
            setProposalText("");
            setIsLoading(false);
        }
    }, [open]);

    if (!lead) return null;
  
    const handleGenerate = async () => {
        setIsLoading(true);
        // Simulação de chamada de IA
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const generatedText = `
Prezado(a) ${lead.contact},

Agradecemos a oportunidade de apresentar esta proposta para ${lead.name}.

Com base em nossa conversa, entendemos que vocês estão buscando: ${lead.proposalNotes || '[Detalhes da necessidade do cliente]'}.

Nossa solução oferece [Benefício 1], [Benefício 2] e [Benefício 3]. O investimento para este projeto é de ${lead.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.

Estamos à disposição para discutir os próximos passos.

Atenciosamente,
Equipe Cliente Fácil
        `.trim();
        
        setProposalText(generatedText);
        setIsLoading(false);
        toast({
            title: "Proposta Gerada!",
            description: "A proposta foi criada com base nas informações do lead.",
        });
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Gerar Proposta para {lead.name}</DialogTitle>
            <DialogDescription>
              Use as informações do lead para gerar uma proposta comercial.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
                <Button onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Gerar com IA
                        </>
                    )}
                </Button>
            </div>

            {proposalText && (
                <div className="space-y-2 pt-4">
                    <h3 className="font-semibold">Resultado da Proposta:</h3>
                    <Textarea 
                        value={proposalText}
                        readOnly
                        rows={12}
                        className="bg-muted/50"
                    />
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

const LeadDetailsModal = ({ 
  lead, 
  open, 
  onOpenChange,
  onEdit,
  onDelete,
  onGenerateProposal
}: { 
  lead: Lead | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onGenerateProposal: (lead: Lead) => void;
}) => {
  if (!lead) return null;

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
            <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="font-bold text-lg">{lead.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>
            </div>
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
            {lead.proposalNotes && (
                 <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><StickyNote className="h-4 w-4" /> Observações da Proposta</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">{lead.proposalNotes}</p>
                </div>
            )}
        </div>
        <Separator />
        <div className="flex justify-end items-center gap-2">
            {lead.status === 'Proposta' && (
              <Button onClick={() => onGenerateProposal(lead)}>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Proposta
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
  onRegisterCustomer: (customerData: Omit<Customer, 'id'>) => Customer & { id: string };
  customers: (Customer & { id: string })[];
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export default function SalesFunnel({ 
    leads, 
    setLeads, 
    onOpenNewOrder, 
    onUpdateLead,
    onDeleteLead,
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

    if (lead) {
        if (newStatus === 'Proposta' && lead.status !== 'Proposta') {
            setProposalLead(lead);
            setIsProposalModalOpen(true);
            return;
        }

        if (newStatus === 'Criar Pedido (Aprovado)') {
            onOpenNewOrder(lead);
        }
      
        setLeads(prevLeads => 
            prevLeads.map(l => 
            l.id === leadId ? { ...l, status: newStatus } : l
            )
        );
    }
  };

  const handleSaveProposalNotes = (notes: string) => {
    if (proposalLead) {
        onUpdateLead({ ...proposalLead, status: 'Proposta', proposalNotes: notes });
        toast({
            title: "Proposta Atualizada!",
            description: "As observações foram salvas e o lead movido.",
        });
    }
    setIsProposalModalOpen(false);
    setProposalLead(null);
  }

  const simulateImport = () => {
    const newLeads: Lead[] = [
      { id: `lead-${Date.now()}-7`, name: "TecnoCorp", contact: "Roberto", phone: "(11) 98877-6655", value: 22000, status: "Lista de Leads" },
      { id: `lead-${Date.now()}-8`, name: "InovaSoluções", contact: "Sandra", phone: "(21) 99988-7766", value: 33000, status: "Lista de Leads" },
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
    setIsDetailsModalOpen(false); // Close details modal
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

  const handleGenerateProposalClick = (lead: Lead) => {
    setGenerateProposalLead(lead);
    setIsDetailsModalOpen(false);
    setIsGenerateProposalModalOpen(true);
  }

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
                    <Badge variant="secondary" className="rounded-full">{leadsByStatus[status]?.length || 0}</Badge>
                  </div>
              </div>
              <Card className="bg-muted/30 border-dashed flex-grow">
                  <CardContent className="p-4 min-h-[200px]">
                  {leadsByStatus[status]?.map((lead) => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onDragStart={handleDragStart}
                        onClick={() => handleCardClick(lead)}
                      />
                  ))}
                  {leadsByStatus[status]?.length === 0 && (
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
            onSave={handleSaveProposalNotes}
        />

        <GenerateProposalModal
            lead={generateProposalLead}
            open={isGenerateProposalModalOpen}
            onOpenChange={setIsGenerateProposalModalOpen}
        />

    </div>
  );
}
