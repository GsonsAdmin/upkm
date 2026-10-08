"use client";

import { useEffect, useRef, useState } from "react";

type SerialRow = { page: number; sticker: string; gm: string };

const workflow = [
  ["01", "Supplier serial master", "Import the brand PDF and verify every sticker."],
  ["02", "Create production batch", "Assign brand, model, line and planned quantity."],
  ["03", "Scan at station", "USB 2D scanner is the primary input."],
  ["04", "Validate instantly", "Accept, duplicate, invalid and sequence-gap checks."],
  ["05", "Reconcile", "Close the batch only after every serial is accounted for."],
];

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="stat-card"><div className="eyebrow">{label}</div><div className="stat-value">{value}</div><div className="muted">{note}</div></article>;
}

export default function Home() {
  const [tab, setTab] = useState<"dashboard" | "import" | "operator">("dashboard");
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [serials, setSerials] = useState<SerialRow[]>([]);
  const [scan, setScan] = useState("");
  const [lastScan, setLastScan] = useState<{ value: string; status: string } | null>(null);
  const [scanned, setScanned] = useState<string[]>([]);
  const scannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (tab === "operator") scannerRef.current?.focus(); }, [tab]);

  async function importPdf(file: File) {
    setImporting(true); setImportError(""); setSerials([]); setFileName(file.name);
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const extracted: SerialRow[] = [];
      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        const page = await pdf.getPage(pageNo);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(" ");
        const pMatches = [...text.matchAll(/P-(\d+)/g)].map(m => `P-${m[1]}`);
        const gMatches = [...text.matchAll(/GM(\d+)/g)].map(m => `GM${m[1]}`);
        for (let i = 0; i < Math.min(4, pMatches.length, gMatches.length); i++) {
          extracted.push({ page: pageNo, sticker: pMatches[i], gm: gMatches[i] });
        }
      }
      setSerials(extracted);
      if (!extracted.length) throw new Error("No P-number / GM serial pairs were found in this PDF.");
    } catch (e: any) {
      setImportError(e?.message || "Could not read the PDF.");
    } finally { setImporting(false); }
  }

  function handleScan(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const known = serials.length ? serials.find(s => s.gm === normalized || s.sticker === normalized) : null;
    const already = scanned.includes(normalized);
    if (already) setLastScan({ value: normalized, status: "DUPLICATE" });
    else if (serials.length && !known) setLastScan({ value: normalized, status: "INVALID" });
    else { setScanned(prev => [...prev, normalized]); setLastScan({ value: normalized, status: "ACCEPTED" }); }
    setScan(""); requestAnimationFrame(() => scannerRef.current?.focus());
  }

  const production = serials.length ? scanned.filter(v => serials.some(s => s.gm === v || s.sticker === v)).length : scanned.length;
  const percent = serials.length ? Math.round((production / serials.length) * 1000) / 10 : 0;

  return (
    <main className="app-shell">
      <div className="topbar"><div><div className="brand-kicker">PRODUCTION COUNTER</div><div className="brand-title">Serial Traceability System</div></div><div className="ready-pill"><span /> System Ready</div></div>
      <nav className="nav-tabs"><button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>Supervisor Dashboard</button><button className={tab === "import" ? "active" : ""} onClick={() => setTab("import")}>Supplier Serial Import</button><button className={tab === "operator" ? "active" : ""} onClick={() => setTab("operator")}>Operator Station</button></nav>

      {tab === "dashboard" && <>
        <section className="hero"><div><div className="eyebrow">LIVE PRODUCTION CONTROL</div><h1>Production Serial Tracking</h1><p>Track every supplier-issued sticker from PDF import to final batch reconciliation.</p></div><div className="hero-chip">Bajaj · RD60 test dataset</div></section>
        <section className="stats-grid"><Stat label="Live Production" value={`${production} / ${serials.length || 0}`} note={serials.length ? `${percent}% complete` : "Waiting for supplier serial master"} /><Stat label="Missing / Gaps" value={serials.length ? String(Math.max(serials.length - production, 0)) : "0"} note="Pending reconciliation" /><Stat label="Duplicates" value={lastScan?.status === "DUPLICATE" ? "1" : "0"} note="Duplicate attempts retained" /><Stat label="Invalid Scans" value={lastScan?.status === "INVALID" ? "1" : "0"} note="Rejected before production count" /></section>
        <section className="panel"><div className="section-head"><div><div className="eyebrow">WORKFLOW</div><h2>Production control flow</h2></div><button className="primary" onClick={() => setTab("import")}>Import Supplier PDF</button></div><div className="workflow-grid">{workflow.map(([n,t,d]) => <div className="workflow-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section>
        <section className="two-col"><div className="dark-panel"><div className="eyebrow">OPERATOR STATION</div><h2>{lastScan ? lastScan.status : "Ready for scanner"}</h2><p>Use a USB 2D scanner in HID/keyboard mode with an Enter suffix. The focused input accepts the scanner output without mouse interaction.</p><button className="light-button" onClick={() => setTab("operator")}>Open Operator Station</button></div><div className="panel"><div className="eyebrow">CURRENT SUPPLIER FILE</div><h2>{fileName || "No PDF imported"}</h2><p className="muted">{serials.length ? `${serials.length.toLocaleString()} serial records extracted.` : "Import the Bajaj RD60 PDF to start the first real test."}</p>{serials.length > 0 && <div className="mini-table"><b>{serials[0].sticker}</b><span>{serials[0].gm}</span><b>{serials.at(-1)?.sticker}</b><span>{serials.at(-1)?.gm}</span></div>}</div></section>
      </>}

      {tab === "import" && <section className="panel import-panel"><div className="eyebrow">SUPPLIER SERIAL MASTER</div><h1>Import brand PDF</h1><p className="muted">The first production test is the Bajaj RD60 file. The importer reads the printed P-number and GM serial from each PDF page. QR payload verification will be added to the final import validation.</p><label className="dropzone"><input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && importPdf(e.target.files[0])} /><strong>{importing ? "Reading PDF…" : "Choose supplier PDF"}</strong><span>{fileName || "PDF up to the supplier batch size"}</span></label>{importError && <div className="alert error">{importError}</div>}{serials.length > 0 && <><div className="import-summary"><div><span>Pages</span><strong>{new Set(serials.map(s => s.page)).size.toLocaleString()}</strong></div><div><span>Serials</span><strong>{serials.length.toLocaleString()}</strong></div><div><span>First</span><strong>{serials[0].gm}</strong></div><div><span>Last</span><strong>{serials.at(-1)?.gm}</strong></div></div><div className="table-wrap"><table><thead><tr><th>Page</th><th>Sticker</th><th>GM Serial</th></tr></thead><tbody>{serials.slice(0, 20).map(s => <tr key={`${s.page}-${s.sticker}`}><td>{s.page}</td><td>{s.sticker}</td><td>{s.gm}</td></tr>)}</tbody></table></div><p className="muted small">Showing the first 20 records. Full extraction is held in memory for this test build; the next database migration will persist the complete import.</p></>}</section>}

      {tab === "operator" && <section className="operator-layout"><div className="operator-main"><div className="eyebrow">OPERATOR STATION · USB 2D SCANNER</div><h1>Scan Serial</h1><p className="muted">Keep this page focused. Scan the sticker and the scanner should automatically send Enter.</p><div className="counter">{production} <span>/ {serials.length || "—"}</span></div><div className="progress"><i style={{ width: `${Math.min(percent,100)}%` }} /></div><div className="scan-box"><div className="eyebrow">SCAN INPUT</div><input ref={scannerRef} autoFocus value={scan} onChange={e => setScan(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleScan(scan); }} placeholder="Ready for USB scanner…" /><button className="primary" onClick={() => handleScan(scan)}>Validate Scan</button></div>{lastScan && <div className={`scan-result ${lastScan.status.toLowerCase()}`}><strong>{lastScan.status}</strong><span>{lastScan.value}</span></div>}</div><aside className="operator-side"><div className="panel"><div className="eyebrow">BATCH</div><h2>Bajaj · RD60</h2><p className="muted">Supplier file: {fileName || "Not imported"}</p><div className="side-stat"><span>Target</span><strong>{serials.length || 0}</strong></div><div className="side-stat"><span>Produced</span><strong>{production}</strong></div><div className="side-stat"><span>Remaining</span><strong>{Math.max((serials.length || 0)-production,0)}</strong></div></div><div className="dark-panel"><div className="eyebrow">LAST SCAN</div><h2>{lastScan?.status || "Waiting"}</h2><p>{lastScan?.value || "Scan a supplier sticker to validate it."}</p></div></aside></section>}
    </main>
  );
}
