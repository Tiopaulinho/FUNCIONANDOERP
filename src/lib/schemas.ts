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
  // You can add more fields like description, sku, etc.
});

export type Product = z.infer<typeof productSchema>;
