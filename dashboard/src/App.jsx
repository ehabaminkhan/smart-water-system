import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:5000"

export default function App() {
  const [latest, setLatest]     = useState(null)
  const [billing, setBilling]   = useState(null)
  const [valve, setValve]       = useState("open")
  const [flowHistory, setFlowHistory] = useState([])
  const [leakage, setLeakage]   = useState(false)

  // Fetch latest sensor data every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/sensor-data/latest`)
        const data = res.data
        setLatest(data)

        // Keep last 6 readings for the bar chart
        setFlowHistory(prev => {
          const updated = [...prev, data.flow_litres].slice(-6)
          return updated
        })

        // Leakage: if valve closed and pressure drops below 50 kPa
        if (data.valve_open === 0 && data.pressure_kpa < 50) {
          setLeakage(true)
        } else {
          setLeakage(false)
        }

      } catch (err) {
        console.log("Waiting for Pi data...")
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch billing every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/billing`)
        if (res.data.length > 0) setBilling(res.data[0])
      } catch (err) {}
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch valve status every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/valve/latest`)
        setValve(res.data.command)
      } catch (err) {}
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Send valve command
  const sendValveCommand = async (command) => {
    try {
      await axios.post(`${API}/api/valve`, { command })
      setValve(command)
    } catch (err) {
      alert("Could not send valve command")
    }
  }

  // Calculate bill on demand
  const calculateBill = async () => {
    if (!latest) return
    try {
      const res = await axios.post(`${API}/api/billing/calculate`, {
        total_litres   : latest.total_litres,
        price_per_litre: 0.05
      })
      setBilling(res.data)
    } catch (err) {
      alert("Could not calculate bill")
    }
  }

  const maxFlow = Math.max(...flowHistory, 0.01)

  return (
    <div style={{ padding: "1.5rem", background: "#f5f5f3", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "500", margin: 0 }}>Smart water system</h1>
          <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>Live dashboard — provider view</p>
        </div>
        <span style={{
          fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontWeight: "500",
          background: latest ? "#EAF3DE" : "#F1EFE8",
          color   : latest ? "#27500A" : "#5F5E5A"
        }}>
          {latest ? "Pi connected" : "Waiting for Pi..."}
        </span>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "10px", marginBottom: "1rem" }}>
        <MetricCard label="Flow this second"    value={latest ? latest.flow_litres.toFixed(4) : "—"}  unit="litres / sec" />
        <MetricCard label="Total flowed today"  value={latest ? latest.total_litres.toFixed(2) : "—"} unit="litres" />
        <MetricCard label="Pressure"            value={latest ? latest.pressure_kpa.toFixed(0) : "—"} unit="kPa" />
        <MetricCard
          label="Leakage alert"
          value={leakage ? "LEAK!" : "No leak"}
          unit={valve === "close" ? "valve is closed" : "valve is open"}
          alert={leakage}
        />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

        {/* Flow chart */}
        <div style={{ background: "#fff", border: "0.5px solid #e0e0de", borderRadius: "8px", padding: "14px" }}>
          <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>Flow last 6 readings (L)</p>
          {flowHistory.length === 0 && (
            <p style={{ fontSize: "12px", color: "#888" }}>Waiting for data from Pi...</p>
          )}
          {flowHistory.map((val, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "#888", width: "20px" }}>{flowHistory.length - i}s</span>
              <div style={{ flex: 1, height: "6px", background: "#f0f0ee", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${(val / maxFlow) * 100}%`, height: "100%", background: "#378ADD", borderRadius: "3px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#888", width: "50px", textAlign: "right" }}>{val.toFixed(4)} L</span>
            </div>
          ))}
        </div>

        {/* Valve + Billing */}
        <div style={{ background: "#fff", border: "0.5px solid #e0e0de", borderRadius: "8px", padding: "14px" }}>

          {/* Valve control */}
          <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "10px" }}>Valve control</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px" }}>Current status</span>
            <span style={{
              fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "500",
              background: valve === "open" ? "#EAF3DE" : "#FCEBEB",
              color     : valve === "open" ? "#27500A"  : "#791F1F"
            }}>
              {valve === "open" ? "Open" : "Closed"}
            </span>
          </div>

          <button
            onClick={() => sendValveCommand("close")}
            style={{ width: "100%", padding: "8px", marginBottom: "6px", border: "0.5px solid #E24B4A", borderRadius: "8px", background: "transparent", color: "#A32D2D", fontSize: "13px", cursor: "pointer" }}
          >
            Close valve
          </button>
          <button
            onClick={() => sendValveCommand("open")}
            style={{ width: "100%", padding: "8px", marginBottom: "14px", border: "0.5px solid #ccc", borderRadius: "8px", background: "transparent", fontSize: "13px", cursor: "pointer" }}
          >
            Open valve
          </button>

          {/* Billing */}
          <div style={{ borderTop: "0.5px solid #e0e0de", paddingTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <p style={{ fontSize: "13px", fontWeight: "500", margin: 0 }}>Current bill</p>
              <button
                onClick={calculateBill}
                style={{ fontSize: "11px", padding: "3px 10px", border: "0.5px solid #ccc", borderRadius: "20px", background: "transparent", cursor: "pointer" }}
              >
                Calculate
              </button>
            </div>
            <BillRow label="Total litres"  value={billing ? `${billing.total_litres.toFixed(2)} L` : (latest ? `${latest.total_litres.toFixed(2)} L` : "—")} />
            <BillRow label="Price / litre" value="Rs. 0.05" />
            <BillRow label="Total bill"    value={billing ? `Rs. ${billing.total_bill.toFixed(2)}` : "—"} bold />
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ label, value, unit, alert }) {
  return (
    <div style={{
      background: "#fff",
      border    : alert ? "0.5px solid #E24B4A" : "0.5px solid #e0e0de",
      borderLeft: alert ? "3px solid #E24B4A"   : "0.5px solid #e0e0de",
      borderRadius: "8px",
      padding   : "12px 14px"
    }}>
      <p style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: "500", color: alert ? "#A32D2D" : "inherit", margin: 0 }}>{value}</p>
      <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{unit}</p>
    </div>
  )
}

function BillRow({ label, value, bold }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      fontSize: bold ? "13px" : "12px",
      fontWeight: bold ? "500" : "400",
      padding: "5px 0",
      borderBottom: "0.5px solid #f0f0ee",
      color: bold ? "inherit" : "#888"
    }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}