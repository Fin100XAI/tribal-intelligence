import AlertBanner from './ui/AlertBanner.jsx';

// The mandatory compliance statement, shown at the foot of every module.
export default function ComplianceNote() {
  return (
    <AlertBanner variant="compliance" title="Responsible AI · Human-in-the-Loop">
      AI outputs are decision-support indicators only. Final action remains with authorized government officials through
      human-in-the-loop review. All data on this screen is <span className="font-semibold">Simulated for PoC</span>.
    </AlertBanner>
  );
}
