import CustomerRegistrationForm from "@/components/customer-registration-form";

export default function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-accent/30 p-4 md:p-8">
      <CustomerRegistrationForm />
    </main>
  );
}
