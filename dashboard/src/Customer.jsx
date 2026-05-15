import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://smart-water-system-production.up.railway.app"

export default function Customer() {
  const [meterId, setMeterId]     = useState("")
  const [loggedIn, setLoggedIn]   = useState(false)
  const [houseId, setHouseId]     = useState(1)
  const [latest, setLatest]       = useState(null)
  const [billing, setBilling]     = useState([])
  const [valve, setValve]         = useState("open")
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [time, setTime]           = useState(new Date())

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/sensor-data/house/${houseId}/latest`)
        setLatest(res.data)
      } catch (err) {}
    }, 2000)
    return () => clearInterval(interval)
  }, [loggedIn, houseId])

  useEffect(() => {
    if (!loggedIn) return
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/billing/house/${houseId}`)
        setBilling(res.data)
      } catch (err) {}
    }, 5000)
    return () => clearInterval(interval)
  }, [loggedIn, houseId])

  useEffect(() => {
    if (!loggedIn) return
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/valve/house/${houseId}/latest`)
        setValve(res.data.command)
      } catch (err) {}
    }, 2000)
    return () => clearInterval(interval)
  }, [loggedIn, houseId])

  const handleLogin = async () => {
    if (meterId.trim() === "") {
      setError("Please enter your meter ID")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${API}/api/houses/meter/${meterId.trim().toUpperCase()}`)
      setHouseId(res.data.id)
      setLoggedIn(true)
    } catch (err) {
      setError("Invalid meter ID — please check and try again")
    }
    setLoading(false)
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setMeterId("")
    setLatest(null)
    setBilling([])
    setHouseId(1)
    setError("")
  }

  const estimatedBill = latest ? (latest.total_litres * 50).toFixed(2) : "0.00"
  const leakage       = latest?.leakage === 1

  if (!loggedIn) {
    return (
      <div style={{
        minHeight     : "100vh",
        background    : "#0f172a",
        display       : "flex",
        alignItems    : "center",
        justifyContent: "center",
        padding       : "20px",
        fontFamily    : "system-ui, sans-serif"
      }}>
        <div style={{
          width       : "100%",
          maxWidth    : "380px",
          background  : "#1e293b",
          borderRadius: "16px",
          border      : "1px solid #334155",
          padding     : "32px 24px"
        }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width : "64px", height: "64px", borderRadius: "16px",
              background: "#0ea5e9", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "30px", margin: "0 auto 14px"
            }}>💧</div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 4px 0" }}>
              Smart water system
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Customer portal
            </p>
          </div>

          {/* Login */}
          <div>
            <label style={{ fontSize: "13px", color: "#94a3b8", display: "block", marginBottom: "8px" }}>
              Enter your meter ID
            </label>
            <input
              type="text"
              value={meterId}
              onChange={e => setMeterId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="e.g. MTR-001"
              style={{
                width        : "100%",
                padding      : "12px 14px",
                background   : "#0f172a",
                border       : "1px solid #334155",
                borderRadius : "8px",
                color        : "#f1f5f9",
                fontSize     : "15px",
                outline      : "none",
                boxSizing    : "border-box",
                marginBottom : "8px"
              }}
            />

            {error && (
              <p style={{ fontSize: "12px", color: "#ef4444", margin: "0 0 12px 0" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width        : "100%",
                padding      : "13px",
                background   : loading ? "#0369a1" : "#0ea5e9",
                border       : "none",
                borderRadius : "8px",
                color        : "#fff",
                fontSize     : "15px",
                fontWeight   : "600",
                cursor       : loading ? "not-allowed" : "pointer",
                marginTop    : "8px"
              }}
            >
              {loading ? "Checking..." : "View my account"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#475569", marginTop: "20px" }}>
            Valid meter IDs: MTR-001 or MTR-002
          </p>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#475569", marginTop: "6px" }}>
            Contact your water provider if you need help
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight : "100vh",
      background: "#0f172a",
      fontFamily: "system-ui, sans-serif",
      color     : "#e2e8f0"
    }}>

      {/* Header */}
      <div style={{
        background    : "#1e293b",
        borderBottom  : "1px solid #334155",
        padding       : "14px 20px",
        display       : "flex",
        justifyContent: "space-between",
        alignItems    : "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#0ea5e9", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "16px"
          }}>💧</div>
          <div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#f1f5f9" }}>
              My water account
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
              Meter ID: {meterId.toUpperCase()} — House {houseId}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding     : "6px 14px",
            background  : "transparent",
            border      : "1px solid #334155",
            borderRadius: "20px",
            color       : "#94a3b8",
            fontSize    : "12px",
            cursor      : "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px", maxWidth: "480px", margin: "0 auto" }}>

        {/* Date time */}
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", textAlign: "center" }}>
          {time.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {" — "}
          {time.toLocaleTimeString('en-PK')}
        </p>

        {/* Leakage alert */}
        {leakage && (
          <div style={{
            background   : "#450a0a",
            borderRadius : "12px",
            border       : "1px solid #7f1d1d",
            padding      : "14px",
            marginBottom : "14px",
            display      : "flex",
            alignItems   : "center",
            gap          : "10px"
          }}>
            <span style={{ fontSize: "24px" }}>🚨</span>
            <div>
              <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#fca5a5" }}>
                Leakage detected!
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#fca5a5", opacity: 0.8 }}>
                Water is flowing after valve was closed. Please contact your provider immediately.
              </p>
            </div>
          </div>
        )}

        {/* Valve status card */}
        <div style={{
          background   : valve === "open" ? "#064e3b" : "#450a0a",
          borderRadius : "12px",
          border       : valve === "open" ? "1px solid #065f46" : "1px solid #7f1d1d",
          padding      : "16px",
          marginBottom : "14px",
          display      : "flex",
          alignItems   : "center",
          gap          : "12px"
        }}>
          <div style={{ fontSize: "28px" }}>
            {valve === "open" ? "🟢" : "🔴"}
          </div>
          <div>
            <p style={{
              margin: 0, fontWeight: "600", fontSize: "15px",
              color: valve === "open" ? "#34d399" : "#fca5a5"
            }}>
              Water supply is {valve === "open" ? "active" : "suspended"}
            </p>
            <p style={{
              margin: "2px 0 0 0", fontSize: "12px",
              color: valve === "open" ? "#6ee7b7" : "#fca5a5", opacity: 0.8
            }}>
              {valve === "open"
                ? "Your water supply is currently running normally"
                : "Your water supply has been suspended by the provider"
              }
            </p>
          </div>
        </div>

        {/* Current bill card */}
        <div style={{
          background  : "#1e293b",
          borderRadius: "12px",
          border      : "1px solid #334155",
          padding     : "20px",
          marginBottom: "14px"
        }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
            Current bill
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "#0f172a", borderRadius: "8px", padding: "12px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b" }}>Total used</p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#0ea5e9" }}>
                {latest ? latest.total_litres?.toFixed(3) : "0.000"}
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>litres</p>
            </div>
            <div style={{ background: "#0f172a", borderRadius: "8px", padding: "12px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b" }}>Amount due</p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#8b5cf6" }}>
                Rs. {estimatedBill}
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>@ Rs. 50/litre</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #334155", paddingTop: "12px" }}>
            <CustRow label="Flow this second"
              value={latest ? `${latest.flow_litres?.toFixed(4)} L/s` : "—"} />
            <CustRow label="Pipe pressure"
              value={latest ? `${latest.pressure_kpa?.toFixed(2)} V` : "—"} />
            <CustRow label="Price per litre" value="Rs. 50.00" />
            <CustRow label="Total litres"
              value={latest ? `${latest.total_litres?.toFixed(3)} L` : "—"} />
            <div style={{
              display: "flex", justifyContent: "space-between",
              paddingTop: "8px", borderTop: "1px solid #334155", marginTop: "4px"
            }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>Total bill</span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#8b5cf6" }}>
                Rs. {estimatedBill}
              </span>
            </div>
          </div>
        </div>

        {/* Payment status */}
        <div style={{
          background  : "#1e293b",
          borderRadius: "12px",
          border      : "1px solid #334155",
          padding     : "20px",
          marginBottom: "14px"
        }}>
          <p style={{ margin: "0 0 14px 0", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
            Payment status
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#1e3a5f", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "18px"
              }}>⏳</div>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#fbbf24" }}>
                  Payment pending
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                  Due this month
                </p>
              </div>
            </div>
            <span style={{
              fontSize: "12px", padding: "4px 12px", borderRadius: "20px",
              background: "#451a03", color: "#fbbf24", border: "1px solid #92400e"
            }}>
              Unpaid
            </span>
          </div>
        </div>

        {/* Usage history */}
        <div style={{
          background  : "#1e293b",
          borderRadius: "12px",
          border      : "1px solid #334155",
          padding     : "20px",
          marginBottom: "14px"
        }}>
          <p style={{ margin: "0 0 14px 0", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
            Usage history
          </p>
          {billing.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", padding: "10px 0" }}>
              No history yet
            </p>
          ) : (
            billing.slice(0, 5).map((bill, i) => (
              <div key={i} style={{
                display       : "flex",
                justifyContent: "space-between",
                alignItems    : "center",
                padding       : "10px 0",
                borderBottom  : i < Math.min(billing.length, 5) - 1 ? "1px solid #334155" : "none"
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                    {new Date(bill.timestamp).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    {bill.total_litres?.toFixed(3)} litres used
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#8b5cf6" }}>
                    Rs. {bill.total_bill?.toFixed(2)}
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    @ Rs. {bill.price_per_litre}/L
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 4px 0" }}>
            Smart water distribution & billing system
          </p>
          <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>
            Ehab Amin Khan Yousafzai &nbsp;·&nbsp; Huraiz Hayat &nbsp;·&nbsp; Umer Rashid Kiyani
          </p>
        </div>

      </div>
    </div>
  )
}

function CustRow({ label, value }) {
  return (
    <div style={{
      display       : "flex",
      justifyContent: "space-between",
      padding       : "6px 0",
      borderBottom  : "1px solid #1e293b"
    }}>
      <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{value}</span>
    </div>
  )
}