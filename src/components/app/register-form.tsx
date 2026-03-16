"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/app/register/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormFieldError } from "@/components/app/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialRegisterFormState } from "@/types/register-form";

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUserAction, initialRegisterFormState);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/register/pending");
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not create account</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
        <FormFieldError message={state.fieldErrors.name?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FormFieldError message={state.fieldErrors.email?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <FormFieldError message={state.fieldErrors.password?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repeat password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        <FormFieldError message={state.fieldErrors.confirmPassword?.[0]} />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Register"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
