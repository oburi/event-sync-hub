import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import EventDashboard from "@/pages/EventDashboard";
import EventImport from "@/pages/EventImport";
import VolunteerEditor from "@/pages/VolunteerEditor";
import VolunteerView from "@/pages/VolunteerView";
import SignUp from "@/pages/SignUp";
import OrgSetup from "@/pages/OrgSetup";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/org-setup" element={<OrgSetup />} />
          <Route path="/volunteer/:eventId/:volunteerId" element={<VolunteerView />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDashboard />} />
            <Route path="/events/:id/import" element={<EventImport />} />
            <Route path="/events/:id/volunteer-editor" element={<VolunteerEditor />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
