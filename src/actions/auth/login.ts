"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

type FormInputs = {
    email: string;
    password: string;  
}

export async function authenticate(formData: FormInputs) {
    try {
        await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
        })

        return { success: true };
    } catch (error) {

        if (error instanceof AuthError) {
            return { success: false, message: error.cause?.err?.message };
        }
        return { success: false, message: "error 500" };
    }
}