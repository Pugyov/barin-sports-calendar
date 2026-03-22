import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/app/signin-form";

export default async function SignInPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[78vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 app-fade-in">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center rounded-[calc(var(--radius)+0.35rem)] border border-white/70 bg-white px-4 py-3 shadow-sm">
            <Image
              src="/barin-redline-logo.png"
              alt="Barin Sports"
              width={72}
              height={72}
              priority
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-2">
            <p className="workspace-kicker">Internal Workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight">Barin Sports Marketing Calendar</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage publishing timelines, assignments, and milestone visibility from one workspace.</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-card/88">
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your internal email and password to access the calendar.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
