
"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Proposal, Lead, Customer } from "@/lib/schemas";
import { Badge } from "./ui/badge";

interface ProposalListProps {
    proposals: Proposal[];
    leads: Lead[];
    customers: (Customer & { id: string })[];
    onDeleteProposal: (proposalId: string) => void;
}


export default function ProposalList({ proposals, leads, customers, onDeleteProposal }: ProposalListProps) {
  const { toast } = useToast();

  const handleDeleteClick = (proposalId: string) => {
    onDeleteProposal(proposalId);
    toast({
        title: "Proposta Excluída!",
        description: "A proposta foi removida com sucesso.",
        variant: "destructive",
      });
  }

  const getLeadInfo = (leadId: string) => {
    return leads.find(l => l.id === leadId);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gerenciador de Propostas</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as propostas comerciais.
              </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposta ID</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.id}</TableCell>
                  <TableCell>{getLeadInfo(proposal.leadId)?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(proposal.date).toLocaleDateString("pt-BR")}</TableCell>
                   <TableCell>
                      <Badge variant={proposal.status === 'Sent' ? 'default' : 'secondary'}>
                        {proposal.status === 'Sent' ? 'Enviada' : 'Rascunho'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(proposal.total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => { /* Open edit modal */ }}>
                          <FilePenLine className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso excluirá permanentemente a proposta.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteClick(proposal.id!)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
                {proposals.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">Nenhuma proposta encontrada.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
