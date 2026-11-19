import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { AgendaPage } from './pages/AgendaPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { PatientRecord } from './pages/PatientRecord.tsx';
import { PatientsPage } from './pages/PatientsPage.tsx';
import { RemindersPage } from './pages/RemindersPage.tsx';
import { TodayProvider } from './TodayContext.tsx';
import { ToastProvider } from './ToastContext.tsx';

export function App() {
  return (
    <TodayProvider>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<AgendaPage />} />
            <Route path="appointments/new" element={<BookingPage />} />
            <Route path="appointments/:id/reschedule" element={<BookingPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id/*" element={<PatientRecord />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </TodayProvider>
  );
}
