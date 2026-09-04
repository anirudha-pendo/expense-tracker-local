import { useCallback, useEffect, useState } from "react";
import { addInvoice, deleteInvoice, getInvoicesByWorkspaceId, updateInvoice } from "@/lib/db/repositories/invoices.repo";
import type { Invoice, InvoiceStatus } from "@/types";

export function useInvoices(workspaceId: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInvoicesByWorkspaceId(workspaceId);
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setInvoices(data);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createInvoice(invoice: Invoice) {
    await addInvoice(invoice);
    await load();
  }

  async function updateStatus(id: string, status: InvoiceStatus) {
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) return;
    await updateInvoice({ ...invoice, status });
    await load();
  }

  async function removeInvoice(id: string) {
    await deleteInvoice(id);
    await load();
  }

  return { invoices, isLoading, createInvoice, updateStatus, removeInvoice };
}
