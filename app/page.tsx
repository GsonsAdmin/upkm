const stats = [
  ["Live Production", "0 / 0", "Waiting for batch"],
  ["Missing / Gaps", "0", "No exceptions"],
  ["Duplicates", "0", "No duplicate scans"],
  ["Invalid Scans", "0", "No invalid scans"],
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: 32 }}>
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.2, color: "#667085" }}>PRODUCTION COUNTER</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>Production Serial Tracking</h1>
            <p style={{ color: "#667085", marginBottom: 0 }}>Serial traceability, live production and batch reconciliation.</p>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fff", border: "1px solid #e4e7ec" }}>System Ready</div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {stats.map(([title, value, note]) => (
            <article key={title} style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 20 }}>
              <div style={{ color: "#667085", fontSize: 14 }}>{title}</div>
              <div style={{ fontSize: 30, fontWeight: 800, margin: "10px 0 4px" }}>{value}</div>
              <div style={{ color: "#667085", fontSize: 13 }}>{note}</div>
            </article>
          ))}
        </div>

        <section style={{ marginTop: 24, background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Production workflow</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {["Upload Brand PDF", "Create Batch", "Scan Serial", "Validate", "Reconcile"].map((step, index) => (
              <div key={step} style={{ padding: 18, borderRadius: 12, background: "#f8fafc", border: "1px solid #eaecf0" }}>
                <div style={{ fontSize: 12, color: "#667085" }}>STEP {index + 1}</div>
                <strong style={{ display: "block", marginTop: 8 }}>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <article style={{ background: "#111827", color: "white", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>OPERATOR STATION</div>
            <h2>Ready for scanner</h2>
            <p style={{ opacity: 0.8 }}>Connect the USB 2D barcode scanner and select an active production batch.</p>
          </article>
          <article style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, color: "#667085" }}>SUPERVISOR</div>
            <h2>Batch reconciliation</h2>
            <p style={{ color: "#667085" }}>Missing serials, duplicate attempts, invalid scans and lost/damaged sticker exceptions will be retained in the audit trail.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
