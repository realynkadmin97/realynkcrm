export const NAV = ["Today", "Leads", "Cleaner", "Opportunities", "Activities", "Team", "Settings"] as const;

export const STALE = [
  { company: "Northwind Labs", person: "Maya Chen", stage: "Qualified" },
  { company: "Harbor Freight Co", person: "Jon Hale", stage: "Meeting" },
  { company: "Silk Route Media", person: "Asha Rao", stage: "Proposal" },
];

export const TASKS = [
  { summary: "Send ICP brief to Maya", when: "Today · 14:00" },
  { summary: "Confirm demo with Harbor", when: "Tomorrow · 10:30" },
  { summary: "Update proposal for Silk Route", when: "Fri · 16:00" },
];

export const LEADS = [
  { company: "Northwind Labs", person: "Maya Chen", stage: "Qualified", owner: "You", updated: "2h ago" },
  { company: "Harbor Freight Co", person: "Jon Hale", stage: "Meeting", owner: "You", updated: "Yesterday" },
  { company: "Silk Route Media", person: "Asha Rao", stage: "Proposal", owner: "Priya", updated: "Mon" },
  { company: "Cedar Analytics", person: "Leo Park", stage: "New", owner: "You", updated: "Just now" },
  { company: "Blue Orchard", person: "Sam Ortiz", stage: "Qualified", owner: "Priya", updated: "3d ago" },
];
