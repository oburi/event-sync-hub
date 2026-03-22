export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'draft' | 'published' | 'completed';
  lastUpdated: string;
  conflicts: number;
  missingInfo: number;
  volunteersCount: number;
}

export interface Source {
  id: string;
  eventId: string;
  type: 'notion' | 'google_doc' | 'pdf' | 'manual';
  name: string;
  url?: string;
  lastFetched: string;
  status: 'synced' | 'stale' | 'error';
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  time?: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'done';
}

export interface TimelineItem {
  id: string;
  eventId: string;
  time: string;
  title: string;
  description: string;
  assigneeNames: string[];
  status: 'past' | 'now' | 'upcoming';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  availability: string;
}

export interface ConflictFlag {
  id: string;
  eventId: string;
  field: string;
  sourceA: { name: string; value: string; lastUpdated: string };
  sourceB: { name: string; value: string; lastUpdated: string };
  resolved: boolean;
  suggestedValue: string;
}

export interface VolunteerViewItem {
  id: string;
  type: 'responsibility' | 'timeline' | 'logistics' | 'note' | 'change';
  content: string;
  time?: string;
  isNew?: boolean;
}

export const mockTeam: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', role: 'President', email: 'sarah@club.edu', phone: '(555) 123-4567', availability: 'Full day' },
  { id: '2', name: 'Marcus Johnson', role: 'VP Events', email: 'marcus@club.edu', phone: '(555) 234-5678', availability: 'After 2pm' },
  { id: '3', name: 'Priya Patel', role: 'Logistics Lead', email: 'priya@club.edu', phone: '(555) 345-6789', availability: 'Full day' },
  { id: '4', name: 'Alex Rivera', role: 'Volunteer Coordinator', email: 'alex@club.edu', phone: '(555) 456-7890', availability: 'Morning only' },
  { id: '5', name: 'Jordan Kim', role: 'Volunteer', email: 'jordan@club.edu', phone: '(555) 567-8901', availability: 'Full day' },
  { id: '6', name: 'Taylor Nguyen', role: 'Volunteer', email: 'taylor@club.edu', phone: '(555) 678-9012', availability: 'Full day' },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Spring Welcome Mixer',
    date: '2026-04-05',
    time: '6:00 PM - 10:00 PM',
    location: 'Student Union Ballroom',
    description: 'Annual spring welcome event for new and returning students. Features live music, food trucks, and networking activities.',
    status: 'published',
    lastUpdated: '2 hours ago',
    conflicts: 2,
    missingInfo: 1,
    volunteersCount: 12,
  },
  {
    id: '2',
    name: 'Hackathon 2026',
    date: '2026-04-18',
    time: '9:00 AM - 9:00 PM',
    location: 'Engineering Building, Rooms 201-205',
    description: '12-hour hackathon open to all students. Sponsors include local tech companies.',
    status: 'draft',
    lastUpdated: '1 day ago',
    conflicts: 0,
    missingInfo: 3,
    volunteersCount: 8,
  },
  {
    id: '3',
    name: 'Career Fair Prep Workshop',
    date: '2026-03-28',
    time: '3:00 PM - 5:00 PM',
    location: 'Library Room 302',
    description: 'Resume review and interview prep workshop ahead of the career fair.',
    status: 'completed',
    lastUpdated: '5 days ago',
    conflicts: 0,
    missingInfo: 0,
    volunteersCount: 4,
  },
];

export const mockSources: Source[] = [
  { id: '1', eventId: '1', type: 'notion', name: 'Event Planning Doc', url: 'https://notion.so/...', lastFetched: '2 hours ago', status: 'synced' },
  { id: '2', eventId: '1', type: 'google_doc', name: 'Vendor Contracts', url: 'https://docs.google.com/...', lastFetched: '1 day ago', status: 'stale' },
  { id: '3', eventId: '1', type: 'pdf', name: 'Venue Floor Plan.pdf', lastFetched: '3 days ago', status: 'synced' },
];

export const mockTasks: Task[] = [
  { id: '1', eventId: '1', title: 'Set up registration table', description: 'Place table near main entrance with check-in sheets and name tags', assigneeId: '5', assigneeName: 'Jordan Kim', time: '5:00 PM', location: 'Main Entrance', status: 'pending' },
  { id: '2', eventId: '1', title: 'Coordinate with food trucks', description: 'Confirm arrival time, parking spots, and power access for 3 food trucks', assigneeId: '3', assigneeName: 'Priya Patel', time: '4:00 PM', location: 'Parking Lot B', status: 'pending' },
  { id: '3', eventId: '1', title: 'Sound check with DJ', description: 'Test microphones, speakers, and playlist with DJ Marcus', assigneeId: '2', assigneeName: 'Marcus Johnson', time: '5:30 PM', location: 'Main Stage', status: 'pending' },
  { id: '4', eventId: '1', title: 'Hang directional signage', description: 'Place 8 signs from parking lot to ballroom entrance', assigneeId: '6', assigneeName: 'Taylor Nguyen', time: '4:30 PM', location: 'Campus Walkway', status: 'pending' },
  { id: '5', eventId: '1', title: 'Emergency kit & first aid', description: 'Ensure first aid kit is stocked and accessible at info desk', assigneeId: '4', assigneeName: 'Alex Rivera', time: '5:00 PM', location: 'Info Desk', status: 'pending' },
];

export const mockTimeline: TimelineItem[] = [
  { id: '1', eventId: '1', time: '4:00 PM', title: 'Vendor Arrival & Setup', description: 'Food trucks arrive at Parking Lot B. Priya confirms spots.', assigneeNames: ['Priya Patel'], status: 'past' },
  { id: '2', eventId: '1', time: '4:30 PM', title: 'Signage & Wayfinding', description: 'Directional signs placed from parking to venue.', assigneeNames: ['Taylor Nguyen'], status: 'past' },
  { id: '3', eventId: '1', time: '5:00 PM', title: 'Registration Opens', description: 'Check-in table live. Name tags and welcome packets ready.', assigneeNames: ['Jordan Kim', 'Alex Rivera'], status: 'now' },
  { id: '4', eventId: '1', time: '5:30 PM', title: 'Sound Check', description: 'Final audio test with DJ. Confirm mic for welcome speech.', assigneeNames: ['Marcus Johnson'], status: 'upcoming' },
  { id: '5', eventId: '1', time: '6:00 PM', title: 'Doors Open', description: 'Welcome students. Sarah delivers opening remarks.', assigneeNames: ['Sarah Chen'], status: 'upcoming' },
  { id: '6', eventId: '1', time: '7:00 PM', title: 'Networking Activity', description: 'Icebreaker games kick off in the east wing.', assigneeNames: ['Alex Rivera'], status: 'upcoming' },
  { id: '7', eventId: '1', time: '9:30 PM', title: 'Closing & Cleanup', description: 'Thank attendees. Begin teardown. All volunteers assist.', assigneeNames: ['Sarah Chen', 'Priya Patel'], status: 'upcoming' },
];

export const mockConflicts: ConflictFlag[] = [
  {
    id: '1', eventId: '1', field: 'Event Start Time',
    sourceA: { name: 'Notion Planning Doc', value: '6:00 PM', lastUpdated: '2 hours ago' },
    sourceB: { name: 'Venue Floor Plan.pdf', value: '7:00 PM', lastUpdated: '3 days ago' },
    resolved: false, suggestedValue: '6:00 PM',
  },
  {
    id: '2', eventId: '1', field: 'Expected Attendance',
    sourceA: { name: 'Notion Planning Doc', value: '200 students', lastUpdated: '2 hours ago' },
    sourceB: { name: 'Vendor Contracts', value: '150 students', lastUpdated: '1 day ago' },
    resolved: false, suggestedValue: '200 students',
  },
];

export const mockVolunteerView: VolunteerViewItem[] = [
  { id: '1', type: 'change', content: 'Registration start time moved from 5:30 PM to 5:00 PM', isNew: true },
  { id: '2', type: 'responsibility', content: 'Set up registration table at Main Entrance', time: '5:00 PM' },
  { id: '3', type: 'responsibility', content: 'Hand out name tags and welcome packets to attendees', time: '5:00 PM - 6:30 PM' },
  { id: '4', type: 'timeline', content: 'Doors open at 6:00 PM — be ready by 5:45 PM', time: '6:00 PM' },
  { id: '5', type: 'logistics', content: 'Parking available in Lot A. Enter through south entrance.' },
  { id: '6', type: 'note', content: 'Wear your club t-shirt. Extras are in the storage closet near Room 104.' },
];
