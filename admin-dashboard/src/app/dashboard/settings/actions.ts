"use server";

import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/server-utils";

export async function changePin(formData: FormData) {
  const { supabase, user, role } = await requireAdmin();

  if (role !== "super_admin") {
    throw new Error("Only super admins can change the emergency PIN");
  }

  const currentPin = formData.get("current_pin") as string;
  const newPin = formData.get("new_pin") as string;
  const confirmPin = formData.get("confirm_pin") as string;

  if (!currentPin || !newPin || !confirmPin) {
    throw new Error("All fields are required");
  }

  if (newPin !== confirmPin) {
    throw new Error("New PIN and confirmation do not match");
  }

  if (!/^[0-9]{4,6}$/.test(newPin)) {
    throw new Error("PIN must be 4-6 digits");
  }

  // Verify current PIN server-side via SECURITY DEFINER RPC (pin_hash never leaves the DB)
  const { data: isValid, error: verifyError } = await supabase.rpc("verify_pin", { pin: currentPin });
  if (verifyError) {
    throw new Error("Could not verify current PIN");
  }
  if (!isValid) {
    throw new Error("Current PIN is incorrect");
  }

  // Hash and store new PIN
  const newHash = await hash(newPin, 10);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ pin_hash: newHash })
    .eq("id", user.id);

  if (updateError) {
    throw new Error("Failed to update PIN");
  }
}
