import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BankValuePage from './pages/BankValuePage';
import MarketValuePage from './pages/MarketValuePage';
import InflationPage from './pages/InflationPage';
import NewsletterPage from './pages/NewsletterPage';
import PlaceholderPage from './pages/PlaceholderPage';
import CalculatorsDashboardPage from './pages/CalculatorsDashboardPage';
import AdminBlogsPage from './pages/AdminBlogsPage';
import AdminCalculatorConstsPage from './pages/AdminCalculatorConstsPage';
import AdminShellPage from './pages/AdminShellPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calculators" element={<CalculatorsDashboardPage />} />
        <Route path="calculators/bank-value" element={<BankValuePage />} />
        <Route path="calculators/market-shares" element={<MarketValuePage />} />
        <Route path="calculators/inflation" element={<InflationPage />} />
        <Route path="calculators/:calculatorId" element={<PlaceholderPage />} />
        <Route path="newsletter" element={<NewsletterPage />} />
      </Route>
      <Route path="sodimeod" element={<AdminShellPage />}>
        <Route index element={<Navigate to="blogs" replace />} />
        <Route path="blogs" element={<AdminBlogsPage />} />
        <Route path="calculator-consts" element={<AdminCalculatorConstsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
