import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  draft: "border-yellow-500/30 text-yellow-600 bg-yellow-50",
  sent: "border-blue-500/30 text-blue-600 bg-blue-50",
  paid: "border-emerald-600/30 text-emerald-700 bg-emerald-50",
};

interface InvoicePreviewDialogProps {
  invoice: Invoice | null;
  workspaceName: string;
  locale: string;
  onClose: () => void;
}

export function InvoicePreviewDialog({ invoice, workspaceName, locale, onClose }: InvoicePreviewDialogProps) {
  if (!invoice) return null;

  const total = invoice.items.reduce((s, i) => s + i.amount, 0);

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={!!invoice} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Preview</DialogTitle>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 print:hidden">
              <Printer className="size-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Printable invoice body */}
        <div id="invoice-print-area" className="p-6 border rounded-lg bg-white text-foreground space-y-6 print:border-none print:p-0 print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{workspaceName}</h1>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-semibold">{invoice.invoiceNumber}</div>
              <span
                className={`inline-flex font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 border rounded-sm ${STATUS_STYLES[invoice.status]}`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Issue Date</span>
              <span>{formatDate(invoice.issueDate, locale)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Due Date</span>
              <span>{formatDate(invoice.dueDate, locale)}</span>
            </div>
          </div>

          {/* Bill To */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Bill To</span>
            <span className="font-semibold">{invoice.clientName}</span>
            {invoice.clientEmail && <span className="text-sm text-muted-foreground">{invoice.clientEmail}</span>}
            {invoice.clientAddress && (
              <span className="text-sm text-muted-foreground whitespace-pre-line">{invoice.clientAddress}</span>
            )}
          </div>

          {/* Line items */}
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Description</th>
                  <th className="text-left px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Date</th>
                  <th className="text-left px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Category</th>
                  <th className="text-right px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={item.transactionId} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{formatDate(item.date, locale)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.categoryName}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                      {formatCurrency(item.amount, invoice.currency, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/40">
                  <td colSpan={3} className="px-3 py-2 font-mono text-xs font-semibold text-right">Total</td>
                  <td className="px-3 py-2 text-right font-mono font-bold tabular-nums">
                    {formatCurrency(total, invoice.currency, locale)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Notes</span>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
