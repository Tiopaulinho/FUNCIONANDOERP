
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
import { DollarSign, Building, User, Upload } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/schemas";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import CustomerRegistrationForm from "./customer-registration-form";

const funnelStatuses: LeadStatus[] = ["Lista de Leads", "Contato", "Proposta", "Negociação", "Criar Pedido (Aprovado)", "Reprovado"];

const LeadCard = ({ lead, onDragStart }: { lead: Lead, onDragStart: (e: React.DragEvent, leadId: string) => void }) => {
  return (
    <Card 
      className="mb-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow" 
      draggable="true"
      onDragStart={(e) => onDragStart(e, lead.id)}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            {lead.name}
        </CardTitle>
        <CardDescription className="text-sm flex items-center gap-2 pt-1">
            <User className="h-4 w-4 text-muted-foreground" />
            {lead.contact}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center text-sm font-semibold">
            <div className="flex items-center gap-1 text-base">
                <DollarSign className="h-4 w-4" />
                {lead.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SalesFunnelProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  onOpenNewOrder: (lead: Lead) => void;
}

export default function SalesFunnel({ leads, setLeads, onOpenNewOrder }: SalesFunnelProps) {
  const { toast } = useToast();
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = React.useState(false);
  const [leadToRegister, setLeadToRegister] = React.useState<Lead | null>(null);

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

    if (lead && newStatus === 'Criar Pedido (Aprovado)') {
       if (lead.isNew) {
         setLeadToRegister(lead);
         setIsCustomerDialogOpen(true);
       } else {
         onOpenNewOrder(lead);
         // Move the card only after opening the dialog
          setLeads(prevLeads => 
            prevLeads.map(l => 
              l.id === leadId ? { ...l, status: newStatus } : l
            )
          );
       }
    } else {
      setLeads(prevLeads => 
        prevLeads.map(l => 
          l.id === leadId ? { ...l, status: newStatus } : l
        )
      );
    }
  };

  const simulateImport = () => {
    const newLeads: Lead[] = [
      { id: `lead-${Date.now()}-7`, name: "TecnoCorp", contact: "Roberto", value: 22000, status: "Lista de Leads", isNew: true },
      { id: `lead-${Date.now()}-8`, name: "InovaSoluções", contact: "Sandra", value: 33000, status: "Lista de Leads", isNew: true },
    ];
    
    setLeads(prev => [...prev, ...newLeads]);

    toast({
      title: "Leads Importados!",
      description: "Novos leads foram adicionados ao seu funil."
    })
  }

  const handleCustomerRegistrationSuccess = () => {
    setIsCustomerDialogOpen(false);
    if(leadToRegister) {
      // Mark lead as registered and move it to the approved column
      const registeredLead = { ...leadToRegister, isNew: false, status: 'Criar Pedido (Aprovado)' } as Lead;
      
      setLeads(prevLeads => 
        prevLeads.map(l => 
          l.id === leadToRegister.id ? registeredLead : l
        )
      );
      
       toast({
        title: "Cliente Cadastrado!",
        description: "O lead foi movido para 'Criar Pedido' e o cliente foi salvo."
      });
      
      onOpenNewOrder(registeredLead);
    }
    setLeadToRegister(null);
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
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                  <DialogTitle>Completar Cadastro do Cliente</DialogTitle>
                  <DialogDescription>
                    Este é um novo lead. Por favor, complete o cadastro do cliente antes de criar um pedido.
                  </DialogDescription>
              </DialogHeader>
              <CustomerRegistrationForm 
                initialData={{
                  name: leadToRegister?.contact || "",
                  email: "", // Not available from lead
                  phone: "", // Not available from lead
                  // You can add company name to a field if you have one
                }}
                onSuccess={handleCustomerRegistrationSuccess}
              />
          </DialogContent>
      </Dialog>
    </div>
  );
}
