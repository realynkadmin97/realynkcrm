import { withUser, type SqlRow } from "@/lib/db";

function text(value: unknown) {
  return value == null ? "" : String(value);
}

export type Lead = {
  id: string;
  fullName: string;
  company: string;
  email: string;
  stage: string;
  ownerId: string | null;
  ownerName: string | null;
  source: string;
  notes: string;
  updatedAt: string;
};

function mapLead(row: SqlRow): Lead {
  return {
    id: text(row.id),
    fullName: text(row.full_name),
    company: text(row.company),
    email: text(row.email),
    stage: text(row.stage),
    ownerId: row.owner_id == null ? null : text(row.owner_id),
    ownerName: row.owner_name == null ? null : text(row.owner_name),
    source: text(row.source),
    notes: text(row.notes),
    updatedAt: text(row.updated_at),
  };
}

const leadSelect = `
  select l.id, l.full_name, l.company, l.email, l.stage, l.owner_id, u.full_name as owner_name,
         l.source, l.notes, l.updated_at
  from leads l
  left join users u on u.id = l.owner_id
`;

export async function listLeads(userId: string) {
  return withUser(userId, async (query) => {
    const rows = await query(`${leadSelect} order by l.updated_at desc`);
    return rows.map(mapLead);
  });
}

export async function getLead(userId: string, id: string) {
  return withUser(userId, async (query) => {
    const rows = await query(`${leadSelect} where l.id = $1`, [id]);
    return rows[0] ? mapLead(rows[0]) : null;
  });
}

export type Opportunity = {
  id: string;
  title: string;
  stage: string;
  amount: string;
  ownerId: string | null;
  ownerName: string | null;
  leadId: string | null;
  leadCompany: string | null;
};

export async function listOpportunities(userId: string) {
  return withUser(userId, async (query) => {
    const rows = await query(`
      select o.id, o.title, o.stage, o.amount, o.owner_id, u.full_name as owner_name, o.lead_id, l.company as lead_company
      from opportunities o
      left join users u on u.id = o.owner_id
      left join leads l on l.id = o.lead_id
      order by o.updated_at desc
    `);
    return rows.map((row) => ({
      id: text(row.id),
      title: text(row.title),
      stage: text(row.stage),
      amount: text(row.amount),
      ownerId: row.owner_id == null ? null : text(row.owner_id),
      ownerName: row.owner_name == null ? null : text(row.owner_name),
      leadId: row.lead_id == null ? null : text(row.lead_id),
      leadCompany: row.lead_company == null ? null : text(row.lead_company),
    })) satisfies Opportunity[];
  });
}

export type Activity = {
  id: string;
  kind: string;
  summary: string;
  dueOn: string;
  completedAt: string;
  ownerName: string;
  leadId: string | null;
  company: string | null;
};

export async function listActivities(userId: string, leadId?: string) {
  return withUser(userId, async (query) => {
    const rows = await query(
      `
      select a.id, a.kind, a.summary, a.due_on::text as due_on, a.completed_at, u.full_name as owner_name,
             a.lead_id, l.company
      from activities a
      join users u on u.id = a.owner_id
      left join leads l on l.id = a.lead_id
      where ($1::uuid is null or a.lead_id = $1)
      order by a.completed_at nulls first, a.due_on nulls last, a.created_at desc
    `,
      [leadId ?? null],
    );
    return rows.map((row) => ({
      id: text(row.id),
      kind: text(row.kind),
      summary: text(row.summary),
      dueOn: text(row.due_on),
      completedAt: text(row.completed_at),
      ownerName: text(row.owner_name),
      leadId: row.lead_id == null ? null : text(row.lead_id),
      company: row.company == null ? null : text(row.company),
    })) satisfies Activity[];
  });
}

export async function listSalesReps(userId: string) {
  return withUser(userId, async (query) => {
    const rows = await query(
      "select id, full_name, email from users where role = 'sales' and status = 'active' order by full_name",
    );
    return rows.map((row) => ({ id: text(row.id), fullName: text(row.full_name), email: text(row.email) }));
  });
}

export async function listDirectory(userId: string) {
  return withUser(userId, async (query) => {
    const rows = await query(
      "select id, full_name, email, role, status, email_verified_at from users order by full_name",
    );
    return rows.map((row) => ({
      id: text(row.id),
      fullName: text(row.full_name),
      email: text(row.email),
      role: text(row.role),
      status: text(row.status),
      verified: row.email_verified_at != null,
    }));
  });
}

export async function dashboard(userId: string) {
  return withUser(userId, async (query) => {
    const stages = await query("select stage, count(*)::int as count from leads group by stage");
    const pipeline = await query(
      "select count(*)::int as count, coalesce(sum(amount), 0) as amount from opportunities where stage not in ('won', 'lost')",
    );
    const stale = await query(`
      select l.id, l.full_name, l.company, l.stage
      from leads l
      cross join crm_settings s
      where l.stage not in ('won', 'lost')
        and l.updated_at < now() - (s.stale_after_days * interval '1 day')
      order by l.updated_at
      limit 6
    `);
    const tasks = await query(`
      select a.id, a.summary, a.due_on::text as due_on, l.company
      from activities a
      left join leads l on l.id = a.lead_id
      where a.kind = 'task' and a.completed_at is null
      order by a.due_on nulls last
      limit 6
    `);
    return {
      stages: stages.map((row) => ({ stage: text(row.stage), count: Number(row.count) })),
      openOpportunities: Number(pipeline[0]?.count ?? 0),
      openAmount: text(pipeline[0]?.amount ?? 0),
      stale: stale.map((row) => ({
        id: text(row.id),
        fullName: text(row.full_name),
        company: text(row.company),
        stage: text(row.stage),
      })),
      tasks: tasks.map((row) => ({
        id: text(row.id),
        summary: text(row.summary),
        dueOn: text(row.due_on),
        company: text(row.company),
      })),
    };
  });
}

export async function performance(userId: string) {
  return withUser(userId, async (query) => {
    const reps = await query(`
      select u.id, u.full_name,
        count(distinct l.id)::int as leads,
        count(distinct l.id) filter (where l.stage not in ('won', 'lost'))::int as open_leads,
        count(distinct a.id) filter (where a.completed_at is null)::int as open_tasks
      from users u
      left join leads l on l.owner_id = u.id
      left join activities a on a.owner_id = u.id
      where u.role = 'sales' and u.status = 'active'
      group by u.id, u.full_name
      order by u.full_name
    `);
    const unassigned = await query("select count(*)::int as count from leads where owner_id is null");
    return {
      reps: reps.map((row) => ({
        id: text(row.id),
        fullName: text(row.full_name),
        leads: Number(row.leads),
        openLeads: Number(row.open_leads),
        openTasks: Number(row.open_tasks),
      })),
      unassigned: Number(unassigned[0]?.count ?? 0),
    };
  });
}

export async function readSettings(userId: string) {
  return withUser(userId, async (query) => {
    const settings = await query("select stale_after_days from crm_settings where id = 1");
    const access = await query("select email_domain, sample_mode from company_access where id = 1");
    return {
      staleAfterDays: Number(settings[0]?.stale_after_days ?? 7),
      emailDomain: access[0]?.email_domain == null ? null : text(access[0]?.email_domain),
      sampleMode: Boolean(access[0]?.sample_mode),
    };
  });
}
