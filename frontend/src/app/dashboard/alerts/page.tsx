import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerts & Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure automated alerts for sentiment shifts and compliance events
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card rounded-2xl p-6 border-border/30">
          <div className="text-2xl mb-3">📊</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Sentiment Threshold Alerts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Get notified when market sentiment shifts beyond your defined
            thresholds — catches bearish turns and bullish breakouts.
          </p>
          <Button
            className="w-full bg-gradient-to-r from-[oklch(0.70_0.18_250)] to-[oklch(0.60_0.20_280)] hover:opacity-90 text-white border-0"
            disabled
          >
            Configure Alerts (Coming Soon)
          </Button>
        </Card>

        <Card className="glass-card rounded-2xl p-6 border-border/30">
          <div className="text-2xl mb-3">🔍</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Source Credibility Alerts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor when source credibility drops or conflicting reports are
            detected across multiple outlets.
          </p>
          <Button
            className="w-full bg-gradient-to-r from-[oklch(0.72_0.20_45)] to-[oklch(0.65_0.25_25)] hover:opacity-90 text-white border-0"
            disabled
          >
            Set Credibility Rules (Coming Soon)
          </Button>
        </Card>

        <Card className="glass-card rounded-2xl p-6 border-border/30">
          <div className="text-2xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Regulatory Compliance Alerts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Automated monitoring for portfolio concentration limits, sector
            diversification rules, and other regulatory constraints.
          </p>
          <Button
            className="w-full bg-gradient-to-r from-[oklch(0.65_0.20_160)] to-[oklch(0.70_0.15_80)] hover:opacity-90 text-white border-0"
            disabled
          >
            Configure Compliance Rules (Coming Soon)
          </Button>
        </Card>

        <Card className="glass-card rounded-2xl p-6 border-border/30">
          <div className="text-2xl mb-3">🔔</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Recent Notifications</h2>
          <p className="text-muted-foreground text-center py-8">
            No recent notifications
          </p>
        </Card>
      </div>
    </div>
  );
}