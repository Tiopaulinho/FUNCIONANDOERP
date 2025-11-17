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
import { FilePenLine, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import ProductForm from "./product-form";
import type { Product } from "@/lib/schemas";
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

const allProducts: (Product & { id: string })[] = [
    { id: "prod-1", name: "Notebook Pro", price: 7500 },
    { id: "prod-2", name: "Mouse Sem Fio", price: 120.50 },
    { id: "prod-3", name: "Teclado Mecânico", price: 450 },
    { id: "prod-4", name: "Monitor 4K", price: 2300 },
];


export default function ProductList() {
  const { toast } = useToast();
  const [nameFilter, setNameFilter] = React.useState("");
  const [products, setProducts] = React.useState(allProducts);
  const [filteredProducts, setFilteredProducts] = React.useState(allProducts);
  const [editingProduct, setEditingProduct] = React.useState<(Product & { id: string }) | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const lowercasedNameFilter = nameFilter.toLowerCase();
    const filtered = products.filter((product) => 
      product.name.toLowerCase().includes(lowercasedNameFilter)
    );
    setFilteredProducts(filtered);
  }, [nameFilter, products]);
  
  const handleEditClick = (product: Product & { id: string }) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  }

  const handleDeleteClick = (productId: string) => {
     // In a real app, you'd make an API call to delete the product
    console.log("Deleting product with id:", productId);

    setProducts(products.filter(p => p.id !== productId));

    toast({
        title: "Produto Excluído!",
        description: "O produto foi removido com sucesso.",
        variant: "destructive",
      });
  }

  const handleFormSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    // Here you would refetch the product list from the database
    // For now, let's just show a toast
     toast({
        title: "Sucesso!",
        description: "Lista de produtos atualizada.",
      });
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle>Produtos Cadastrados</CardTitle>
        <CardDescription>
          Visualize e gerencie os produtos cadastrados no sistema.
        </CardDescription>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="Filtrar por nome do produto..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Produto</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(product)}>
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
                                Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteClick(product.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
              </DialogHeader>
              <ProductForm
                initialData={editingProduct}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>
      </CardContent>
    </Card>
  );
}
