import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppModeProvider, useAppMode } from "@/contexts/AppModeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import AppLayout from "@/components/AppLayout";

// Organizer pages
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import EventDashboard from "@/pages/EventDashboard";
import EventImport from "@/pages/EventImport";
import EditEvent from "@/pages/EditEvent";
import VolunteerEditor from "@/pages/VolunteerEditor";
import VolunteerView from "@/pages/VolunteerView";
import SignUp from "@/pages/SignUp";
import OrgSetup from "@/pages/OrgSetup";
import VolunteerSetup from "@/pages/VolunteerSetup";
import TeamPage from "@/pages/TeamPage";
import NotificationsPage from "@/pages/NotificationsPage";
import CalendarPage from "@/pages/CalendarPage";
import VolunteerEventDashboard from "@/pages/VolunteerEventDashboard";
import NotFound from "@/pages/NotFound";

// Volunteer pages
import VolunteerHome from "@/pages/volunteer/VolunteerHome";
import VolunteerEventsPage from "@/pages/volunteer/VolunteerEventsPage";
import VolunteerCalendarPage from "@/pages/volunteer/VolunteerCalendarPage";
import VolunteerNotificationsPage from "@/pages/volunteer/VolunteerNotificationsPage";
import VolunteerTeamPage from "@/pages/volunteer/VolunteerTeamPage";

const queryClient = new QueryClient();

function AppRoutes() {
  const { mode } = useAppMode();

  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/org-setup" element={<OrgSetup />} />
      <Route path="/volunteer-setup" element={<VolunteerSetup />} />
      <Route path="/volunteer/:eventId/:volunteerId" element={<VolunteerView />} />
      <Route path="/volunteer/event/:eventId" element={<VolunteerEventDashboard />} />
      <Route element={<AppLayout />}>
        {mode === "volunteer" ? (
          <>
            <Route path="/" element={<VolunteerHome />} />
            <Route path="/events" element={<VolunteerEventsPage />} />
            <Route path="/calendar" element={<VolunteerCalendarPage />} />
            <Route path="/notifications" element={<VolunteerNotificationsPage />} />
            <Route path="/team" element={<VolunteerTeamPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/import" element={<EventImport />} />
            <Route path="/events/:id/import" element={<EventImport />} />
            <Route path="/events/:id/edit" element={<EditEvent />} />
            <Route path="/events/:id/volunteer-editor" element={<VolunteerEditor />} />
            <Route path="/events/:id" element={<EventDashboard />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </>
        )}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppModeProvider>
        <NotificationsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationsProvider>
      </AppModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
