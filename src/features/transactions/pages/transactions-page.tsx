import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/app-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { pendoTrack } from "@/lib/pendo";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { useTransactions } from "../hooks/use-transactions";
import { TransactionTable } from "../components/transaction-table";
import { TransactionForm } from "../components/transaction-form";
import { TransactionFiltersBar, type TransactionFilters } from "../components/transaction-filters";
import { DeleteTransactionDialog } from "../components/delete-transaction-dialog";
import { useAttachments } from "../hooks/use-attachments";
import { getAttachmentCounts } from "@/lib/db/repositories/attachments.repo";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { InvoiceFormDialog } from "@/features/invoices/components/invoice-form-dialog";
import type { TransactionWithCategory } from "../hooks/use-transactions";
import type { TransactionFormValues } from "../schemas/transaction.schema";
import type { Invoice, InvoiceItem, Transaction } from "@/types";

export function TransactionsPage() {
  const { workspace } = useAuthContext();
  const navigate = useNavigate();
  const { transactions, categories, isLoading, addTransaction, editTransaction, removeTransaction } =
    useTransactions(workspace!.id);
  const { createInvoice } = useInvoices(workspace!.id);

  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionWithCategory | null>(null);
  const [deletingTx, setDeletingTx] = useState<TransactionWithCategory | null>(null);
  const [attachmentCounts, setAttachmentCounts] = useState<Map<string, number>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  // Staged receipts for the add flow (no transaction id yet) and live
  // receipts for the edit flow.
  const addAttachments = useAttachments(workspace!.id, null);
  const editAttachments = useAttachments(workspace!.id, editingTx?.id ?? null);

  // Keyed on a stable string: `transactions` is a fresh array each render,
  // and depending on it directly would re-run this effect forever.
  const transactionIdsKey = transactions.map((t) => t.id).join(",");
  const refreshAttachmentCounts = useCallback(async () => {
    if (!transactionIdsKey) {
      setAttachmentCounts(new Map());
      return;
    }
    setAttachmentCounts(await getAttachmentCounts(transactionIdsKey.split(",")));
  }, [transactionIdsKey]);

  useEffect(() => {
    refreshAttachmentCounts();
  }, [refreshAttachmentCounts]);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    type: "all",
    categoryId: "",
    month: "",
  });

  const currency = workspace?.currency ?? "USD";
  const locale = workspace?.locale ?? "en-US";

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.search && !tx.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.type !== "all" && tx.type !== filters.type) return false;
      if (filters.categoryId && tx.categoryId !== filters.categoryId) return false;
      if (filters.month) {
        const txMonth = tx.date.slice(0, 7);
        if (txMonth !== filters.month) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  async function handleAdd(values: TransactionFormValues) {
    try {
      const created = await addTransaction({ ...values, workspaceId: workspace!.id, notes: values.notes ?? "" });
      await addAttachments.flushStaged(created.id);
      pendoTrack("transaction_added", {
        transactionType: values.type,
        amount: values.amount,
        categoryId: values.categoryId,
        isRecurring: values.isRecurring,
        hasAttachments: addAttachments.totalCount > 0,
        hasNotes: Boolean(values.notes),
      });
      setShowForm(false);
      toast.success("Transaction added");
    } catch {
      toast.error("Failed to add transaction");
    }
  }

  async function handleEdit(values: TransactionFormValues) {
    if (!editingTx) return;
    try {
      const updated: Transaction = {
        ...editingTx,
        ...values,
        notes: values.notes ?? "",
        date: values.date,
      };
      await editTransaction(updated);
      pendoTrack("transaction_edited", {
        transactionType: values.type,
        amount: values.amount,
        categoryId: values.categoryId,
        isRecurring: values.isRecurring,
        hasNotes: Boolean(values.notes),
      });
      setEditingTx(null);
      await refreshAttachmentCounts();
      toast.success("Transaction updated");
    } catch {
      toast.error("Failed to update transaction");
    }
  }

  async function handleDelete() {
    if (!deletingTx) return;
    try {
      await removeTransaction(deletingTx.id);
      pendoTrack("transaction_deleted", {
        transactionType: deletingTx.type,
        amount: deletingTx.amount,
        categoryId: deletingTx.categoryId,
      });
      setDeletingTx(null);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    }
  }

  const selectedInvoiceItems: InvoiceItem[] = useMemo(() => {
    return filteredTransactions
      .filter((tx) => selectedIds.has(tx.id))
      .map((tx) => ({
        transactionId: tx.id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        categoryName: tx.categoryName,
      }));
  }, [filteredTransactions, selectedIds]);

  async function handleCreateInvoice(invoice: Invoice) {
    try {
      await createInvoice(invoice);
      setShowInvoiceForm(false);
      setSelectedIds(new Set());
      toast.success("Invoice created");
      navigate("/invoices");
    } catch {
      toast.error("Failed to create invoice");
    }
  }

  return (
    <AppLayout
      title="Transactions"
      actions={
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInvoiceForm(true)}
              className="gap-1.5"
            >
              <FileText className="size-3.5" />
              Create Invoice ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus data-icon="inline-start" />
            Add Transaction
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <TransactionFiltersBar
          filters={filters}
          categories={categories}
          onChange={setFilters}
        />

        <TransactionTable
          transactions={filteredTransactions}
          currency={currency}
          locale={locale}
          isLoading={isLoading}
          attachmentCounts={attachmentCounts}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={setEditingTx}
          onDelete={setDeletingTx}
        />
      </div>

      <Dialog
        open={showForm}
        onOpenChange={(o) => {
          if (!o) {
            setShowForm(false);
            addAttachments.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            attachments={addAttachments}
            onSubmit={handleAdd}
            onCancel={() => {
              setShowForm(false);
              addAttachments.reset();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingTx}
        onOpenChange={(o) => {
          if (!o) {
            setEditingTx(null);
            refreshAttachmentCounts();
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTx && (
            <TransactionForm
              categories={categories}
              defaultValues={editingTx}
              attachments={editAttachments}
              onSubmit={handleEdit}
              onCancel={() => setEditingTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteTransactionDialog
        open={!!deletingTx}
        description={deletingTx?.description ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTx(null)}
      />

      <InvoiceFormDialog
        open={showInvoiceForm}
        items={selectedInvoiceItems}
        currency={currency}
        locale={locale}
        workspaceId={workspace!.id}
        onSubmit={handleCreateInvoice}
        onCancel={() => setShowInvoiceForm(false)}
      />
    </AppLayout>
  );
}
