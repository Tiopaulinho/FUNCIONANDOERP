
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
import { FilePenLine, Trash2, Package } from "lucide-react";
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

interface ProductListProps {
    products: (Product & { id: string })[];
    onUpdateProduct: (product: Product & { id: string }) => void;
    onDeleteProduct: (productId: string) => void;
    onNewProductClick: () => void;
}


export default function ProductList({ products, onUpdateProduct, onDeleteProduct, onNewProductClick }: ProductListProps) {
  const { toast } = useToast();
  const [nameFilter, setNameFilter] = React.useState("");
  const [filteredProducts, setFilteredProducts] = React.useState(products);
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
    onDeleteProduct(productId);
    toast({
        title: "Produto Excluído!",
        description: "O produto foi removido com sucesso.",
        variant: "destructive",
      });
  }

  const handleFormSuccess = (updatedProduct: Product & { id: string }) => {
    onUpdateProduct(updatedProduct);
    setIsEditDialogOpen(false);
    setEditingProduct(null);
     toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso.",
      });
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
              <CardTitle>Produtos Cadastrados</CardTitle>
              <CardDescription>
                Visualize e gerencie os produtos cadastrados no sistema.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onNewProductClick}>
              <Package className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
        </div>
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
