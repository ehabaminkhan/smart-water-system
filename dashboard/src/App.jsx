import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://smart-water-system-production.up.railway.app"

export default function App() {
  const [house1, setHouse1]         = useState(null)
  const [house2, setHouse2]         = useState(null)
  const [billing1, setBilling1]     = useState(null)
  const [billing2, setBilling2]     = useState(null)
  const [valve1, setValve1]         = useState("open")
  const [valve2, setValve2]         = useState("open")
  const [time, setTime]             = useState(new Date())

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [r1, r2] = await Promise.all([
          axios.get(`${API}/api/sensor-data/house/1/latest`),
          axios.get(`${API}/api/sensor-data/house/2/latest`)
        ])
        setHouse1(r1.data)
        setHouse2(r2.data)
      } catch (err) {}
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [r1, r2] = await Promise.all([
          axios.get(`${API}/api/billing/house/1`),
          axios.get(`${API}/api/billing/house/2`)
        ])
        if (r1.data.length > 0) setBilling1(r1.data[0])
        if (r2.data.length > 0) setBilling2(r2.data[0])
      } catch (err) {}
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [r1, r2] = await Promise.all([
          axios.get(`${API}/api/valve/house/1/latest`),
          axios.get(`${API}/api/valve/house/2/latest`)
        ])
        setValve1(r1.data.command)
        setValve2(r2.data.command)
      } catch (err) {}
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const sendValve = async (house_id, command) => {
    try {
      await axios.post(`${API}/api/valve`, { command, house_id })
      if (house_id === 1) setValve1(command)
      else setValve2(command)
    } catch (err) {
      alert("Could not send valve command")
    }
  }

  const calcBill = async (house_id, data) => {
    if (!data) return
    try {
      const res = await axios.post(`${API}/api/billing/calculate`, {
        house_id,
        total_litres   : data.total_litres,
        price_per_litre: 50
      })
      if (house_id === 1) setBilling1(res.data)
      else setBilling2(res.data)
    } catch (err) {
      alert("Could not calculate bill")
    }
  }

  return (
    <div style={{
      minHeight : "100vh", width: "100%",
      background: "#0f172a", color: "#e2e8f0",
      fontFamily: "system-ui, sans-serif", boxSizing: "border-box"
    }}>

      {/* Navbar */}
      <div style={{
        background: "#1e293b", borderBottom: "1px solid #334155",
        padding: "12px 24px", display: "flex",
        justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "#0ea5e9", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "18px"
          }}>💧</div>
          <div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "15px", color: "#f1f5f9" }}>
              Smart water system
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
              Distribution & automated billing — 2 houses
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            {time.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            {time.toLocaleTimeString('en-PK')}
          </p>
        </div>
      </div>

      {/* Team banner */}
      <div style={{
        background: "#1e293b", borderBottom: "1px solid #334155",
        padding: "8px 24px", display: "flex", alignItems: "center", gap: "8px"
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

      {/* Leakage alerts */}
      {(house1?.leakage === 1 || house2?.leakage === 1) && (
        <div style={{
          background: "#450a0a", border: "1px solid #7f1d1d",
          padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "24px" }}>🚨</span>
          <div>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#fca5a5" }}>
              LEAKAGE DETECTED!
            </p>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#fca5a5", opacity: 0.8 }}>
              {house1?.leakage === 1 && "House 1 (MTR-001) — "}
              {house2?.leakage === 1 && "House 2 (MTR-002) — "}
              Water flowing after valve closed. Check pipeline immediately!
            </p>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 24px" }}>

        {/* Two house panels side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <HousePanel
            house_id={1}
            meter_id="MTR-001"
            data={house1}
            billing={billing1}
            valve={valve1}
            onValve={(cmd) => sendValve(1, cmd)}
            onBill={() => calcBill(1, house1)}
          />
          <HousePanel
            house_id={2}
            meter_id="MTR-002"
            data={house2}
            billing={billing2}
            valve={valve2}
            onValve={(cmd) => sendValve(2, cmd)}
            onBill={() => calcBill(2, house2)}
          />
        </div>

      </div>
    </div>
  )
}

function HousePanel({ house_id, meter_id, data, billing, valve, onValve, onBill }) {
  const leakage = data?.leakage === 1

  return (
    <div style={{
      background: "#1e293b", borderRadius: "12px",
      border: `1px solid ${leakage ? "#7f1d1d" : "#334155"}`,
      borderTop: `3px solid ${leakage ? "#ef4444" : "#0ea5e9"}`,
      padding: "20px"
    }}>

      {/* House header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <p style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "#f1f5f9" }}>
            House {house_id}
          </p>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            Meter ID: {meter_id}
          </p>
        </div>
        <span style={{
          fontSize: "12px", padding: "4px 12px", borderRadius: "20px",
          background: data ? "#064e3b" : "#1e293b",
          color     : data ? "#34d399" : "#64748b",
          border    : data ? "1px solid #065f46" : "1px solid #334155"
        }}>
          {data ? "● Connected" : "○ No data"}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        <MiniCard label="Flow"     value={data ? `${data.flow_litres?.toFixed(4)} L/s`   : "—"} color="#0ea5e9" />
        <MiniCard label="Total"    value={data ? `${data.total_litres?.toFixed(3)} L`     : "—"} color="#8b5cf6" />
        <MiniCard label="Pressure" value={data ? `${data.pressure_kpa?.toFixed(2)} V`     : "—"} color="#06b6d4" />
        <MiniCard
          label="Leakage"
          value={leakage ? "LEAK!" : "No leak"}
          color={leakage ? "#ef4444" : "#10b981"}
          alert={leakage}
        />
      </div>

      {/* Valve control */}
      <div style={{
        background: "#0f172a", borderRadius: "8px",
        padding: "14px", marginBottom: "14px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Valve status</span>
          <span style={{
            fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontWeight: "600",
            background: valve === "open" ? "#064e3b" : "#450a0a",
            color     : valve === "open" ? "#34d399" : "#fca5a5",
            border    : valve === "open" ? "1px solid #065f46" : "1px solid #7f1d1d"
          }}>
            {valve === "open" ? "● Open" : "● Closed"}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button onClick={() => onValve("open")} style={{
            padding: "9px", border: "1px solid #065f46", borderRadius: "8px",
            background: valve === "open" ? "#064e3b" : "transparent",
            color: "#34d399", fontSize: "13px", cursor: "pointer", fontWeight: "500"
          }}>
            Open
          </button>
          <button onClick={() => onValve("close")} style={{
            padding: "9px", border: "1px solid #7f1d1d", borderRadius: "8px",
            background: valve === "close" ? "#450a0a" : "transparent",
            color: "#fca5a5", fontSize: "13px", cursor: "pointer", fontWeight: "500"
          }}>
            Close
          </button>
        </div>
      </div>

      {/* Billing */}
      <div style={{ background: "#0f172a", borderRadius: "8px", padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Billing</span>
          <button onClick={onBill} style={{
            fontSize: "11px", padding: "4px 12px",
            border: "1px solid #0ea5e9", borderRadius: "20px",
            background: "transparent", color: "#0ea5e9",
            cursor: "pointer"
          }}>
            Calculate
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Total litres</span>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            {data ? `${data.total_litres?.toFixed(3)} L` : "—"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Price / litre</span>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Rs. 50.00</span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          borderTop: "1px solid #334155", paddingTop: "8px", marginTop: "4px"
        }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>Total bill</span>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#8b5cf6" }}>
            Rs. {billing
              ? billing.total_bill?.toFixed(2)
              : (data ? (data.total_litres * 50).toFixed(2) : "0.00")}
          </span>
        </div>
      </div>

    </div>
  )
}

function MiniCard({ label, value, color, alert }) {
  return (
    <div style={{
      background  : "#1e293b",
      borderRadius: "8px",
      border      : `1px solid ${alert ? "#7f1d1d" : "#334155"}`,
      padding     : "10px 12px",
      borderLeft  : `3px solid ${color}`
    }}>
      <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: alert ? "#ef4444" : color }}>
        {value}
      </p>
    </div>
  )
}