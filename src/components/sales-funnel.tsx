
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
import { DollarSign, Building, User, Upload, FilePenLine, Trash2, StickyNote, Loader2, FileText, Phone, Send, Save, FileCheck2, ShoppingCart, Users, History, PlusCircle, RefreshCw, Mail, MessageCircle, PhoneCall, Play, Square, Ban, Package } from "lucide-react";
import type { Lead, LeadStatus, Customer, Product, Proposal, ShippingSettings, LeadActivity, LeadHistoryEntry, SalesOrder } from "@/lib/schemas";
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
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Label } from "./ui/label";


const funnelStatuses: LeadStatus[] = ["Lista de Leads", "Contato", "Proposta", "Negociação", "Aprovado", "Reativar", "Reprovado"];

const statusColors: Record<LeadStatus, string> = {
    "Lista de Leads": "bg-gray-400",
    "Contato": "bg-blue-500",
    "Proposta": "bg-purple-500",
    "Negociação": "bg-yellow-500",
    "Aprovado": "bg-green-500",
    "Reativar": "bg-orange-500",
    "Reprovado": "bg-red-500",
};


const LeadCard = ({ 
    lead, 
    onDragStart, 
    onClick, 
    proposals,
    onGenerateProposal,
    onReactivate,
    status,
    onOpenContactModal,
    onApprove,
    onReject,
    onDismissReactivation,
}: { 
    lead: Lead;
    onDragStart: (e: React.DragEvent, leadId: string) => void;
    onClick: () => void;
    proposals: Proposal[];
    onGenerateProposal: (lead: Lead, isEditing: boolean) => void;
    onReactivate: (lead: Lead) => void;
    status: LeadStatus;
    onOpenContactModal: (lead: Lead) => void;
    onApprove: (lead: Lead) => void;
    onReject: (lead: Lead) => void;
    onDismissReactivation: (leadId: string) => void;
}) => {
  const proposal = proposals.find(p => p.id === lead.proposalId);

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateProposal(lead, false);
  };
  
  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenContactModal(lead);
  };


  const handleReactivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReactivate(lead);
  };

  const handleDismissReactivationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismissReactivation(lead.id);
  }
  
  const handleApproveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApprove(lead);
  };

  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject(lead);
  };


  return (
    <Card 
      className="mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group/lead-card flex flex-col relative overflow-hidden" 
      draggable={lead.status !== 'Aprovado' && lead.status !== 'Reativar'}
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColors[lead.status]}`}></div>
      <CardHeader className="p-4 space-y-2 flex-grow pl-6">
        <div className="flex flex-col items-start gap-2">
            {lead.displayId && <Badge variant="outline" className="font-mono text-xs">{lead.displayId}</Badge>}
            <CardTitle className="text-base font-bold flex items-start gap-2 flex-1 min-w-0">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                <span className="flex-1">{lead.name}</span>
            </CardTitle>
        </div>
        <CardDescription className="text-sm flex items-center gap-2 pt-1">
            <User className="h-4 w-4 text-muted-foreground" />
            {lead.contact}
        </CardDescription>
         {lead.phone && status === 'Contato' && (
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
      
      {(lead.status === 'Proposta' && !lead.proposalId) || status === 'Reativar' || status === 'Contato' || status === 'Negociação' ? (
        <CardFooter className="p-2 pl-6 flex justify-end">
            {lead.status === 'Contato' && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleContactClick}>
                                <Send className="h-4 w-4"/>
                                <span className="sr-only">Registrar Contato</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Registrar Contato</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {lead.status === 'Proposta' && !lead.proposalId && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleGenerateClick}>
                                <FileText className="h-4 w-4"/>
                                <span className="sr-only">Gerar Proposta</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Gerar Proposta</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {status === 'Negociação' && (
                <TooltipProvider>
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={handleApproveClick}>
                                    <FileCheck2 className="h-4 w-4"/>
                                    <span className="sr-only">Aprovar Proposta</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Aprovar Proposta</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={handleRejectClick}>
                                    <Ban className="h-4 w-4"/>
                                    <span className="sr-only">Reprovar Proposta</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reprovar Proposta</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            )}

            {status === 'Reativar' && (
                <TooltipProvider>
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleReactivateClick}>
                                    <RefreshCw className="h-4 w-4"/>
                                    <span className="sr-only">Reativar Cliente</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reativar Cliente</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDismissReactivationClick}>
                                    <Trash2 className="h-4 w-4"/>
                                    <span className="sr-only">Dispensar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dispensar Reativação</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            )}
        </CardFooter>
      ) : null}
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
  onOpenContactModal,
  orders,
}: { 
  lead: Lead | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onGenerateProposal: (lead: Lead, isEditing: boolean) => void;
  onNewPurchase: (lead: Lead) => void;
  proposals: Proposal[];
  onOpenContactModal: (lead: Lead) => void;
  orders: SalesOrder[];
}) => {
  if (!lead) return null;

  const proposal = proposals.find(p => p.id === lead.proposalId);
  const order = orders.find(o => o.leadId === lead.id);

  const handleGenerateClick = () => {
    onGenerateProposal(lead, !!lead.proposalId);
  }

  const handleNewPurchaseClick = () => {
    onOpenChange(false);
    onNewPurchase(lead);
  };
  
  const handleOpenContactModalClick = () => {
    onOpenChange(false);
    onOpenContactModal(lead);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Lead: <span className="font-bold text-primary">{lead.name}</span></DialogTitle>
            <Badge variant="outline" className="font-mono text-xs">{lead.displayId || lead.id}</Badge>
          </div>
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
            {order && lead.status === 'Aprovado' && (
              <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Pedido Gerado</h4>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border space-y-1">
                      <div className="flex justify-between items-center">
                          <span>ID do Pedido:</span>
                          <span className="font-mono text-foreground">{order.id}</span>
                      </div>
                       <div className="flex justify-between items-center">
                          <span>Status do Pedido:</span>
                          <span className="font-semibold text-foreground">{order.status}</span>
                      </div>
                  </div>
              </div>
            )}
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
                    <h4 className="text-sm font-semibold flex items-center gap-2"><History className="h-4 w-4" /> Histórico</h4>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border space-y-2 max-h-40 overflow-y-auto">
                        {[...lead.statusHistory].reverse().map((history, index) => (
                             <div key={index} className="flex justify-between items-center">
                                <span>{history.status} {history.details ? `(${history.details})` : ''}</span>
                                <span className="text-xs">{new Date(history.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <Separator />
        <div className="flex flex-wrap justify-end items-center gap-2">
            {lead.status === 'Contato' && (
                <Button onClick={handleOpenContactModalClick} variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Registrar Contato
                </Button>
            )}
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
    title,
  }: {
    group: Lead[] | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onViewLead: (lead: Lead) => void;
    proposals: Proposal[];
    title: string;
  }) => {
    if (!group) return null;
    
    const getProposalValue = (lead: Lead) => {
        const proposal = proposals.find(p => p.id === lead.proposalId);
        return proposal?.total ?? lead.value ?? 0;
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}: {group[0].name}</DialogTitle>
            <DialogDescription>
              Todas as oportunidades para este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {group.map(lead => (
              <Card key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewLead(lead)}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                           Oportunidade 
                           <Badge variant="secondary" className="font-mono">{lead.displayId || lead.id}</Badge>
                        </CardTitle>
                        {lead.proposalId && <CardDescription>Proposta: {lead.proposalId}</CardDescription>}
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">{(getProposalValue(lead)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                        <Badge variant="secondary">{lead.status}</Badge>
                    </div>
                  </div>
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
  
const ContactModal = ({
    lead,
    open,
    onOpenChange,
    onRegisterActivity,
    onOpenCallModal,
}: {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRegisterActivity: (activity: LeadActivity, message?: string) => void;
    onOpenCallModal: (lead: Lead) => void;
}) => {
    const [selectedMethod, setSelectedMethod] = React.useState<"whatsapp" | "email" | null>(null);
    const [message, setMessage] = React.useState("");

    const isReactivation = lead?.displayId?.startsWith("RE-");

    const templates = {
        whatsapp: isReactivation
            ? `Olá ${lead?.contact || '[Nome do Contato]'}, tudo bem?\n\nNotei que faz um tempo desde nossa última conversa e gostaria de apresentar algumas novidades e ofertas especiais que preparamos para você.\n\nPodemos conversar?`
            : `Olá ${lead?.contact || '[Nome do Contato]'}, tudo bem?\n\nMe chamo [Seu Nome] e falo em nome da [Sua Empresa].\n\nGostaria de apresentar nossos produtos e entender melhor como podemos te ajudar.\n\nPodemos conversar?`,
        email: isReactivation
            ? `Prezado(a) ${lead?.contact || '[Nome do Contato]'},\n\nEspero que esteja tudo bem.\n\nFaz um tempo que não nos falamos e estamos com saudades! Temos novos produtos e condições especiais que acreditamos que você vai adorar.\n\nGostaria de dar uma olhada nas novidades?\n\nAtenciosamente,\n[Seu Nome]`
            : `Prezado(a) ${lead?.contact || '[Nome do Contato]'},\n\nEspero que esteja tudo bem.\n\nMeu nome é [Seu Nome] e represento a [Sua Empresa]. Vi que você demonstrou interesse em nossos produtos e gostaria de me colocar à sua disposição para uma conversa, sem compromisso.\n\nFico no aguardo de um retorno.\n\nAtenciosamente,\n[Seu Nome]`
    };

    React.useEffect(() => {
        if (open) {
            setSelectedMethod(null);
            setMessage("");
        }
    }, [open]);

    if (!lead) return null;

    const handleMethodSelect = (method: "whatsapp" | "email") => {
        setSelectedMethod(method);
        setMessage(templates[method]);
    };

    const handleRegisterCall = () => {
        onOpenCallModal(lead);
    };

    const handleSend = () => {
        if (selectedMethod) {
            console.log(`Simulando envio de ${selectedMethod} para: ${selectedMethod === 'email' ? lead.email : lead.phone}`);
            console.log("Mensagem:", message);
            onRegisterActivity(selectedMethod === 'whatsapp' ? 'WhatsApp' : 'Email', message);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" /> Registrar Contato com {lead.contact}
                    </DialogTitle>
                    <DialogDescription>
                        Selecione o método de contato e registre a atividade.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-3 gap-2 pt-4">
                     <Button onClick={handleRegisterCall} variant={selectedMethod === null ? 'outline' : 'outline'} className="w-full">
                        <PhoneCall className="mr-2 h-4 w-4" /> Ligação
                    </Button>
                    <Button onClick={() => handleMethodSelect('whatsapp')} variant={selectedMethod === 'whatsapp' ? 'default' : 'outline'} className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                     <Button onClick={() => handleMethodSelect('email')} variant={selectedMethod === 'email' ? 'default' : 'outline'} className="w-full">
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </Button>
                </div>
                
                {selectedMethod && (
                    <div className="py-4 space-y-4">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="text-sm"
                            placeholder="Mensagem..."
                        />
                         <Button onClick={handleSend} className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            Enviar e Registrar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

const CallModal = ({
  lead,
  open,
  onOpenChange,
  onEndCall,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEndCall: (notes: string, duration: number, nextStatus: "Proposta" | "Reprovado") => void;
}) => {
  const [timer, setTimer] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (open) {
      // Reset state on open
      setTimer(0);
      setIsActive(false);
      setNotes("");
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  const handleStart = () => {
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  const handleStop = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleFinish = (nextStatus: "Proposta" | "Reprovado") => {
    handleStop();
    onEndCall(notes, timer, nextStatus);
  }

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">Ligação para {lead.contact}</DialogTitle>
            <DialogDescription className="text-4xl font-bold text-primary tracking-wider py-4">
                {lead.phone || "Telefone não cadastrado"}
            </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="text-6xl font-mono text-foreground">{formatTime(timer)}</div>
            <div className="flex gap-4">
                <Button onClick={handleStart} disabled={isActive} size="lg">
                    <Play className="mr-2"/> Iniciar
                </Button>
                <Button onClick={handleStop} disabled={!isActive} size="lg" variant="destructive">
                    <Square className="mr-2"/> Encerrar
                </Button>
            </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="call-notes">Anotações da Chamada</Label>
            <Textarea 
                id="call-notes"
                placeholder="Detalhes da conversa, próximos passos, etc."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isActive && timer === 0}
            />
        </div>

        <DialogFooter className="grid grid-cols-2 gap-4 pt-4">
            <Button onClick={() => handleFinish("Reprovado")} disabled={isActive || timer === 0} variant="outline">
                <Ban className="mr-2"/> Ir para Reprovado
            </Button>
            <Button onClick={() => handleFinish("Proposta")} disabled={isActive || timer === 0}>
                <FileText className="mr-2"/> Ir para Proposta
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ImportModal = ({
    open,
    onOpenChange,
    onImport,
    sampleFileName,
    expectedHeaders
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (data: any[]) => void;
    sampleFileName: string;
    expectedHeaders: string[];
}) => {
    const { toast } = useToast();
    const [file, setFile] = React.useState<File | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Nenhum arquivo selecionado",
                description: "Por favor, selecione um arquivo CSV para importar.",
            });
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/);
            const headers = lines[0].split(';').map(h => h.trim());
            
            const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
                 toast({
                    variant: "destructive",
                    title: "Cabeçalhos Incorretos",
                    description: `O arquivo não contém as colunas esperadas: ${missingHeaders.join(', ')}.`,
                });
                setIsProcessing(false);
                return;
            }

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i]) continue;
                const values = lines[i].split(';');
                const row: { [key: string]: any } = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = values[j];
                }
                data.push(row);
            }
            onImport(data);
            setIsProcessing(false);
            onOpenChange(false);
        };
        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: "Erro ao ler arquivo",
                description: "Não foi possível processar o arquivo selecionado.",
            });
            setIsProcessing(false);
        }
        reader.readAsText(file, 'UTF-8');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Importar Dados via CSV</DialogTitle>
                    <DialogDescription>
                        Baixe o arquivo de exemplo, preencha com seus dados e faça o upload.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <a href={`/${sampleFileName}`} download>
                        <Button variant="outline" className="w-full">
                            Baixar Arquivo de Exemplo
                        </Button>
                    </a>
                    <div className="space-y-2">
                        <Label htmlFor="csv-file">Arquivo CSV</Label>
                        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleImport} disabled={!file || isProcessing}>
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : "Processar Importação"}
                    </Button>
                </DialogFooter>
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
  onAddLead: (lead: Omit<Lead, 'id' | 'status' | 'statusHistory' | 'displayId'> & { displayId?: string }) => void;
  customers: (Customer & { id: string })[];
  products: (Product & { id: string })[];
  onProductAdd: (newProduct: Product & { id: string }) => void;
  proposals: Proposal[];
  onProposalSave: (proposal: Proposal) => void;
  onProposalSent: (proposal: Proposal) => void;
  shippingSettings: ShippingSettings;
  orders: SalesOrder[];
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
    shippingSettings,
    orders,
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
  const [groupedModalTitle, setGroupedModalTitle] = React.useState("");
  const [contactLead, setContactLead] = React.useState<Lead | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [callLead, setCallLead] = React.useState<Lead | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);


  const [savedProposal, setSavedProposal] = React.useState<Proposal | null>(null);
  const [isPostProposalActionsModalOpen, setIsPostProposalActionsModalOpen] = React.useState(false);
  
  const generateDisplayId = (existingLeads: Lead[]): string => {
    const leadNumbers = existingLeads
      .map(l => l.displayId)
      .filter((id): id is string => !!id && id.startsWith("LD-"))
      .map(id => parseInt(id.split('-')[1], 10))
      .filter(num => !isNaN(num));
    
    const maxId = leadNumbers.length > 0 ? Math.max(...leadNumbers) : 0;
    const newId = maxId + 1;
    return `LD-${newId.toString().padStart(5, '0')}`;
  };
  
  const generateReactivationDisplayId = (existingLeads: Lead[]): string => {
    const leadNumbers = existingLeads
      .map(l => l.displayId)
      .filter((id): id is string => !!id && id.startsWith("RE-"))
      .map(id => parseInt(id.split('-')[1], 10))
      .filter(num => !isNaN(num));
    
    const maxId = leadNumbers.length > 0 ? Math.max(...leadNumbers) : 0;
    const newId = maxId + 1;
    return `RE-${newId.toString().padStart(5, '0')}`;
  };


 React.useEffect(() => {
    const checkReactivation = () => {
        const now = new Date();
        const customerLastApproval: { [customerId: string]: string } = {};

        // Find the latest approval date for each customer based on their approved leads
        leads.forEach(lead => {
            if (lead.status === 'Aprovado' && lead.customerId) {
                const approvedEntry = [...(lead.statusHistory || [])].reverse().find(h => h.status === 'Aprovado');
                if (approvedEntry) {
                    if (!customerLastApproval[lead.customerId] || new Date(approvedEntry.date) > new Date(customerLastApproval[lead.customerId])) {
                        customerLastApproval[lead.customerId] = approvedEntry.date;
                    }
                }
            }
        });

        const existingReactivationLeadIds = new Set(leads.filter(l => l.status === 'Reativar').map(l => l.id));

        Object.keys(customerLastApproval).forEach(customerId => {
            const originalLead = leads.find(l => l.customerId === customerId); // Find any lead for this customer to get their data
            if (!originalLead) return;

            // Check if there is already a reactivation lead for this customer
            const hasReactivationLead = leads.some(l => l.status === 'Reativar' && l.customerId === customerId);

            if (hasReactivationLead) {
                return;
            }

            const lastApprovalDate = new Date(customerLastApproval[customerId]);
            const diffTime = Math.abs(now.getTime() - lastApprovalDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > shippingSettings.reactivationPeriodDays) {
                const today = new Date().toISOString();
                const reactivationLead: Lead = {
                    ...originalLead, // Copy data from an original lead
                    id: `reactivate-${customerId}-${Date.now()}-${Math.random()}`,
                    displayId: undefined, // No displayId for reactivation suggestions
                    status: 'Reativar',
                    statusHistory: [{ status: 'Reativar', date: today }],
                    proposalId: undefined, 
                    proposalNotes: 'Oportunidade de reativação.',
                    value: 0,
                };
                
                if (!existingReactivationLeadIds.has(reactivationLead.id)) {
                    setLeads(prevLeads => [...prevLeads, reactivationLead]);
                    existingReactivationLeadIds.add(reactivationLead.id);
                }
            }
        });
    };

    const interval = setInterval(checkReactivation, 1000 * 60 * 60); // Check every hour
    checkReactivation(); 

    return () => clearInterval(interval);
  }, [leads, shippingSettings.reactivationPeriodDays, setLeads]);

  const updateLeadWithHistory = (lead: Lead, newStatus: LeadStatus, updates?: Partial<Lead>) => {
    const today = new Date().toISOString();
    const newHistoryEntry = { status: newStatus, date: today };
    // Avoid duplicating the last status in history
    const lastHistory = lead.statusHistory?.[lead.statusHistory.length - 1];
    
    let newHistory = [...(lead.statusHistory || [])];
    if (lastHistory?.status !== newStatus) {
        newHistory.push(newHistoryEntry);
    }

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

  const handleImportLeads = (data: any[]) => {
    let importedCount = 0;
    let skippedCount = 0;
    const currentLeads = [...leads];

    data.forEach((row) => {
        const name = row['name'];
        const contact = row['contact'];
        if (!name || !contact) {
            skippedCount++;
            return; // Skip if essential data is missing
        }
        
        // Basic duplicate check
        const isDuplicate = currentLeads.some(l => l.name.toLowerCase() === name.toLowerCase() && l.contact.toLowerCase() === contact.toLowerCase());
        if (isDuplicate) {
            skippedCount++;
            return;
        }
        
        const newLeadData = {
            name: name,
            contact: contact,
            phone: row['phone'] || "",
            email: row['email'] || "",
            value: Number(row['value']) || 0,
            zip: row['zip'] || "",
            distance: Number(row['distance']) || 0,
            displayId: generateDisplayId(currentLeads)
        };

        onAddLead(newLeadData);
        currentLeads.push({
            id: '', // dummy id for check
            status: 'Lista de Leads',
            ...newLeadData
        });
        importedCount++;
    });

    toast({
        title: "Importação Concluída",
        description: `${importedCount} leads importados. ${skippedCount} duplicados ou inválidos foram ignorados.`,
    });
};


  const handleCardClick = (lead: Lead) => {
    if (lead.status === 'Reativar') return; // Reactivation cards are not clickable into detail view

    const group = (
        lead.status === 'Aprovado' ? Object.values(groupedApprovedLeads) :
        lead.status === 'Reprovado' ? Object.values(groupedRejectedLeads) :
        []
    ).find(g => g.some(l => l.name === lead.name));

    if (group && group.length > 1) {
        const title = lead.status === "Aprovado" ? "Oportunidades Aprovadas" : "Oportunidades Reprovadas";
        handleViewGroup(group, title);
    } else {
        setSelectedLead(lead);
        setIsDetailsModalOpen(true);
    }
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
      id: `lead-${Date.now()}-${Math.random()}`,
      displayId: generateDisplayId(leads),
      status: 'Contato',
      statusHistory: [{ status: 'Contato', date: today, details: "Nova Compra" }],
      proposalId: undefined,
      proposalNotes: 'Oportunidade de nova compra.',
      value: 0,
    };
    onAddLead(newLead);

    toast({
        title: "Nova Oportunidade Criada!",
        description: `Um novo card para ${approvedLead.name} foi adicionado à coluna 'Contato'.`,
    });
  };

  const handleReactivate = (reactivationLead: Lead) => {
    // Create a new lead in 'Contact'
    const today = new Date().toISOString();
    const newLeadFromReactivation: Lead = {
        ...reactivationLead,
        id: `lead-${Date.now()}-${Math.random()}`,
        displayId: generateReactivationDisplayId(leads),
        status: 'Contato',
        statusHistory: [{ status: 'Contato', date: today, details: 'Reativação' }],
        proposalNotes: 'Oportunidade de reativação.',
        value: 0
    };
    onAddLead(newLeadFromReactivation);
    
    // Remove the suggestion card from the 'Reativar' column
    setLeads(prev => prev.filter(l => l.id !== reactivationLead.id));
    
    toast({
      title: "Cliente Reativado!",
      description: `Uma nova oportunidade para ${reactivationLead.name} foi criada em 'Contato'.`,
    });
  };
  
  const handleDismissReactivation = (reactivationLeadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== reactivationLeadId));
    toast({
        variant: "destructive",
        title: "Reativação Dispensada",
        description: "A sugestão de reativação foi removida.",
    });
  };


  const handleViewGroup = (group: Lead[], title: string) => {
    setGroupedModalTitle(title);
    setSelectedGroup(group);
    setIsGroupedLeadsModalOpen(true);
  };

  const handleViewSingleLeadFromGroup = (lead: Lead) => {
    setIsGroupedLeadsModalOpen(false);
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };
  
  const handleNewLeadSuccess = (data: Omit<Lead, 'id' | 'status' | 'statusHistory' | 'displayId'>) => {
    onAddLead({ ...data, displayId: generateDisplayId(leads) });
    setIsNewLeadModalOpen(false);
    toast({
        title: "Lead Criado!",
        description: "O novo lead foi adicionado à coluna 'Lista de Leads'.",
    });
  };

  const handleOpenContactModal = (lead: Lead) => {
    setContactLead(lead);
    setIsContactModalOpen(true);
  };
  
  const handleContactActivity = (activity: LeadActivity, message?: string) => {
    if (!contactLead) return;

    const today = new Date().toISOString();
    const newHistoryEntry: LeadHistoryEntry = { status: activity, date: today };
    const newHistory = [...(contactLead.statusHistory || []), newHistoryEntry];

    onUpdateLead({ ...contactLead, statusHistory: newHistory });
    
    setIsContactModalOpen(false);
    setContactLead(null);
    toast({
        title: "Atividade Registrada!",
        description: `A atividade "${activity}" foi registrada para ${contactLead.name}.`,
    });
  };

  const handleOpenCallModal = (lead: Lead) => {
    setCallLead(lead);
    setIsContactModalOpen(false); // Close contact modal
    setIsCallModalOpen(true);
  };

  const handleEndCall = (notes: string, duration: number, nextStatus: "Proposta" | "Reprovado") => {
    if (!callLead) return;
    
    const today = new Date().toISOString();
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = duration % 60;
    const durationString = `${durationMinutes}m ${durationSeconds}s`;

    const newHistory: LeadHistoryEntry[] = [
      ...(callLead.statusHistory || []),
      { status: "Ligação", date: today, details: durationString },
      { status: nextStatus, date: today }
    ];

    onUpdateLead({
      ...callLead,
      status: nextStatus,
      proposalNotes: notes,
      statusHistory: newHistory,
      lastCallDuration: duration,
      lastCallNotes: notes,
    });

    setIsCallModalOpen(false);
    setCallLead(null);
    toast({
      title: "Ligação Encerrada",
      description: `Lead movido para ${nextStatus}.`,
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

  const { leadsByStatus, groupedApprovedLeads, groupedRejectedLeads } = React.useMemo(() => {
    const groupedByStatus: { [key in LeadStatus]?: Lead[] } = {};

    const getSortDate = (lead: Lead, status: LeadStatus): Date => {
      const entry = [...(lead.statusHistory || [])].reverse().find(h => h.status === status);
      return entry ? new Date(entry.date) : new Date(0);
    };

    for (const status of funnelStatuses) {
        const statusLeads = filteredLeads.filter(lead => lead.status === status);
        statusLeads.sort((a, b) => getSortDate(a, status).getTime() - getSortDate(b, status).getTime());
        groupedByStatus[status] = statusLeads;
    }
    
    const groupLeadsByName = (leads: Lead[]): { [key: string]: Lead[] } => {
        return leads.reduce((acc, lead) => {
            const key = lead.name; // Group by company/person name
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(lead);
            return acc;
        }, {} as { [key: string]: Lead[] });
    };

    const groupedApproved = groupLeadsByName(groupedByStatus['Aprovado'] || []);
    const groupedRejected = groupLeadsByName(groupedByStatus['Reprovado'] || []);


    return { leadsByStatus: groupedByStatus, groupedApprovedLeads: groupedApproved, groupedRejectedLeads: groupedRejected };
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
                <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar via CSV
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
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
                       {status === 'Aprovado' ? Object.keys(groupedApprovedLeads).length 
                        : status === 'Reprovado' ? Object.keys(groupedRejectedLeads).length
                        : leadsByStatus[status]?.length || 0}
                    </Badge>
                  </div>
              </div>
              <Card className="bg-muted/50 border-dashed flex-grow">
                  <CardContent className="p-2 min-h-[200px]">
                    {status === 'Aprovado' ? (
                        Object.values(groupedApprovedLeads).map((group, index) => {
                            const firstLead = group[0];
                            const handleNewPurchaseClick = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleNewPurchase(firstLead);
                            }
                            return (
                                <Card 
                                  key={`group-approved-${index}`} 
                                  className="mb-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden flex flex-col" 
                                  onClick={() => handleCardClick(firstLead)}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColors[firstLead.status]}`}></div>
                                    <CardHeader className="p-4 pl-6 flex-grow">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {firstLead.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {group.length} {group.length > 1 ? 'oportunidades ganhas' : 'oportunidade ganha'}
                                        </CardDescription>
                                    </CardHeader>
                                     <CardFooter className="p-2 pl-6 flex justify-end">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleNewPurchaseClick}>
                                                        <ShoppingCart className="h-4 w-4"/>
                                                        <span className="sr-only">Nova Compra</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Nova Compra</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CardFooter>
                                </Card>
                            );
                        })
                    ) : status === 'Reprovado' ? (
                         Object.values(groupedRejectedLeads).map((group, index) => {
                            const firstLead = group[0];
                            return (
                                <Card 
                                  key={`group-rejected-${index}`} 
                                  className="mb-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" 
                                  onClick={() => handleCardClick(firstLead)}
                                >
                                     <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColors[firstLead.status]}`}></div>
                                    <CardHeader className="p-4 pl-6">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {firstLead.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {group.length} {group.length > 1 ? 'oportunidades perdidas' : 'oportunidade perdida'}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            );
                        })
                    ) : (
                        (leadsByStatus[status] || []).map((lead) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onDragStart={handleDragStart}
                                onClick={() => handleCardClick(lead)}
                                proposals={proposals}
                                onGenerateProposal={handleGenerateProposalClick}
                                onReactivate={handleReactivate}
                                status={status}
                                onOpenContactModal={handleOpenContactModal}
                                onApprove={() => onOpenNewOrder(lead)}
                                onReject={() => updateLeadWithHistory(lead, 'Reprovado')}
                                onDismissReactivation={handleDismissReactivation}
                            />
                        ))
                    )}
                  {((status !== 'Aprovado' && status !== 'Reprovado') && (leadsByStatus[status]?.length || 0) === 0) && (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          {filteredLeads.length > 0 && leads.length > filteredLeads.length ? 'Nenhum lead encontrado com este filtro' : 'Arraste um lead aqui'}
                      </div>
                  )}
                  {(status === 'Aprovado' && Object.keys(groupedApprovedLeads).length === 0) && (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          Arraste um lead aqui
                      </div>
                  )}
                  {(status === 'Reprovado' && Object.keys(groupedRejectedLeads).length === 0) && (
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
          onOpenContactModal={handleOpenContactModal}
          orders={orders}
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
                shippingSettings={shippingSettings}
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
            title={groupedModalTitle}
        />
        
        <ContactModal 
            lead={contactLead}
            open={isContactModalOpen}
            onOpenChange={setIsContactModalOpen}
            onRegisterActivity={handleContactActivity}
            onOpenCallModal={handleOpenCallModal}
        />

        <CallModal
            lead={callLead}
            open={isCallModalOpen}
            onOpenChange={setIsCallModalOpen}
            onEndCall={handleEndCall}
        />

        <ImportModal
            open={isImportModalOpen}
            onOpenChange={setIsImportModalOpen}
            onImport={handleImportLeads}
            sampleFileName="leads-exemplo.csv"
            expectedHeaders={["name", "contact", "phone", "email", "value", "zip", "distance"]}
        />

    </div>
  );
}

    

    


