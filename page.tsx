import AuthGate from "@/components/AuthGate";
import Shell from "@/components/Shell";
import WeeklyReportClient from "./ui/WeeklyReportClient";

export default function WeeklyReportPage() {
  return (
    <AuthGate>
      <Shell>
        <WeeklyReportClient />
      </Shell>
    </AuthGate>
  );
}
