import { useState } from "react";
import { FileText, Trash2, Eye, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/shared/components/app-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { BpBox } from "@/shared/components/bp-box";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { useInvoices } from "../hooks/use-invoices";
import { InvoicePreviewDialog } from "../components/invoice-preview-dialog";
import type { Invoice, InvoiceStatus } from "@/types";

const colHead = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "border-yellow-500/30 text-yellow-600 bg-yellow-50",
  sent: "border-blue-500/30 text-blue-600 bg-blue-50",
  paid: "border-emerald-600/30 text-emerald-700 bg-emerald-50",
};

export function InvoicesPage() {
  const { workspace } = useAuthContext();
  const { invoices, isLoading, updateStatus, removeInvoice } = useInvoices(workspace!.id);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const locale = workspace?.locale ?? "en-US";
  const currency = workspace?.currency ?? "USD";

  async function handleUpdateStatus(id: string, status: InvoiceStatus) {
    try {
      await updateStatus(id, status);
      toast.success(`Invoice marked as ${status}`);
    } catch {
      toast.error("Failed to update invoice");
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeInvoice(id);
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete invoice");
    }
  }

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.items.reduce((s, item) => s + item.amount, 0), 0);

  const pendingCount = invoices.filter((i) => i.status !== "paid").length;

  return (
    <AppLayout title="Invoices">
      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[0, 1, 2].map((i) => (
            <BpBox key={i} className="p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </BpBox>
          ))}
        </div>
      ) : invoices.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <BpBox className="p-4">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Total Invoices</div>
            <div className="font-mono text-2xl font-bold">{invoices.length}</div>
          </BpBox>
          <BpBox className="p-4">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Pending</div>
            <div className="font-mono text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </BpBox>
          <BpBox className="p-4">
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Total Paid</div>
            <div className="font-mono text-2xl font-bold text-emerald-700">
              {formatCurrency(totalRevenue, currency, locale)}
            </div>
          </BpBox>
        </div>
      ) : null}

      <BpBox>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-foreground/20 hover:bg-transparent">
              <TableHead className={colHead}>Invoice #</TableHead>
              <TableHead className={colHead}>Client</TableHead>
              <TableHead className={colHead}>Issue Date</TableHead>
              <TableHead className={colHead}>Due Date</TableHead>
              <TableHead className={colHead}>Items</TableHead>
              <TableHead className={`${colHead} text-right`}>Total</TableHead>
              <TableHead className={colHead}>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-b border-foreground/8">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-3.5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <FileText className="size-8 opacity-20" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] tracking-wider uppercase opacity-50">No invoices yet</span>
                      <span className="text-xs opacity-40">Select transactions and click "Create Invoice" to get started</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice, idx) => {
                const total = invoice.items.reduce((s, i) => s + i.amount, 0);
                return (
                  <TableRow
                    key={invoice.id}
                    className="border-b border-foreground/8 hover:bg-muted/30 transition-colors stagger-item"
                    style={{ animationDelay: `${idx * 25}ms` } as React.CSSProperties}
                  >
                    <TableCell className="font-mono text-sm font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{invoice.clientName}</span>
                        {invoice.clientEmail && (
                          <span className="font-mono text-[10px] text-muted-foreground/60">{invoice.clientEmail}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {formatDate(invoice.issueDate, locale)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {formatDate(invoice.dueDate, locale)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {invoice.items.length}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(total, invoice.currency, locale)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 border rounded-sm ${STATUS_STYLES[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreHorizontal className="size-3.5" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-mono text-xs">
                          <DropdownMenuItem onClick={() => setPreviewInvoice(invoice)} className="gap-2">
                            <Eye className="size-3" /> View / Print
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, "sent")} className="gap-2">
                              <Send className="size-3" /> Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {invoice.status !== "paid" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(invoice.id, "paid")} className="gap-2">
                              <CheckCircle2 className="size-3" /> Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(invoice.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </BpBox>

      <InvoicePreviewDialog
        invoice={previewInvoice}
        workspaceName={workspace?.name ?? ""}
        locale={locale}
        onClose={() => setPreviewInvoice(null)}
      />
    </AppLayout>
  );
}
