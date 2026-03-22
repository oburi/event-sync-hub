

## Plan: AI-Powered Volunteer Assignment Suggestions

### What We're Building

When an organizer is editing an event and assigning volunteers to tasks, a "Suggest" button next to each task's volunteer field will call an AI backend function. The AI will analyze the task requirements against all team members' roles, availability, and current workload across events, then return ranked suggestions the organizer can accept with one click.

### Architecture

```text
EditEvent.tsx                Edge Function                    DB
─────────────                ──────────────                   ──
Click "Suggest"  ──────►  suggest-volunteer  ──────►  Fetch all events
  (task info +              (Lovable AI)               + raw_content
   team roster)          Analyze workload,             (count assignments)
                         role fit, availability
                              │
                    Return ranked suggestions
                              │
                         ◄────┘
Show suggestion chips
 user clicks to assign
```

### Steps

**1. Create `suggest-volunteer` edge function**

- Accepts: `{ task: { title, description, assignedRole, time }, team: TeamMember[], workload: Record<string, number> }`
- Calls Lovable AI (gemini-3-flash-preview) with a system prompt instructing it to rank team members by: (a) role/expertise match, (b) current workload (fewer assignments = preferred), (c) availability fit for the task time
- Uses tool calling to return structured output: `{ suggestions: [{ name, reason }] }` (top 3)
- Handles 429/402 errors

**2. Update `EditEvent.tsx`**

- Add a sparkle/wand icon button ("Suggest") next to each task's volunteer input
- On click: gather all tasks' current volunteer assignments to compute workload counts, send the task + `mockTeam` roster + workload map to the edge function
- Show returned suggestions as small clickable chips below the volunteer input (e.g., "Sarah Chen — fewest tasks, role match")
- Clicking a chip fills in the volunteer name

**3. Workload calculation**

- Before calling the AI, scan all tasks across the current event to count how many tasks each volunteer name is already assigned to
- Also query all other published events from the DB, parse their `raw_content`, and count cross-event assignments
- Pass this as `{ "Sarah Chen": 2, "Jordan Kim": 0, ... }` to give the AI real workload data

### Technical Details

- Edge function uses `LOVABLE_API_KEY` (already configured) via `https://ai.gateway.lovable.dev/v1/chat/completions`
- Team roster comes from `mockTeam` in mock-data.ts (6 members with roles and availability)
- Non-streaming call via `supabase.functions.invoke`
- Suggestions state stored per-task index in component state: `Map<number, {name: string, reason: string}[]>`

