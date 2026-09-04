import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice, InvoiceItem } from "@/types";

interface InvoiceFormDialogProps {
  open: boolean;
  items: InvoiceItem[];
  currency: string;
  locale: string;
  workspaceId: string;
  onSubmit: (invoice: Invoice) => Promise<void>;
  onCancel: () => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function InvoiceFormDialog({
  open,
  items,
  currency,
  locale,
  workspaceId,
  onSubmit,
  onCancel,
}: InvoiceFormDialogProps) {
  const issueDefault = today();
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `INV-${Date.now().toString().slice(-6)}`
  );
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(issueDefault);
  const [dueDate, setDueDate] = useState(() => addDays(issueDefault, 30));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const invoice: Invoice = {
        id: crypto.randomUUID(),
        workspaceId,
        invoiceNumber,
        clientName,
        clientEmail,
        clientAddress,
        issueDate,
        dueDate,
        items,
        notes,
        status: "draft",
        currency,
        createdAt: now,
        updatedAt: now,
      };
      await onSubmit(invoice);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-number" className="text-xs">Invoice #</Label>
              <Input
                id="inv-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="h-8 text-sm font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-issue" className="text-xs">Issue Date</Label>
              <Input
                id="inv-issue"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-due" className="text-xs">Due Date</Label>
            <Input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-mono tracking-wider uppercase text-muted-foreground">Client Details</Label>
            <Input
              placeholder="Client name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="h-8 text-sm"
            />
            <Input
              placeholder="Email address"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="h-8 text-sm"
            />
            <Textarea
              placeholder="Billing address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground">
              Line Items ({items.length})
            </span>
            <div className="rounded-md border overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.transactionId}
                  className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm truncate">{item.description}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatDate(item.date, locale)} · {item.categoryName}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-semibold shrink-0 ml-4">
                    {formatCurrency(item.amount, currency, locale)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs text-muted-foreground">Total</span>
              <span className="font-mono text-sm font-bold">
                {formatCurrency(total, currency, locale)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-notes" className="text-xs">Notes</Label>
            <Textarea
              id="inv-notes"
              placeholder="Payment terms, bank details, or any other notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Creating…" : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
