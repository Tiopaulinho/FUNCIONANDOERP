"use server";

import { customerRegistrationSchema } from "@/lib/schemas";

export async function registerCustomerAction(data: unknown) {
  const result = customerRegistrationSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: "Dados inválidos. Por favor, verifique os campos.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Simulate a database operation
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log("Novo cliente cadastrado:", result.data);

  // Here you would typically save the data to a database like Firestore
  // e.g., await db.collection('customers').add(result.data);

  return {
    success: true,
    message: "Cliente cadastrado com sucesso!",
  };
}
