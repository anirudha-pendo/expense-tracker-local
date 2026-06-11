import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, CheckCircle2, Sparkles, TrendingUp, MessageSquare } from "lucide-react";

type Step = "prompt" | "confirm" | "success";

interface AgentWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined: () => void;
}

export function AgentWaitlistDialog({ open, onOpenChange, onJoined }: AgentWaitlistDialogProps) {
  const [step, setStep] = useState<Step>("prompt");

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setTimeout(() => setStep("prompt"), 200);
    }
    onOpenChange(isOpen);
  }

  function handleJoinClick() {
    setStep("confirm");
  }

  function handleConfirm() {
    setStep("success");
    onJoined();
  }

  function handleBack() {
    setStep("prompt");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={step !== "confirm"}>
        {step === "prompt" && <PromptStep onJoin={handleJoinClick} onDismiss={() => handleOpenChange(false)} />}
        {step === "confirm" && <ConfirmStep onConfirm={handleConfirm} onBack={handleBack} />}
        {step === "success" && <SuccessStep onClose={() => handleOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function PromptStep({ onJoin, onDismiss }: { onJoin: () => void; onDismiss: () => void }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <BrainCircuit className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base">Finance Agent</DialogTitle>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary leading-none">
                Coming Soon
              </span>
            </div>
            <DialogDescription className="mt-0.5 text-xs">
              Your AI-powered financial assistant
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex flex-col gap-3 py-1">
        <p className="text-sm text-muted-foreground">
          Finance Agent will analyze your spending, surface insights, and answer questions about your finances — all in natural language.
        </p>
        <div className="flex flex-col gap-2">
          <FeatureRow icon={Sparkles} label="Personalized spending insights" />
          <FeatureRow icon={TrendingUp} label="Predictive budget alerts" />
          <FeatureRow icon={MessageSquare} label="Ask anything about your finances" />
        </div>
      </div>

      <DialogFooter className="mt-2">
        <Button variant="outline" onClick={onDismiss}>
          Maybe later
        </Button>
        <Button onClick={onJoin}>
          Join Waitlist
        </Button>
      </DialogFooter>
    </>
  );
}

function ConfirmStep({ onConfirm, onBack }: { onConfirm: () => void; onBack: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm your spot</DialogTitle>
        <DialogDescription>
          You'll be among the first to access Finance Agent when it launches. We'll notify you as soon as early access opens.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="outline" onClick={onBack}>
          Go back
        </Button>
        <Button onClick={onConfirm}>
          Yes, sign me up
        </Button>
      </DialogFooter>
    </>
  );
}

function SuccessStep({ onClose }: { onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <DialogTitle className="text-base">You're on the list!</DialogTitle>
            <DialogDescription className="mt-1">
              We'll reach out as soon as Finance Agent is ready for early access.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <DialogFooter showCloseButton={false}>
        <Button onClick={onClose} className="w-full sm:w-auto">
          Done
        </Button>
      </DialogFooter>
    </>
  );
}

function FeatureRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span>{label}</span>
    </div>
  );
}
