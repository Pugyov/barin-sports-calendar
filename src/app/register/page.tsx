import Image from "next/image";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/app/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center rounded-2xl border bg-white px-3 py-2 shadow-sm">
            <Image src="/barin-redline-logo.png" alt="Barin Sports" width={72} height={72} priority className="h-12 w-auto" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Create your Barin Sports account</h1>
            <p className="text-sm text-muted-foreground">New accounts start as viewers and require admin approval before access is granted.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Use your work details to request access.</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
