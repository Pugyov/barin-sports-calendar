export type RegisterFormField = "name" | "email" | "password" | "confirmPassword";

export type RegisterFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<RegisterFormField, string[]>>;
};

export const initialRegisterFormState: RegisterFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};
