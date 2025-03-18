"use server";

import { signIn } from "@/auth";
import { executeAction } from "@/lib/executeAction";


type FormInputs = {
    email: string;
    password: string;  
}

export async function authenticate(formData: FormInputs) {

await executeAction({
    actionFn: async () => {
    await signIn("credentials", formData)
    },
});

}