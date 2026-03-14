import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LeadsPage } from './pages/LeadsPage';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">Prospect Hunter</h1>
          <nav className="flex gap-4" aria-label="Navegação principal">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              Leads
            </NavLink>
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LeadsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
