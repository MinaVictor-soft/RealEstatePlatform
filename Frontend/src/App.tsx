import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AddPaymentPage } from './pages/AddPaymentPage';
import { ContractDetailsPage } from './pages/ContractDetailsPage';
import { CreateContractPage } from './pages/CreateContractPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contracts/new" element={<CreateContractPage />} />
        <Route path="/contracts/:id" element={<ContractDetailsPage />} />
        <Route path="/contracts/:id/installments" element={<InstallmentsPage />} />
        <Route path="/contracts/:id/payments" element={<AddPaymentPage />} />
        <Route path="/contracts/:id/payment" element={<AddPaymentPage />} />
        <Route path="/contracts/:id/forecast" element={<ForecastPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
