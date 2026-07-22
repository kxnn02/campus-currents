"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server-utils";

export async function updateBugStatus(id: string, status: string) {
  const { supabase } = await requireAdmin();

  if (!id || typeof id !== "string") throw new Error("Invalid bug report ID");
  if (!["open", "acknowledged", "fixed"].includes(status)) throw new Error("Invalid status");

  const { error } = await supabase
    .from("bug_reports")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/bugs");
}
