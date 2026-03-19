import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminBanner from "./components/AdminBanner"

import Home from "./pages/Home"
import Kitchens from "./pages/Kitchens"
import Furniture from "./pages/Furniture"
import Others from "./pages/Others"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Login from "./pages/Login"
import Admin from "./pages/Admin"

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminBanner />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/kitchens" element={<Layout><Kitchens /></Layout>} />
          <Route path="/furniture" element={<Layout><Furniture /></Layout>} />
          <Route path="/others" element={<Layout><Others /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
