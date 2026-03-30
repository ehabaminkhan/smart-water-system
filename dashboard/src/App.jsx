import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://smart-water-system-production.up.railway.app"

export default function App() {
  const [latest, setLatest]           = useState(null)
  const [billing, setBilling]         = useState(null)
  const [valve, setValve]             = useState("open")
  const [flowHistory, setFlowHistory] = useState([])
  const [leakage, setLeakage]         = useState(false)
  const [time, setTime]               = useState(new Date())

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res  = await axios.get(`${API}/api/sensor-data/latest`)
        const data = res.data
        setLatest(data)
        setFlowHistory(prev => [...prev, data.flow_litres].slice(-8))
        setLeakage(data.valve_open === 0 && data.pressure_kpa < 50)
      } catch (err) {}
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/billing`)
        if (res.data.length > 0) setBilling(res.data[0])
      } catch (err) {}
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/valve/latest`)
        setValve(res.data.command)
      } catch (err) {}
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const sendValveCommand = async (command) => {
    try {
      await axios.post(`${API}/api/valve`, { command })
      setValve(command)
    } catch (err) {
      alert("Could not send valve command")
    }
  }

  const calculateBill = async () => {
    if (!latest) return
    try {
      const res = await axios.post(`${API}/api/billing/calculate`, {
        total_litres   : latest.total_litres,
        price_per_litre: 50
      })
      setBilling(res.data)
    } catch (err) {
      alert("Could not calculate bill")
    }
  }

  const maxFlow = Math.max(...flowHistory, 0.01)

  return (
    <div style={{
      minHeight  : "100vh",
      width      : "100%",
      background : "#0f172a",
      color      : "#e2e8f0",
      fontFamily : "system-ui, sans-serif",
      boxSizing  : "border-box",
      padding    : "0",
      margin     : "0"
    }}>

      {/* Top navbar */}
      <div style={{
        background   : "#1e293b",
        borderBottom : "1px solid #334155",
        padding      : "12px 24px",
        display      : "flex",
        justifyContent: "space-between",
        alignItems   : "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "#0ea5e9", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px"
          }}>💧</div>
          <div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "15px", color: "#f1f5f9" }}>Smart water system</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Distribution & automated billing</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
              {time.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {time.toLocaleTimeString('en-PK')}
            </p>
          </div>
          <div style={{
            padding    : "6px 14px",
            borderRadius: "20px",
            fontSize   : "12px",
            fontWeight : "500",
            background : latest ? "#064e3b" : "#1e293b",
            color      : latest ? "#34d399" : "#64748b",
            border     : latest ? "1px solid #065f46" : "1px solid #334155"
          }}>
            {latest ? "● Pi connected" : "○ Waiting for Pi"}
          </div>
        </div>
      </div>

      {/* Team banner */}
      <div style={{
        background: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Final year project by</span>
        {["Ehab Amin Khan Yousafzai", "Huraiz Hayat", "Umer Rashid Kiyani"].map((name, i) => (
          <span key={i} style={{
            fontSize: "11px", fontWeight: "500", color: "#94a3b8",
            padding: "2px 10px", background: "#0f172a",
            borderRadius: "20px", border: "1px solid #334155"
          }}>{name}</span>
        ))}
      </div>

      {/* Main content */}
      <div style={{ padding: "20px 24px" }}>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "14px", marginBottom: "20px" }}>

          <StatCard
            label="Flow this second"
            value={latest ? latest.flow_litres.toFixed(4) : "—"}
            unit="L / sec"
            color="#0ea5e9"
            icon="🌊"
          />
          <StatCard
            label="Total flowed today"
            value={latest ? latest.total_litres.toFixed(3) : "—"}
            unit="litres"
            color="#8b5cf6"
            icon="📊"
          />
          <StatCard
            label="Pipe pressure"
            value={latest ? latest.pressure_kpa.toFixed(0) : "—"}
            unit="kPa"
            color="#f59e0b"
            icon="🔧"
          />
          <StatCard
            label="Leakage status"
            value={leakage ? "LEAK!" : "No leak"}
            unit={valve === "close" ? "valve closed" : "valve open"}
            color={leakage ? "#ef4444" : "#10b981"}
            icon={leakage ? "⚠️" : "✅"}
            alert={leakage}
          />
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>

          {/* Flow chart */}
          <div style={{
            background  : "#1e293b",
            borderRadius: "12px",
            border      : "1px solid #334155",
            padding     : "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>Flow rate history</p>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Last 8 readings</span>
            </div>

            {flowHistory.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", padding: "20px 0" }}>Waiting for Pi data...</p>
            ) : (
              flowHistory.map((val, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", width: "24px", textAlign: "right" }}>{flowHistory.length - i}s</span>
                  <div style={{ flex: 1, height: "10px", background: "#0f172a", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{
                      width     : `${Math.max((val / maxFlow) * 100, val > 0 ? 2 : 0)}%`,
                      height    : "100%",
                      background: `linear-gradient(90deg, #0ea5e9, #38bdf8)`,
                      borderRadius: "5px",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", width: "70px", textAlign: "right" }}>{val.toFixed(4)} L</span>
                </div>
              ))
            )}

            {/* Total summary */}
            <div style={{
              marginTop  : "16px",
              padding    : "12px",
              background : "#0f172a",
              borderRadius: "8px",
              display    : "flex",
              justifyContent: "space-between"
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Total flowed</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "600", color: "#0ea5e9" }}>
                  {latest ? latest.total_litres.toFixed(3) : "0.000"} L
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Current pressure</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "600", color: "#f59e0b" }}>
                  {latest ? latest.pressure_kpa.toFixed(0) : "0"} kPa
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Bill so far</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "600", color: "#8b5cf6" }}>
                  Rs. {latest ? (latest.total_litres * 50).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Right panel — valve + billing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Valve control */}
            <div style={{
              background  : "#1e293b",
              borderRadius: "12px",
              border      : "1px solid #334155",
              padding     : "20px"
            }}>
              <p style={{ margin: "0 0 14px 0", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>Valve control</p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Current status</span>
                <span style={{
                  fontSize: "12px", padding: "4px 14px", borderRadius: "20px", fontWeight: "600",
                  background: valve === "open" ? "#064e3b" : "#450a0a",
                  color     : valve === "open" ? "#34d399" : "#fca5a5",
                  border    : valve === "open" ? "1px solid #065f46" : "1px solid #7f1d1d"
                }}>
                  {valve === "open" ? "● Open" : "● Closed"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button onClick={() => sendValveCommand("open")}
                  style={{
                    padding: "10px", border: "1px solid #065f46",
                    borderRadius: "8px", background: valve === "open" ? "#064e3b" : "transparent",
                    color: "#34d399", fontSize: "13px", cursor: "pointer", fontWeight: "500"
                  }}>
                  Open valve
                </button>
                <button onClick={() => sendValveCommand("close")}
                  style={{
                    padding: "10px", border: "1px solid #7f1d1d",
                    borderRadius: "8px", background: valve === "close" ? "#450a0a" : "transparent",
                    color: "#fca5a5", fontSize: "13px", cursor: "pointer", fontWeight: "500"
                  }}>
                  Close valve
                </button>
              </div>
            </div>

            {/* Billing */}
            <div style={{
              background  : "#1e293b",
              borderRadius: "12px",
              border      : "1px solid #334155",
              padding     : "20px",
              flex        : 1
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>Billing</p>
                <button onClick={calculateBill}
                  style={{
                    fontSize: "12px", padding: "5px 14px",
                    border: "1px solid #0ea5e9", borderRadius: "20px",
                    background: "transparent", color: "#0ea5e9",
                    cursor: "pointer", fontWeight: "500"
                  }}>
                  Calculate
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <BillRow label="Total litres used"
                  value={billing ? `${billing.total_litres.toFixed(3)} L` : (latest ? `${latest.total_litres.toFixed(3)} L` : "—")} />
                <BillRow label="Price per litre" value="Rs. 50.00" />
                <BillRow label="Estimated bill"
                  value={`Rs. ${latest ? (latest.total_litres * 50).toFixed(2) : "0.00"}`} />
                <div style={{ borderTop: "1px solid #334155", paddingTop: "10px", marginTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>Total bill</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#8b5cf6" }}>
                      Rs. {billing ? billing.total_bill.toFixed(2) : (latest ? (latest.total_litres * 50).toFixed(2) : "0.00")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, unit, color, icon, alert }) {
  return (
    <div style={{
      background  : "#1e293b",
      borderRadius: "12px",
      border      : `1px solid ${alert ? "#7f1d1d" : "#334155"}`,
      padding     : "18px",
      borderTop   : `3px solid ${color}`
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{label}</p>
        <span style={{ fontSize: "18px" }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: alert ? "#ef4444" : color }}>{value}</p>
      <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>{unit}</p>
    </div>
  )
}

function BillRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>{value}</span>
    </div>
  )
}