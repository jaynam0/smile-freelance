// ============================================================================
// CRAFTROLL LOCAL IN-BROWSER DATABASE & AUTH ENGINE
// ============================================================================
// Replaces Supabase entirely with a self-contained, persistent, zero-dependency
// client-side database stored in localStorage with rich initial seed data.
// ============================================================================

export interface User {
  id: string;
  email: string;
  password?: string;
  aud?: string;
  role?: string;
  created_at: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  category: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  portfolio_url: string | null;
  resume_url: string | null;
  years_experience: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "client" | "freelancer" | "admin";
  created_at: string;
}

export interface JobPost {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string | null;
  budget_type: "fixed" | "hourly";
  budget_min: number | null;
  budget_max: number | null;
  skills: string[] | null;
  status: "open" | "closed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  job_post_id: string;
  freelancer_id: string;
  bid_amount: number;
  estimated_days: number | null;
  cover_letter: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  freelancer_id: string;
  job_post_id: string | null;
  title: string;
  description: string | null;
  price: number | null;
  hourly_rate: number | null;
  contract_type: "fixed" | "hourly";
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  booking_id: string;
  title: string;
  amount: number;
  order_index: number;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed" | "approved";
  created_at: string;
  updated_at: string;
}

export interface TimeLog {
  id: string;
  booking_id: string;
  freelancer_id: string;
  hours: number;
  notes: string | null;
  logged_for: string;
  created_at: string;
}

export interface SavedFreelancer {
  id: string;
  client_id: string;
  freelancer_id: string;
  created_at: string;
}

export interface DatabaseTables {
  users: User[];
  profiles: Profile[];
  user_roles: UserRole[];
  job_posts: JobPost[];
  proposals: Proposal[];
  bookings: Booking[];
  messages: Message[];
  reviews: Review[];
  milestones: Milestone[];
  time_logs: TimeLog[];
  saved_freelancers: SavedFreelancer[];
}

const DB_STORAGE_KEY = "craftroll_local_db_v2";
const AUTH_STORAGE_KEY = "craftroll_local_auth_session_v2";

export const DEFAULT_CREDENTIALS = {
  client: {
    id: "11111111-1111-1111-1111-111111111111",
    email: "client@test.com",
    password: "TestPassword!2026",
    role: "client" as const,
    name: "Default Client",
  },
  freelancer: {
    id: "22222222-2222-2222-2222-222222222222",
    email: "freelancer@test.com",
    password: "TestPassword!2026",
    role: "freelancer" as const,
    name: "Default Freelancer",
  },
};

function getInitialSeedData(): DatabaseTables {
  const now = new Date().toISOString();
  const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const older = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const clientUser: User = {
    id: DEFAULT_CREDENTIALS.client.id,
    email: DEFAULT_CREDENTIALS.client.email,
    password: DEFAULT_CREDENTIALS.client.password,
    aud: "authenticated",
    role: "authenticated",
    created_at: older,
    user_metadata: { full_name: DEFAULT_CREDENTIALS.client.name },
    app_metadata: { provider: "email", providers: ["email"] },
  };

  const freelancerUser: User = {
    id: DEFAULT_CREDENTIALS.freelancer.id,
    email: DEFAULT_CREDENTIALS.freelancer.email,
    password: DEFAULT_CREDENTIALS.freelancer.password,
    aud: "authenticated",
    role: "authenticated",
    created_at: older,
    user_metadata: { full_name: DEFAULT_CREDENTIALS.freelancer.name },
    app_metadata: { provider: "email", providers: ["email"] },
  };

  const elenaUser: User = {
    id: "33333333-3333-3333-3333-333333333333",
    email: "elena.design@example.com",
    password: "TestPassword!2026",
    aud: "authenticated",
    role: "authenticated",
    created_at: older,
    user_metadata: { full_name: "Elena Rostova" },
    app_metadata: { provider: "email", providers: ["email"] },
  };

  const marcusUser: User = {
    id: "44444444-4444-4444-4444-444444444444",
    email: "marcus.cloud@example.com",
    password: "TestPassword!2026",
    aud: "authenticated",
    role: "authenticated",
    created_at: older,
    user_metadata: { full_name: "Marcus Chen" },
    app_metadata: { provider: "email", providers: ["email"] },
  };

  const sarahUser: User = {
    id: "55555555-5555-5555-5555-555555555555",
    email: "sarah.brand@example.com",
    password: "TestPassword!2026",
    aud: "authenticated",
    role: "authenticated",
    created_at: older,
    user_metadata: { full_name: "Sarah Jenkins" },
    app_metadata: { provider: "email", providers: ["email"] },
  };

  const profiles: Profile[] = [
    {
      id: DEFAULT_CREDENTIALS.client.id,
      full_name: DEFAULT_CREDENTIALS.client.name,
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
      headline: "Product Lead & Founder",
      bio: "Building innovative software products. Looking for talented engineers, designers, and creative specialists for ongoing projects.",
      category: "client",
      hourly_rate: null,
      skills: ["Product Strategy", "Agile", "Hiring"],
      portfolio_url: "https://craftroll.com",
      resume_url: null,
      years_experience: 8,
      created_at: older,
      updated_at: older,
    },
    {
      id: DEFAULT_CREDENTIALS.freelancer.id,
      full_name: DEFAULT_CREDENTIALS.freelancer.name,
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
      headline: "Senior Full-Stack & React Engineer",
      bio: "Passionate developer specializing in React 19, TypeScript, TanStack Start, and high-performance web systems. 7+ years of experience delivering clean code.",
      category: "development",
      hourly_rate: 85,
      skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Next.js", "TanStack"],
      portfolio_url: "https://github.com",
      resume_url: null,
      years_experience: 7,
      created_at: older,
      updated_at: older,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      full_name: "Elena Rostova",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
      headline: "Principal UX/UI & Product Designer",
      bio: "Crafting intuitive web interfaces and scalable design systems for high-growth startups and modern web apps.",
      category: "design",
      hourly_rate: 95,
      skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "Design Strategy"],
      portfolio_url: "https://dribbble.com",
      resume_url: null,
      years_experience: 8,
      created_at: older,
      updated_at: older,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      full_name: "Marcus Chen",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
      headline: "Cloud Architect & Distributed Systems Engineer",
      bio: "Backend specialist in Go, Python, microservices, database optimizations, and cloud deployments.",
      category: "development",
      hourly_rate: 110,
      skills: ["Go", "Node.js", "Docker", "PostgreSQL", "Cloud", "Kubernetes"],
      portfolio_url: "https://github.com",
      resume_url: null,
      years_experience: 10,
      created_at: older,
      updated_at: older,
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      full_name: "Sarah Jenkins",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
      headline: "Brand Identity Designer & Art Director",
      bio: "Creating bold visual identities, typography guidelines, and brand narratives for modern creative companies.",
      category: "design",
      hourly_rate: 75,
      skills: ["Brand Strategy", "Logo Design", "Typography", "Illustrator", "Packaging"],
      portfolio_url: "https://behance.net",
      resume_url: null,
      years_experience: 6,
      created_at: older,
      updated_at: older,
    },
  ];

  const user_roles: UserRole[] = [
    { id: "r-1", user_id: DEFAULT_CREDENTIALS.client.id, role: "client", created_at: older },
    { id: "r-2", user_id: DEFAULT_CREDENTIALS.freelancer.id, role: "freelancer", created_at: older },
    { id: "r-3", user_id: "33333333-3333-3333-3333-333333333333", role: "freelancer", created_at: older },
    { id: "r-4", user_id: "44444444-4444-4444-4444-444444444444", role: "freelancer", created_at: older },
    { id: "r-5", user_id: "55555555-5555-5555-5555-555555555555", role: "freelancer", created_at: older },
  ];

  const job_posts: JobPost[] = [
    {
      id: "job-101",
      client_id: DEFAULT_CREDENTIALS.client.id,
      title: "Interactive AI Workflow Dashboard & Analytics",
      description: "We are building an analytics and workflow execution tool for AI agent pipelines. We need a frontend engineer with strong React and TypeScript background to build reactive charts, streaming cards, and clean UI components.",
      category: "development",
      budget_type: "fixed",
      budget_min: 3000,
      budget_max: 5000,
      skills: ["React", "TypeScript", "Tailwind CSS", "Recharts"],
      status: "open",
      created_at: past,
      updated_at: past,
    },
    {
      id: "job-102",
      client_id: DEFAULT_CREDENTIALS.client.id,
      title: "Design System & Figma Component Library for Web App",
      description: "Looking for an expert UI/UX designer to craft a scalable, accessible Figma design system tokens, typography scales, dark/light themes, and core application views.",
      category: "design",
      budget_type: "fixed",
      budget_min: 2000,
      budget_max: 3500,
      skills: ["Figma", "UI/UX", "Design Systems"],
      status: "open",
      created_at: past,
      updated_at: past,
    },
    {
      id: "job-103",
      client_id: DEFAULT_CREDENTIALS.client.id,
      title: "Full-Stack TanStack Start / Next.js Marketplace Feature",
      description: "Need help implementing instant search, filter pipelines, and client-side database caching for our freelance marketplace platform.",
      category: "development",
      budget_type: "hourly",
      budget_min: 70,
      budget_max: 100,
      skills: ["React", "TypeScript", "Database", "Vite"],
      status: "open",
      created_at: past,
      updated_at: past,
    },
  ];

  const proposals: Proposal[] = [
    {
      id: "prop-101",
      job_post_id: "job-101",
      freelancer_id: DEFAULT_CREDENTIALS.freelancer.id,
      bid_amount: 3500,
      estimated_days: 12,
      cover_letter: "I've built several interactive dashboard apps in React and TypeScript with responsive charts. I can deliver a clean, fast solution.",
      status: "accepted",
      created_at: past,
      updated_at: past,
    },
    {
      id: "prop-102",
      job_post_id: "job-102",
      freelancer_id: "33333333-3333-3333-3333-333333333333",
      bid_amount: 2500,
      estimated_days: 10,
      cover_letter: "Design systems are my specialty. I will build an organized Figma file with variables, tokens, and responsive autolayout components.",
      status: "pending",
      created_at: past,
      updated_at: past,
    },
  ];

  const bookings: Booking[] = [
    {
      id: "book-101",
      client_id: DEFAULT_CREDENTIALS.client.id,
      freelancer_id: DEFAULT_CREDENTIALS.freelancer.id,
      job_post_id: "job-101",
      title: "Interactive AI Workflow Dashboard & Analytics",
      description: "Development contract for the core analytics view and streaming pipeline integration.",
      price: 3500,
      hourly_rate: null,
      contract_type: "fixed",
      status: "accepted",
      scheduled_for: now,
      created_at: past,
      updated_at: now,
    },
    {
      id: "book-102",
      client_id: DEFAULT_CREDENTIALS.client.id,
      freelancer_id: "33333333-3333-3333-3333-333333333333",
      job_post_id: "job-102",
      title: "Brand & Design System Phase 1",
      description: "Core Figma component library delivery.",
      price: 1800,
      hourly_rate: null,
      contract_type: "fixed",
      status: "completed",
      scheduled_for: past,
      created_at: older,
      updated_at: past,
    },
  ];

  const messages: Message[] = [
    {
      id: "msg-101",
      booking_id: "book-101",
      sender_id: DEFAULT_CREDENTIALS.client.id,
      body: "Hi! Excited to work together on the AI Workflow dashboard. When can we kick off?",
      created_at: past,
    },
    {
      id: "msg-102",
      booking_id: "book-101",
      sender_id: DEFAULT_CREDENTIALS.freelancer.id,
      body: "Hey! Glad to be onboard. I've reviewed the requirements and will have initial mockups and API bindings ready by tomorrow.",
      created_at: past,
    },
    {
      id: "msg-103",
      booking_id: "book-101",
      sender_id: DEFAULT_CREDENTIALS.client.id,
      body: "Sounds great! Feel free to ping here anytime if you have any questions.",
      created_at: now,
    },
  ];

  const reviews: Review[] = [
    {
      id: "rev-101",
      booking_id: "book-101",
      reviewer_id: DEFAULT_CREDENTIALS.client.id,
      reviewee_id: DEFAULT_CREDENTIALS.freelancer.id,
      rating: 5,
      comment: "Fantastic engineer! Fast communication, great TypeScript skills, delivered ahead of schedule.",
      created_at: now,
    },
    {
      id: "rev-102",
      booking_id: "book-102",
      reviewer_id: DEFAULT_CREDENTIALS.client.id,
      reviewee_id: "33333333-3333-3333-3333-333333333333",
      rating: 5,
      comment: "Elena is a world-class designer. The Figma system is organized, accessible, and delightful.",
      created_at: past,
    },
  ];

  const milestones: Milestone[] = [
    {
      id: "ms-101",
      booking_id: "book-101",
      title: "UI Architecture & Layout Kit",
      amount: 1500,
      order_index: 0,
      due_date: now,
      status: "completed",
      created_at: past,
      updated_at: now,
    },
    {
      id: "ms-102",
      booking_id: "book-101",
      title: "Real-time Charts & Streaming Endpoints",
      amount: 2000,
      order_index: 1,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "in_progress",
      created_at: past,
      updated_at: now,
    },
  ];

  const time_logs: TimeLog[] = [
    {
      id: "tl-101",
      booking_id: "book-101",
      freelancer_id: DEFAULT_CREDENTIALS.freelancer.id,
      hours: 4.5,
      notes: "Setting up layout, responsive grid, and dark mode tokens",
      logged_for: past,
      created_at: past,
    },
    {
      id: "tl-102",
      booking_id: "book-101",
      freelancer_id: DEFAULT_CREDENTIALS.freelancer.id,
      hours: 5.0,
      notes: "Connecting real-time messages and state caching",
      logged_for: now,
      created_at: now,
    },
  ];

  const saved_freelancers: SavedFreelancer[] = [
    {
      id: "sf-1",
      client_id: DEFAULT_CREDENTIALS.client.id,
      freelancer_id: DEFAULT_CREDENTIALS.freelancer.id,
      created_at: older,
    },
    {
      id: "sf-2",
      client_id: DEFAULT_CREDENTIALS.client.id,
      freelancer_id: "33333333-3333-3333-3333-333333333333",
      created_at: older,
    },
  ];

  return {
    users: [clientUser, freelancerUser, elenaUser, marcusUser, sarahUser],
    profiles,
    user_roles,
    job_posts,
    proposals,
    bookings,
    messages,
    reviews,
    milestones,
    time_logs,
    saved_freelancers,
  };
}

// In-memory fallback for SSR / non-browser environments
let inMemoryData: DatabaseTables | null = null;
let inMemorySession: Session | null = null;

export function getLocalDbData(): DatabaseTables {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    if (!inMemoryData) inMemoryData = getInitialSeedData();
    return inMemoryData;
  }

  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      const seeded = getInitialSeedData();
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("[LocalDB] Error reading from localStorage, re-seeding", e);
    const seeded = getInitialSeedData();
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
    } catch { }
    return seeded;
  }
}

export function saveLocalDbData(data: DatabaseTables): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    inMemoryData = data;
    return;
  }
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[LocalDB] Error saving to localStorage", e);
  }
}

export function resetLocalDatabase(): void {
  const seeded = getInitialSeedData();
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  inMemoryData = seeded;
  inMemorySession = null;
}

export function getStoredSession(): Session | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return inMemorySession;
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredSession(session: Session | null): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    inMemorySession = session;
    return;
  }
  try {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error("[LocalAuth] Error storing session", e);
  }
}

// ============================================================================
// REALTIME CHANNEL EVENT BUS
// ============================================================================
type ChangeCallback = (payload: { eventType: string; new: any; old: any; table: string }) => void;

interface ChannelSubscription {
  event: string;
  table: string;
  filter?: string;
  callback: ChangeCallback;
}

const activeChannels = new Map<string, ChannelSubscription[]>();

function registerChannelSubscription(channelName: string, sub: ChannelSubscription) {
  const existing = activeChannels.get(channelName) || [];
  existing.push(sub);
  activeChannels.set(channelName, existing);
}

function removeChannel(channel: LocalChannel) {
  activeChannels.delete(channel.name);
}

function notifyTableChange(table: string, eventType: string, records: any[]) {
  activeChannels.forEach((subs) => {
    subs.forEach((sub) => {
      if (sub.table === table && (sub.event === "*" || sub.event === eventType)) {
        records.forEach((rec) => {
          if (sub.filter) {
            // e.g. "booking_id=eq.123"
            const parts = sub.filter.split("=eq.");
            if (parts.length === 2) {
              const [col, val] = parts;
              if (String(rec[col]) !== String(val)) return;
            }
          }
          try {
            sub.callback({
              eventType,
              new: rec,
              old: null,
              table,
            });
          } catch (err) {
            console.error("[Realtime] Error executing channel callback:", err);
          }
        });
      }
    });
  });
}

export class LocalChannel {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  on(
    type: "postgres_changes",
    options: { event: string; schema?: string; table: string; filter?: string },
    callback: ChangeCallback,
  ) {
    registerChannelSubscription(this.name, {
      event: options.event,
      table: options.table,
      filter: options.filter,
      callback,
    });
    return this;
  }

  subscribe() {
    return this;
  }
}

// ============================================================================
// FLUENT QUERY BUILDER
// ============================================================================
export class LocalQueryBuilder<T = any> {
  private tableName: keyof DatabaseTables;
  private selectCols: string = "*";
  private filters: Array<(row: any) => boolean> = [];
  private orderFn?: (a: any, b: any) => number;
  private limitCount?: number;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(tableName: keyof DatabaseTables) {
    this.tableName = tableName;
  }

  select(columns: string = "*") {
    this.selectCols = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => String(row[column]) === String(value));
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((row) => String(row[column]) !== String(value));
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((row) => {
      if (!Array.isArray(values)) return false;
      const strValues = values.map(String);
      return strValues.includes(String(row[column]));
    });
    return this;
  }

  or(filterStr: string) {
    // e.g. "client_id.eq.abc,freelancer_id.eq.abc"
    const parts = filterStr.split(",").map((p) => p.trim());
    this.filters.push((row) => {
      return parts.some((part) => {
        const segments = part.split(".");
        if (segments.length >= 3) {
          const col = segments[0];
          const op = segments[1];
          const val = segments.slice(2).join(".");
          if (op === "eq") return String(row[col]) === String(val);
          if (op === "neq") return String(row[col]) !== String(val);
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.orderFn = (a, b) => {
      const va = a[column];
      const vb = b[column];
      if (va == null && vb == null) return 0;
      if (va == null) return asc ? -1 : 1;
      if (vb == null) return asc ? 1 : -1;
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async insert(values: any | any[]): Promise<{ data: any; error: any }> {
    const items = Array.isArray(values) ? values : [values];
    const data = getLocalDbData();
    const table = ((data as any)[this.tableName] = (data as any)[this.tableName] || []);

    const inserted = items.map((item) => {
      const now = new Date().toISOString();
      const row = {
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || now,
        updated_at: item.updated_at || now,
        ...item,
      };
      table.push(row);
      return row;
    });

    saveLocalDbData(data);
    notifyTableChange(this.tableName as string, "INSERT", inserted);
    const result = Array.isArray(values) ? inserted : inserted[0];
    return { data: result, error: null };
  }

  async update(values: Record<string, any>): Promise<{ data: any; error: any }> {
    const data = getLocalDbData();
    const table = ((data as any)[this.tableName] = (data as any)[this.tableName] || []);
    const updated: any[] = [];

    table.forEach((row: any, idx: number) => {
      if (this.filters.every((f) => f(row))) {
        const newRow = {
          ...row,
          ...values,
          updated_at: new Date().toISOString(),
        };
        table[idx] = newRow;
        updated.push(newRow);
      }
    });

    saveLocalDbData(data);
    notifyTableChange(this.tableName as string, "UPDATE", updated);
    return { data: updated, error: null };
  }

  async delete(): Promise<{ data: any; error: any }> {
    const data = getLocalDbData();
    const table = ((data as any)[this.tableName] = (data as any)[this.tableName] || []);
    const deleted: any[] = [];
    const remaining: any[] = [];

    table.forEach((row: any) => {
      if (this.filters.every((f) => f(row))) {
        deleted.push(row);
      } else {
        remaining.push(row);
      }
    });

    (data as any)[this.tableName] = remaining;
    saveLocalDbData(data);
    notifyTableChange(this.tableName as string, "DELETE", deleted);
    return { data: deleted, error: null };
  }

  // Makes query builder directly awaitable via `await supabase.from(...).select(...)`
  then(onfulfilled?: (value: { data: any; error: any }) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any; error: any }> {
    const data = getLocalDbData();
    const table = (data as any)[this.tableName] || [];
    let rows = table.filter((row: any) => this.filters.every((f) => f(row)));

    if (this.orderFn) {
      rows = [...rows].sort(this.orderFn);
    }
    if (this.limitCount != null) {
      rows = rows.slice(0, this.limitCount);
    }

    // Filter columns if specific ones were requested
    if (this.selectCols && this.selectCols !== "*") {
      const cols = this.selectCols.split(",").map((c) => c.trim());
      rows = rows.map((r: any) => {
        const picked: any = {};
        cols.forEach((col) => {
          if (col in r) picked[col] = r[col];
        });
        return picked;
      });
    }

    if (this.isSingle) {
      if (rows.length === 0) return { data: null, error: new Error("Row not found") };
      return { data: rows[0], error: null };
    }
    if (this.isMaybeSingle) {
      return { data: rows[0] || null, error: null };
    }

    return { data: rows, error: null };
  }
}

// ============================================================================
// AUTH ENGINE
// ============================================================================
type AuthStateCallback = (event: string, session: Session | null) => void;

export class LocalAuth {
  private listeners: AuthStateCallback[] = [];

  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    return { data: { session: getStoredSession() }, error: null };
  }

  async getUser(): Promise<{ data: { user: User | null }; error: null }> {
    const session = getStoredSession();
    return { data: { user: session?.user || null }, error: null };
  }

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ data: { user: User | null; session: Session | null }; error: any }> {
    const data = getLocalDbData();
    const user = (data.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      return {
        data: { user: null, session: null },
        error: new Error("Invalid login credentials"),
      };
    }

    const session: Session = {
      access_token: `local_token_${user.id}_${Date.now()}`,
      refresh_token: `local_refresh_${user.id}`,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
      user,
    };

    saveStoredSession(session);
    this.notify("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  }

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: Record<string, any>; emailRedirectTo?: string };
  }): Promise<{ data: { user: User | null; session: Session | null }; error: any }> {
    const data = getLocalDbData();
    const existing = (data.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return {
        data: { user: null, session: null },
        error: new Error("User already registered with this email"),
      };
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const fullName = options?.data?.full_name || email.split("@")[0];

    const newUser: User = {
      id: userId,
      email: email.toLowerCase(),
      password,
      aud: "authenticated",
      role: "authenticated",
      created_at: now,
      user_metadata: { full_name: fullName, ...(options?.data || {}) },
      app_metadata: { provider: "email", providers: ["email"] },
    };

    data.users.push(newUser);

    // Auto-create matching profile
    data.profiles.push({
      id: userId,
      full_name: fullName,
      avatar_url: null,
      headline: null,
      bio: null,
      category: null,
      hourly_rate: null,
      skills: [],
      portfolio_url: null,
      resume_url: null,
      years_experience: null,
      created_at: now,
      updated_at: now,
    });

    saveLocalDbData(data);

    const session: Session = {
      access_token: `local_token_${userId}_${Date.now()}`,
      refresh_token: `local_refresh_${userId}`,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
      user: newUser,
    };

    saveStoredSession(session);
    this.notify("SIGNED_IN", session);
    return { data: { user: newUser, session }, error: null };
  }

  async signOut(): Promise<{ error: null }> {
    saveStoredSession(null);
    this.notify("SIGNED_OUT", null);
    return { error: null };
  }

  async setSession(tokens: any): Promise<{ data: { session: Session | null }; error: null }> {
    if (tokens?.user) {
      const session: Session = {
        access_token: tokens.access_token || `local_token_${Date.now()}`,
        refresh_token: tokens.refresh_token || `local_refresh_${Date.now()}`,
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
        user: tokens.user,
      };
      saveStoredSession(session);
      this.notify("SIGNED_IN", session);
    }
    return { data: { session: getStoredSession() }, error: null };
  }

  onAuthStateChange(callback: AuthStateCallback): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.push(callback);
    // Trigger initial notification asynchronously
    const current = getStoredSession();
    setTimeout(() => {
      try {
        callback(current ? "INITIAL_SESSION" : "SIGNED_OUT", current);
      } catch (err) {
        console.error(err);
      }
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  }

  private notify(event: string, session: Session | null) {
    this.listeners.forEach((l) => {
      try {
        l(event, session);
      } catch (err) {
        console.error("[LocalAuth] Error in auth listener:", err);
      }
    });
  }
}

// ============================================================================
// MAIN LOCAL SUPABASE-COMPATIBLE CLIENT
// ============================================================================
class LocalDatabaseClient {
  auth = new LocalAuth();

  from<T = any>(table: keyof DatabaseTables) {
    return new LocalQueryBuilder<T>(table);
  }

  channel(name: string) {
    return new LocalChannel(name);
  }

  removeChannel(channel: LocalChannel) {
    removeChannel(channel);
  }
}

export const localDatabase = new LocalDatabaseClient();
