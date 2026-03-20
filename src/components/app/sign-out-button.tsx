"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";

type SignOutButtonProps = {
  email: string;
};

export function SignOutButton({ email }: SignOutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);
    await signOut({ callbackUrl: "/signin" });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <SidebarMenuButton tooltip="Sign out" className="group-data-[collapsible=icon]:justify-center">
          <LogOut />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </SidebarMenuButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of Barin Sports?</AlertDialogTitle>
          <AlertDialogDescription>
            You are currently signed in as {email}. You can sign back in at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Stay signed in</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" variant="destructive" onClick={handleSignOut} disabled={isSubmitting}>
              {isSubmitting ? "Signing out..." : "Sign out"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
