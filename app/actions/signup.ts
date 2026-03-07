"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserType } from "@/types/User";

type SignupParams = {
    name: string;
    email: string;
    password: string;
    type: UserType;
    businessName: string;
    phone: string;
};

export async function signup({
    name,
    email,
    password,
    type,
    businessName,
    phone,
}: SignupParams): Promise<{ error: string } | never> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                type,
                business_name: businessName,
                phone,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    redirect(type === "farmer" ? "/farmer" : "/buyer");
}
