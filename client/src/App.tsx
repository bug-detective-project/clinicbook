import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { AgendaPage } from './pages/AgendaPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { PatientsPage } from './pages/PatientsPage.tsx';
import { RemindersPage } from './pages/RemindersPage.tsx';
import { TodayProvider } from './TodayContext.tsx';

export function App() {
  return (
    <TodayProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<AgendaPage />} />
          <Route path="appointments/new" element={<BookingPage />} />
          <Route path="appointments/:id/reschedule" element={<BookingPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </TodayProvider>
  );
}
