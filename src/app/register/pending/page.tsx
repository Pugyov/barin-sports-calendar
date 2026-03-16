import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default async function RegisterPendingPage() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <div className="inline-flex items-center rounded-2xl bg-black px-3 py-2 shadow-sm">
            <Image src="/barin-sports-logo.svg" alt="Barin Sports" width={84} height={60} priority className="h-12 w-auto" />
          </div>
          <CardTitle>Waiting for admin approval</CardTitle>
          <CardDescription>Your account request has been received. An admin needs to approve it before you can sign in.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
