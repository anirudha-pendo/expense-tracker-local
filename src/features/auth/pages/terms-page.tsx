import { Link } from "react-router-dom";
import { BpBox } from "@/shared/components/bp-box";

export function TermsPage() {
  return (
    <div className="min-h-svh bg-background flex flex-col items-center justify-center p-12">
      <div className="mb-10 flex flex-col items-center gap-1 section-enter">
        <span className="font-mono text-[11px] tracking-[0.35em] uppercase text-muted-foreground">
          — Ledger —
        </span>
        <p className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
          Local finance tracking
        </p>
      </div>

      <BpBox className="w-full max-w-[680px] section-enter" style={{ animationDelay: "40ms" }}>
        <div className="border-b border-foreground px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Terms and Conditions
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/40">last updated Jun 2026</span>
        </div>

        <div className="p-5 flex flex-col gap-6 text-sm leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By creating an account and using Ledger, you agree to be bound by these Terms and
              Conditions. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              2. Local Data Storage
            </h2>
            <p className="text-muted-foreground">
              Ledger is a fully local application. All financial data you enter — including
              transactions, budgets, goals, and account information — is stored exclusively on your
              device. We do not collect, transmit, or have access to any of your personal or
              financial data.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              3. User Responsibilities
            </h2>
            <p className="text-muted-foreground">
              You are solely responsible for maintaining the security of your device and the data
              stored on it. You agree to use Ledger only for lawful purposes and in a manner
              consistent with all applicable laws and regulations.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              4. No Financial Advice
            </h2>
            <p className="text-muted-foreground">
              Ledger is a personal finance tracking tool only. Nothing within the application
              constitutes financial, investment, legal, or tax advice. Always consult a qualified
              professional before making financial decisions.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              5. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground">
              Ledger is provided "as is" without warranties of any kind, either express or implied.
              We do not guarantee that the application will be error-free, uninterrupted, or that
              calculations will be accurate for all use cases.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              6. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, we shall not be liable for any indirect,
              incidental, special, or consequential damages arising out of or in connection with
              your use of Ledger, including any loss of data.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              7. Changes to Terms
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of Ledger after
              changes are posted constitutes your acceptance of the revised terms.
            </p>
          </section>
        </div>

        <div className="border-t border-foreground px-5 py-3">
          <p className="font-mono text-[10px] text-muted-foreground">
            <Link
              to="/sign-up"
              className="text-foreground underline underline-offset-2 hover:no-underline transition-all duration-150"
            >
              Back to sign up
            </Link>
          </p>
        </div>
      </BpBox>
    </div>
  );
}
