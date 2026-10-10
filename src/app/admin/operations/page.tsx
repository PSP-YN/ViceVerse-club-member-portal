import OperationsPage from "../../dashboard/operations/page";

export const metadata = {
  title: "Admin Operations Control Room | ViceVerse",
};

export default function AdminOperationsPage() {
  // Reuse the excellent operations dashboard built by Bidappa,
  // wrapped in the admin layout context.
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-[#120924] border border-[#00F0FF]/30 p-4 rounded-xl text-[#00F0FF] font-hud text-xs tracking-wider uppercase mb-8">
        ADMINISTRATIVE OVERRIDE ACTIVE // FULL TELEMETRY ACCESS GRANTED
      </div>
      <OperationsPage />
    </div>
  );
}
