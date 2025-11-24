
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
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FilePenLine, Trash2, UserPlus, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import CustomerRegistrationForm from "./customer-registration-form";
import type { Customer, ShippingSettings } from "@/lib/schemas";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { doc, CollectionReference } from "firebase/firestore";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

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
                    <CardDescription>
                        Baixe o arquivo de exemplo, preencha com seus dados e faça o upload.
                    </CardDescription>
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


interface CustomerListProps {
  customers: (Customer & { id: string })[];
  shippingSettings: ShippingSettings;
  collectionRef: CollectionReference | null;
}

export default function CustomerList({ customers, shippingSettings, collectionRef }: CustomerListProps) {
  const [nameFilter, setNameFilter] = React.useState("");
  const [emailFilter, setEmailFilter] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState(customers);
  const [editingCustomer, setEditingCustomer] = React.useState<(Customer & { id: string}) | null>(null);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const { toast } = useToast();
  const { user } = useUser();

  React.useEffect(() => {
    const lowercasedNameFilter = nameFilter.toLowerCase();
    const lowercasedEmailFilter = emailFilter.toLowerCase();

    const filtered = customers.filter((customer) => {
      const nameMatch = (customer.name.toLowerCase().includes(lowercasedNameFilter) || (customer.companyName && customer.companyName.toLowerCase().includes(lowercasedNameFilter)));
      const emailMatch = customer.email.toLowerCase().includes(lowercasedEmailFilter);
      return nameMatch && emailMatch;
    });
    setFilteredCustomers(filtered);
  }, [nameFilter, emailFilter, customers]);
  
  const handleEditClick = (customer: Customer & { id: string }) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  }

  const handleFormSuccess = (customerData: Omit<Customer, 'id'>) => {
    if (!collectionRef) return;
    
    if (editingCustomer) {
      // Update existing customer
      const customerDocRef = doc(collectionRef, editingCustomer.id);
      setDocumentNonBlocking(customerDocRef, customerData, { merge: true });
    } else {
      // Add new customer
      addDocumentNonBlocking(collectionRef, customerData);
    }
    setIsEditDialogOpen(false);
    setIsNewCustomerDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string) => {
    if (!collectionRef) return;
    const customerDocRef = doc(collectionRef, id);
    deleteDocumentNonBlocking(customerDocRef);
  }

  const handleImportCustomers = (data: any[]) => {
    if (!collectionRef || !user) {
        toast({
            variant: "destructive",
            title: "Erro de Autenticação",
            description: "Você precisa estar logado para importar clientes.",
        });
        return;
    }
    let importedCount = 0;
    let skippedCount = 0;

    data.forEach(row => {
        const name = row['name'];
        const email = row['email'];
        if (!name || !email) {
            skippedCount++;
            return;
        }

        const isDuplicate = customers.some(c => c.email.toLowerCase() === email.toLowerCase());
        if (isDuplicate) {
            skippedCount++;
            return;
        }

        const customerData: Omit<Customer, 'id'> = {
            name: name,
            companyName: row['companyName'] || "",
            email: email,
            phone: row['phone'] || "",
            zip: row['zip'] || "",
            street: row['street'] || "",
            number: row['number'] || "",
            complement: row['complement'] || "",
            neighborhood: row['neighborhood'] || "",
            city: row['city'] || "",
            state: row['state'] || "",
            distance: Number(row['distance']) || 0,
            userId: user.uid,
        };
        addDocumentNonBlocking(collectionRef, customerData);
        importedCount++;
    });

    toast({
        title: "Importação Concluída",
        description: `${importedCount} clientes importados. ${skippedCount} duplicados ou inválidos foram ignorados.`,
    });
};


  return (
    <Card className="shadow-lg">
      <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
                <CardTitle>Clientes Cadastrados</CardTitle>
                <CardDescription>
                  Visualize e gerencie os clientes cadastrados no sistema.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar via CSV
                </Button>
                <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
                    <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Cadastrar Cliente
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle className="sr-only">
                        Cadastro de Cliente
                        </DialogTitle>
                    </DialogHeader>
                    <CustomerRegistrationForm 
                        onSuccess={handleFormSuccess} 
                        shippingSettings={shippingSettings}
                    />
                    </DialogContent>
                </Dialog>
            </div>
          </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="Filtrar por nome do cliente ou empresa..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            <Input
              placeholder="Filtrar por email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente/Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.companyName || customer.name}</TableCell>
                  <TableCell>{customer.companyName ? customer.name : '-'}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.state}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(customer)}>
                          <FilePenLine className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="sr-only">Editar Cliente</DialogTitle>
              </DialogHeader>
              <CustomerRegistrationForm
                initialData={editingCustomer}
                onSuccess={(data) => handleFormSuccess(data as Omit<Customer, 'id'>)}
                shippingSettings={shippingSettings}
              />
            </DialogContent>
          </Dialog>
          <ImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImport={handleImportCustomers}
                sampleFileName="clientes-exemplo.csv"
                expectedHeaders={["name", "companyName", "email", "phone", "zip", "street", "number", "complement", "neighborhood", "city", "state", "distance"]}
            />
      </CardContent>
    </Card>
  );
}
