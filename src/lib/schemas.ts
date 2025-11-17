
import { z } from "zod";

export const customerRegistrationSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  phone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }),
  zip: z.string().min(8, { message: "O CEP deve ter 8 dígitos." }).max(9, { message: "O CEP deve ter no máximo 9 caracteres."}),
  street: z.string().min(3, { message: "O logradouro é obrigatório." }),
  number: z.string().min(1, { message: "O número é obrigatório." }),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, { message: "O bairro é obrigatório." }),
  city: z.string().min(3, { message: "A cidade é obrigatória." }),
  state: z.string().min(2, { message: "O estado é obrigatório." }).max(2, { message: "Use a sigla do estado (ex: SP)." }),
});

export type Customer = z.infer<typeof customerRegistrationSchema>;

export const productSchema = z.object({
  name: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres."),
  price: z.coerce.number({invalid_type_error: "O preço é obrigatório."}).min(0.01, "O preço deve ser positivo."),
});

export type Product = z.infer<typeof productSchema>;

export type OrderStatus = "Pendente" | "Processando" | "Enviado" | "Entregue";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type SalesOrder = {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
};

export type LeadStatus = "Lista de Leads" | "Contato" | "Proposta" | "Negociação" | "Criar Pedido (Aprovado)" | "Reprovado";

export type Lead = {
  id: string;
  name: string;
  contact: string;
  value: number;
  status: LeadStatus;
}
