import { getDB } from "../client";
import type { Invoice } from "@/types";

export async function getInvoicesByWorkspaceId(workspaceId: string): Promise<Invoice[]> {
  const db = await getDB();
  return db.getAllFromIndex("invoices", "by-workspaceId", workspaceId);
}

export async function addInvoice(invoice: Invoice): Promise<void> {
  const db = await getDB();
  await db.add("invoices", invoice);
}

export async function updateInvoice(invoice: Invoice): Promise<void> {
  const db = await getDB();
  await db.put("invoices", { ...invoice, updatedAt: new Date().toISOString() });
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("invoices", id);
}
