import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Customer from './Customer.jsx'
import './index.css'

const path = window.location.pathname

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/customer' ? <Customer /> : <App />}
  </StrictMode>
)