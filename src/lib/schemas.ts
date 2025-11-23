
import { z } from "zod";

export const customerRegistrationSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  phone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }),
  zip: z.string().min(8, { message: "O CEP deve ter 8 dígitos." }).max(9, { message: "O CEP deve ter no máximo 9 caracteres."}),
  street: z.string().min(3, { message: "O logradouro é obrigatório." }),
  number: z.string().min(1, { message: "O número é obrigatório." }),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, { message: "O bairro é obrigatório." }),
  city: z.string().min(3, { message: "A cidade é obrigatória." }),
  state: z.string().min(2, { message: "O estado é obrigatório." }).max(2, { message: "Use a sigla do estado (ex: SP)." }),
  distance: z.coerce.number().min(0, "A distância não pode ser negativa.").optional(),
});

export type Customer = z.infer<typeof customerRegistrationSchema> & { id?: string };

export const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório."),
  category: z.string().min(1, "A categoria é obrigatória."),
  newCategory: z.string().optional(),
  type: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  otherDetails: z.string().optional(),
  price: z.coerce.number({invalid_type_error: "O preço é obrigatório."}).min(0, "O preço não pode ser negativo."),
  rawMaterialCost: z.coerce.number().min(0, "O custo não pode ser negativo.").optional(),
  laborCost: z.coerce.number().min(0, "O custo não pode ser negativo.").optional(),
  suppliesCost: z.coerce.number().min(0, "O custo não pode ser negativo.").optional(),
  fees: z.coerce.number().min(0, "As taxas não podem ser negativas.").optional(),
  taxes: z.coerce.number().min(0, "Os impostos não podem ser negativos.").optional(),
  profitMargin: z.coerce.number().min(0, "A margem não pode ser negativa.").optional(),
  productionMinutes: z.coerce.number().min(0, "Os minutos não podem ser negativos.").optional(),
}).refine(data => {
    if (data.category === 'OUTROS') {
        return !!data.newCategory && data.newCategory.length > 0;
    }
    return true;
}, {
    message: "Por favor, especifique o nome da nova categoria.",
    path: ["newCategory"],
});


export type Product = z.infer<typeof productSchema>;

export type OrderStatus = "Pendente" | "Processando" | "Enviado" | "Entregue";

export const salesOrderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Selecione um produto."),
  productName: z.string(), // To display name
  quantity: z.coerce.number().min(1, "A quantidade deve ser no mínimo 1."),
  price: z.coerce.number().min(0.01, "O preço deve ser positivo."),
});

export const salesOrderSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().min(1, "Selecione um cliente."),
  customerName: z.string().optional(), // For data handling
  leadId: z.string().optional(), // To link order back to lead
  date: z.string().optional(), // For data handling
  status: z.enum(["Pendente", "Processando", "Enviado", "Entregue"]).optional(),
  shipping: z.coerce.number().min(0, "O frete não pode ser negativo.").optional(),
  shippingMethod: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, "Adicione pelo menos um item ao pedido."),
});


export type OrderItem = z.infer<typeof salesOrderItemSchema>;

export type SalesOrder = z.infer<typeof salesOrderSchema> & {
    id: string;
    total: number;
};


export const leadStatusSchema = z.enum(["Lista de Leads", "Contato", "Proposta", "Negociação", "Aprovado", "Reativar", "Reprovado"]);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const leadActivitySchema = z.enum(["Ligação", "WhatsApp", "Email"]);
export type LeadActivity = z.infer<typeof leadActivitySchema>;

export const leadHistoryEntrySchema = z.object({
    status: z.union([leadStatusSchema, leadActivitySchema]),
    date: z.string(),
    details: z.string().optional(), // For call duration, etc.
});
export type LeadHistoryEntry = z.infer<typeof leadHistoryEntrySchema>;


export const leadSchema = z.object({
  name: z.string().min(3, "O nome da empresa deve ter pelo menos 3 caracteres."),
  contact: z.string().min(3, "O nome do contato deve ter pelo menos 3 caracteres."),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')),
  phone: z.string().optional(),
  value: z.coerce.number({invalid_type_error: "O valor é obrigatório."}).min(0, "O valor não pode ser negativo.").optional(),
  proposalNotes: z.string().optional(),
  zip: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  distance: z.coerce.number().optional(),
  lastCallDuration: z.number().optional(),
  lastCallNotes: z.string().optional(),
});

export const newLeadSchema = z.object({
  type: z.enum(["pf", "pj"]),
  name: z.string().optional(), // Company name for PJ
  contact: z.string().min(3, { message: "O nome do contato é obrigatório." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
  zip: z.string().optional(),
  distance: z.coerce.number().optional(),
}).refine(data => {
  if (data.type === "pj") {
    return !!data.name && data.name.length >= 3;
  }
  return true;
}, {
  message: "O nome da empresa é obrigatório para Pessoa Jurídica.",
  path: ["name"],
});


export type Lead = z.infer<typeof leadSchema> & {
  id: string;
  status: LeadStatus;
  statusHistory?: LeadHistoryEntry[];
  proposalId?: string;
  customerId?: string;
  email?: string;
}


export const proposalItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Selecione um produto."),
  productName: z.string(),
  quantity: z.coerce.number().min(1, "A quantidade deve ser no mínimo 1."),
  price: z.coerce.number().min(0.01, "O preço deve ser positivo."),
});

export const proposalSchema = z.object({
  id: z.string().optional(),
  leadId: z.string(),
  date: z.string(),
  status: z.enum(["Draft", "Sent"]),
  items: z.array(proposalItemSchema).min(1, "Adicione pelo menos um item."),
  discount: z.coerce.number().min(0, "O desconto não pode ser negativo.").optional(),
  shipping: z.coerce.number().min(0, "O frete não pode ser negativo.").optional(),
  shippingMethod: z.string().optional(),
  observations: z.string().optional(),
  paymentMethods: z.string().optional(),
  total: z.coerce.number().optional(),
});

export type Proposal = z.infer<typeof proposalSchema>;
export type ProposalItem = z.infer<typeof proposalItemSchema>;


export interface ShippingTier {
  minDistance: number;
  maxDistance: number;
  cost: number;
}

export interface ShippingSettings {
  originZip: string;
  tiers: ShippingTier[];
  reactivationPeriodDays: number;
}
