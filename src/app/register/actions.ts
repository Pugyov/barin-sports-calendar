"use server";

import { ZodError } from "zod";
import { registerPendingUser } from "@/lib/server/user-service";
import type { RegisterFormState } from "@/types/register-form";

export async function registerUserAction(_: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
  try {
    await registerPendingUser({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? "")
    });

    return {
      status: "success",
      message: "Your registration was submitted for admin approval.",
      fieldErrors: {}
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: "error",
        message: "Please correct the highlighted fields.",
        fieldErrors: error.flatten().fieldErrors
      };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Registration failed.",
      fieldErrors: {}
    };
  }
}
