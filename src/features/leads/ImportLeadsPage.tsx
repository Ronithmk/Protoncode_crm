// features/leads/ImportLeadsPage.tsx  →  /leads/import

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  Card, PageHeader, Button, Select,
  Table, Th, Td, Tr, SectionLabel, StatCard,
} from "../../components/ui";

// ─── TYPES ────────────────────────────────────────────────

type ImportStep = "upload" | "map" | "preview" | "importing" | "done";

type PreviewRow = {
  name: string; phone: string; email: string; source: string;
  status: "valid" | "duplicate" | "error"; error?: string;
};

type ImportRecord = {
  id: string; fileName: string; date: string;
  total: number; imported: number; skipped: number;
  status: "success" | "partial" | "failed";
  importedBy: string;
};

// ─── MOCK DATA ────────────────────────────────────────────

const PREVIEW_ROWS: PreviewRow[] = [
  { name:"Suresh Patel",   phone:"+91 99887 76655", email:"suresh@email.com",   source:"Meta Ads", status:"valid"     },
  { name:"Lakshmi Reddy",  phone:"+91 88776 65544", email:"lakshmi@email.com",  source:"Meta Ads", status:"valid"     },
  { name:"Anil Kumar",     phone:"+91 77665 54433", email:"anil@email.com",     source:"Walk-in",  status:"valid"     },
  { name:"Priya Sharma",   phone:"+91 98765 43210", email:"priya@email.com",    source:"Meta Ads", status:"duplicate", error:"Phone already exists (L002)" },
  { name:"",               phone:"+91 66554 43322", email:"",                   source:"WhatsApp", status:"error",     error:"Name is required"            },
  { name:"Rekha Iyer",     phone:"+91 55443 32211", email:"rekha@email.com",    source:"WhatsApp", status:"valid"     },
  { name:"Mohan Das",      phone:"+91 44332 21100", email:"mohan@email.com",    source:"Walk-in",  status:"valid"     },
  { name:"Sita Raman",     phone:"+91 33221 10099", email:"sita@email.com",     source:"Meta Ads", status:"valid"     },
];

const IMPORT_HISTORY: ImportRecord[] = [
  { id:"IMP001", fileName:"meta_leads_feb.csv",       date:"Feb 28, 2025", total:48, imported:44, skipped:4,  status:"partial",  importedBy:"Rajesh Kumar" },
  { id:"IMP002", fileName:"whatsapp_leads_feb.csv",   date:"Feb 22, 2025", total:31, imported:31, skipped:0,  status:"success",  importedBy:"Priya R" },
  { id:"IMP003", fileName:"bulk_leads_jan.xlsx",      date:"Jan 30, 2025", total:65, imported:58, skipped:7,  status:"partial",  importedBy:"Rajesh Kumar" },
  { id:"IMP004", fileName:"walk_in_jan.csv",          date:"Jan 15, 2025", total:22, imported:22, skipped:0,  status:"success",  importedBy:"Dev Admin" },
  { id:"IMP005", fileName:"leads_dec_corrupted.csv",  date:"Dec 28, 2024", total:30, imported:0,  skipped:30, status:"failed",   importedBy:"Priya R" },
];

// CSV columns as they'd appear in the uploaded file
const CSV_COLUMNS = ["full_name", "mobile", "email_id", "source_channel", "assigned_rm", "location"];
// CRM fields they map to
const CRM_FIELDS  = ["Name", "Phone", "Email", "Source", "Assigned To", "Center"];

// ─── STEP INDICATOR ───────────────────────────────────────

const STEPS = ["upload", "map", "preview", "importing", "done"] as const;
const STEP_LABELS: Record<string, string> = {
  upload: "Upload File", map: "Map Fields",
  preview: "Preview & Validate", importing: "Importing", done: "Complete",
};

const StepIndicator = ({ current }: { current: ImportStep }) => {
  const visibleSteps = STEPS.filter(s => s !== "importing");
  const currentIdx   = STEPS.indexOf(current);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleSteps.map((step, i) => {
        const stepIdx  = STEPS.indexOf(step);
        const isActive = step === current || (current === "importing" && step === "preview");
        const isDone   = stepIdx < currentIdx && current !== "importing";

        return (
          <div key={step} className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-700 border-2 transition-all",
              isActive && !isDone ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white" :
              isDone             ? "border-[var(--success-color)] bg-[var(--success-bg)] success-text" :
                                   "border-theme text-secondary"
            )}>
              {isDone ? "✓" : i + 1}
            </div>
            <span className={cn("text-[12px] font-600",
              isActive ? "text-primary" : isDone ? "success-text" : "text-secondary")}>
              {STEP_LABELS[step]}
            </span>
            {i < visibleSteps.length - 1 && (
              <span className={cn("mx-1 text-[12px]", isDone ? "success-text" : "text-secondary")}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── IMPORT PROGRESS ──────────────────────────────────────

const ImportProgress = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState("Validating rows…");
  const valid = PREVIEW_ROWS.filter(r => r.status === "valid").length;

  useEffect(() => {
    const phases = [
      { at:20,  label:"Checking for duplicates…" },
      { at:45,  label:"Creating lead records…"   },
      { at:70,  label:"Assigning to RMs…"        },
      { at:90,  label:"Sending welcome messages…"},
      { at:100, label:"Finalising import…"        },
    ];

    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 3, 100);
        const ph   = phases.find(x => x.at === next);
        if (ph) setPhase(ph.label);
        if (next >= 100) { clearInterval(interval); setTimeout(onDone, 600); }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
        style={{ background:"var(--hover-bg)", color:"var(--primary-color)" }}>
        ⬆
      </div>
      <p className="text-[18px] font-800 text-primary mb-1">Importing leads…</p>
      <p className="text-[13px] text-secondary mb-6">{phase}</p>

      <div className="max-w-sm mx-auto mb-2">
        <div className="h-2.5 bg-surface rounded-full overflow-hidden border border-theme">
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width:`${progress}%`, background:"var(--primary-color)" }} />
        </div>
      </div>
      <p className="text-[12px] text-secondary">{progress}% — importing {valid} leads</p>
    </Card>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────

export const ImportLeadsPage = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState<ImportStep>("upload");
  const [dragging, setDragging]   = useState(false);
  const [fileName, setFileName]   = useState("");
  const [fieldMap, setFieldMap]   = useState<Record<string, string>>(
    Object.fromEntries(CSV_COLUMNS.map((col, i) => [col, CRM_FIELDS[i] ?? ""]))
  );
  const [defaultSource, setDefaultSource] = useState("Meta Ads");
  const [defaultCentre, setDefaultCentre] = useState("Koramangala");
  const [showHistory, setShowHistory]     = useState(false);

  const valid   = PREVIEW_ROWS.filter(r => r.status === "valid").length;
  const dups    = PREVIEW_ROWS.filter(r => r.status === "duplicate").length;
  const errors  = PREVIEW_ROWS.filter(r => r.status === "error").length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setFileName(file.name); setStep("map"); }
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setFileName(file.name); setStep("map"); }
  };

  // History stats
  const totalImported = IMPORT_HISTORY.reduce((s, r) => s + r.imported, 0);
  const totalFiles    = IMPORT_HISTORY.length;
  const successRate   = Math.round(
    (IMPORT_HISTORY.filter(r => r.status === "success").length / totalFiles) * 100
  );

  return (
    <div className="p-6 max-w-[1100px] space-y-5">
      <PageHeader
        title="Import Leads"
        subtitle="Bulk-import leads from CSV or Excel files"
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowHistory(h => !h)}>
            {showHistory ? "Hide" : "View"} Import History
          </Button>
        }
      />

      {/* ── Import history (toggle) ── */}
      {showHistory && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Imported"  value={totalImported}  delta="All time"   deltaType="up" />
            <StatCard label="Import Sessions" value={totalFiles}                                       />
            <StatCard label="Success Rate"    value={`${successRate}%`} delta="Clean imports" deltaType="up" />
          </div>

          <Card>
            <div className="px-5 py-4 card-header">
              <p className="text-[14px] font-700 text-primary">Import History</p>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>File</Th><Th>Date</Th><Th>Total</Th>
                  <Th>Imported</Th><Th>Skipped</Th><Th>By</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {IMPORT_HISTORY.map(rec => (
                  <Tr key={rec.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        <span className="text-[12px] font-600 text-primary">{rec.fileName}</span>
                      </div>
                    </Td>
                    <Td className="text-secondary">{rec.date}</Td>
                    <Td className="font-600 text-primary">{rec.total}</Td>
                    <Td className="success-text font-600">{rec.imported}</Td>
                    <Td className="warning-text font-600">{rec.skipped}</Td>
                    <Td className="text-secondary">{rec.importedBy}</Td>
                    <Td>
                      <span className={cn("text-[10px] font-700 px-2 py-0.5 rounded-full",
                        rec.status === "success" ? "success-text success-bg" :
                        rec.status === "partial" ? "warning-text warning-bg" :
                        "danger-text danger-bg")}>
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {/* ── Step indicator ── */}
      {step !== "done" && <StepIndicator current={step} />}

      {/* ═══════════ STEP: Upload ═══════════ */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-14 text-center transition-all cursor-pointer",
              dragging
                ? "border-[var(--primary-color)] bg-[var(--hover-bg)]"
                : "border-theme hover-theme hover:border-[var(--primary-color)]"
            )}
          >
            <div className="text-5xl mb-4">{dragging ? "📂" : "⬆"}</div>
            <p className="text-[16px] font-700 text-primary mb-1.5">
              {dragging ? "Drop to upload" : "Drag your file here"}
            </p>
            <p className="text-[13px] text-secondary mb-6">
              CSV or Excel (.xlsx) · Max 5 MB · Up to 1,000 rows per import
            </p>
            <label className="cursor-pointer">
              <span className="px-6 py-2.5 rounded-xl bg-[var(--primary-color)] text-white text-[13px] font-600 hover:opacity-90 transition-opacity">
                Browse File
              </span>
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {/* Template + column guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-700 text-primary">Download Template</p>
                  <p className="text-[12px] text-secondary mt-0.5">Pre-formatted CSV with all required columns</p>
                </div>
                <Button variant="secondary" size="sm">⬇ Download CSV</Button>
              </div>
              <div className="px-5 pb-4">
                <p className="text-[11px] font-700 text-secondary uppercase tracking-wider mb-2">Columns</p>
                <div className="flex flex-wrap gap-2">
                  {["Name *", "Phone *", "Source *", "Email", "Stage", "Assigned To", "Center"].map(col => (
                    <span key={col} className={cn("text-[11px] px-2 py-0.5 rounded-md font-600",
                      col.includes("*")
                        ? "bg-[var(--primary-color)] text-white opacity-80"
                        : "bg-surface border border-theme text-secondary")}>
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <SectionLabel className="mb-3">Import Rules</SectionLabel>
              <ul className="space-y-2">
                {[
                  ["◈", "Duplicate phones are automatically skipped"],
                  ["◈", "Invalid rows are flagged for review before import"],
                  ["◈", "Stage defaults to 'Lead Created' if empty"],
                  ["◈", "Source defaults to your selection below if missing"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-start gap-2 text-[12px] text-secondary">
                    <span className="text-[var(--primary-color)] flex-shrink-0 mt-0.5">{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════ STEP: Map Fields ═══════════ */}
      {step === "map" && (
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 card-header flex items-center justify-between">
              <div>
                <p className="text-[14px] font-700 text-primary">Map CSV Columns → CRM Fields</p>
                <p className="text-[12px] text-secondary mt-0.5">{fileName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>← Re-upload</Button>
            </div>
            <div className="p-5 space-y-3">
              {CSV_COLUMNS.map(col => (
                <div key={col} className="flex items-center gap-4">
                  <div className="flex-1 bg-surface border border-theme rounded-lg px-4 py-2.5">
                    <p className="text-[12px] font-600 text-primary font-mono">{col}</p>
                    <p className="text-[10px] text-secondary mt-0.5">Column in your file</p>
                  </div>
                  <span className="text-secondary">→</span>
                  <div className="flex-1">
                    <Select
                      value={fieldMap[col] ?? ""}
                      onChange={e => setFieldMap(p => ({ ...p, [col]: e.target.value }))}
                    >
                      <option value="">Skip this column</option>
                      {CRM_FIELDS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Defaults */}
          <Card className="p-5">
            <SectionLabel className="mb-3">Defaults for Missing Values</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Default Source" value={defaultSource} onChange={e => setDefaultSource(e.target.value)}>
                <option>Meta Ads</option>
                <option>WhatsApp</option>
                <option>Walk-in</option>
              </Select>
              <Select label="Default Centre" value={defaultCentre} onChange={e => setDefaultCentre(e.target.value)}>
                <option>Koramangala</option>
                <option>Indiranagar</option>
                <option>Whitefield</option>
              </Select>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStep("upload")}>Back</Button>
            <Button variant="primary" onClick={() => setStep("preview")}>
              Preview Import →
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP: Preview ═══════════ */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-theme rounded-2xl px-5 py-4">
              <p className="text-[28px] font-800 success-text">{valid}</p>
              <p className="text-[12px] text-secondary mt-0.5">Ready to import</p>
            </div>
            <div className="bg-card border border-theme rounded-2xl px-5 py-4">
              <p className="text-[28px] font-800 warning-text">{dups}</p>
              <p className="text-[12px] text-secondary mt-0.5">Duplicates (will skip)</p>
            </div>
            <div className="bg-card border border-theme rounded-2xl px-5 py-4">
              <p className="text-[28px] font-800 danger-text">{errors}</p>
              <p className="text-[12px] text-secondary mt-0.5">Errors (fix &amp; re-upload)</p>
            </div>
          </div>

          {/* Rows table */}
          <Card>
            <div className="px-5 py-3.5 card-header flex items-center justify-between">
              <div>
                <p className="text-[13px] font-700 text-primary">{fileName}</p>
                <p className="text-[11px] text-secondary">{PREVIEW_ROWS.length} rows detected</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep("map")}>← Remap</Button>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th><Th>Name</Th><Th>Phone</Th><Th>Email</Th>
                  <Th>Source</Th><Th>Status</Th><Th>Note</Th>
                </tr>
              </thead>
              <tbody>
                {PREVIEW_ROWS.map((row, i) => (
                  <Tr key={i} className={row.status !== "valid" ? "opacity-60" : undefined}>
                    <Td className="text-secondary text-[11px]">{i + 1}</Td>
                    <Td className="font-600 text-primary">
                      {row.name || <span className="text-secondary italic">—</span>}
                    </Td>
                    <Td className="font-mono text-secondary text-[12px]">{row.phone}</Td>
                    <Td className="text-secondary">{row.email || "—"}</Td>
                    <Td className="text-secondary">{row.source}</Td>
                    <Td>
                      {row.status === "valid" ? (
                        <span className="text-[10px] font-700 px-2 py-0.5 rounded-full success-text success-bg">
                          Valid
                        </span>
                      ) : row.status === "duplicate" ? (
                        <span className="text-[10px] font-700 px-2 py-0.5 rounded-full warning-text warning-bg">
                          Duplicate
                        </span>
                      ) : (
                        <span className="text-[10px] font-700 px-2 py-0.5 rounded-full danger-text danger-bg">
                          Error
                        </span>
                      )}
                    </Td>
                    <Td className="text-secondary text-[11px]">{row.error ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <div className="flex justify-between items-center">
            <p className="text-[12px] text-secondary">
              {errors > 0 && (
                <span className="danger-text font-600">{errors} row{errors > 1 ? "s" : ""} with errors will be skipped. </span>
              )}
              {valid} leads will be created.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep("upload")}>Cancel</Button>
              <Button variant="primary" onClick={() => setStep("importing")}>
                Import {valid} Leads →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ STEP: Importing (progress) ═══════════ */}
      {step === "importing" && (
        <ImportProgress onDone={() => setStep("done")} />
      )}

      {/* ═══════════ STEP: Done ═══════════ */}
      {step === "done" && (
        <div className="space-y-5">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
              style={{ background:"var(--success-bg)", color:"var(--success-color)" }}>
              ✓
            </div>
            <h2 className="text-[22px] font-800 text-primary mb-2">Import Complete!</h2>
            <p className="text-[14px] text-secondary mb-6">
              <span className="success-text font-700">{valid} leads</span> imported successfully ·{" "}
              <span className="warning-text font-700">{dups} duplicates</span> skipped ·{" "}
              <span className="danger-text font-700">{errors} errors</span> skipped
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => {
                setStep("upload"); setFileName("");
              }}>
                Import Another File
              </Button>
              <Button variant="primary" onClick={() => navigate("/leads")}>
                View Leads →
              </Button>
            </div>
          </Card>

          {/* Import summary card */}
          <Card className="p-5">
            <SectionLabel className="mb-4">Import Summary</SectionLabel>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:"File",       value: fileName },
                { label:"Total Rows", value: PREVIEW_ROWS.length },
                { label:"Source",     value: defaultSource },
                { label:"Centre",     value: defaultCentre },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-[11px] text-secondary uppercase tracking-wide mb-0.5">{s.label}</p>
                  <p className="text-[13px] font-600 text-primary">{s.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
