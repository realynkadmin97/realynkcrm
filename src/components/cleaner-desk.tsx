"use client";

import { Filter, MoreHorizontal, Pencil, Pin, PinOff, Play, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { addCleanedLeads, createCleanerList, saveCleanerList } from "@/app/clean-actions";
import {
  CANONICAL,
  MAX_COLUMNS,
  MAX_CSV_CHARS,
  ROW_ID,
  applyMapping,
  normalizeColumn,
  parseCsv,
  removeHeader,
  renameHeader,
  suggestColumn,
  toCsv,
  type CleanerRow,
} from "@/lib/cleaner";
import type { CleanerList } from "@/lib/cleaner-store";
import { emptyMeta, type CleanerMeta } from "@/lib/sheet-meta";

type Job = { header: "Company" | "Title"; label: string; only: "all" | string[] };
type Snap = { name: string; headers: string[]; rows: CleanerRow[]; meta: CleanerMeta };
type Theme = "light" | "dark";
type Density = "compact" | "comfortable";

const SAMPLE_HEADERS = ["First Name", "Last Name", "Company", "Title", "Email", "LinkedIn URL"];
const SAMPLE_ROWS: CleanerRow[] = [
  {
    [ROW_ID]: "sample-dana",
    "First Name": "Dana",
    "Last Name": "Ruiz",
    Company: "northwind clinics, llc",
    Title: "vp operations",
    Email: "dana.ruiz@northwind.example",
    "LinkedIn URL": "https://www.linkedin.com/in/dana-ruiz-example",
  },
  {
    [ROW_ID]: "sample-elena",
    "First Name": "Elena",
    "Last Name": "Brooks",
    Company: "LUMEN DENTAL GROUP INC",
    Title: "dir. of recruiting",
    Email: "elena.brooks@lumen.example",
    "LinkedIn URL": "https://www.linkedin.com/in/elena-brooks-example",
  },
];

function columnLetter(index: number) {
  let n = index;
  let label = "";
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export function CleanerDesk({ initialLists, canPromote }: { initialLists: CleanerList[]; canPromote: boolean }) {
  const [lists, setLists] = useState(initialLists);
  const [activeId, setActiveId] = useState(initialLists[0]?.id ?? "");
  const active = lists.find((list) => list.id === activeId) ?? null;
  const [name, setName] = useState(active?.name ?? "Lead Enrichment");
  const [headers, setHeaders] = useState(active?.headers ?? []);
  const [rows, setRows] = useState<CleanerRow[]>(active?.rows ?? []);
  const [meta, setMeta] = useState<CleanerMeta>(active?.meta ?? emptyMeta());
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [importing, setImporting] = useState<{ headers: string[]; records: string[][]; choices: string[] } | null>(null);
  const [queue, setQueue] = useState<Job[]>([]);
  const [running, setRunning] = useState<string>("");
  const [editing, setEditing] = useState<{ id: string; header: string; value: string } | null>(null);
  const [selected, setSelected] = useState<{ id: string; header: string } | null>(null);
  const [menu, setMenu] = useState<{ header: string; x: number; y: number } | null>(null);
  const [promptDraft, setPromptDraft] = useState<{ header: string; value: string } | null>(null);
  const [filterDraft, setFilterDraft] = useState<{ header: string; x: number; y: number; value: string } | null>(null);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [blockedTool, setBlockedTool] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [newName, setNewName] = useState("");
  const rowsRef = useRef(rows);
  const headersRef = useRef(headers);
  const nameRef = useRef(name);
  const metaRef = useRef(meta);
  const queueRef = useRef<Job[]>([]);
  const stopRef = useRef(false);
  const workingRef = useRef(false);
  const pastRef = useRef<Snap[]>([]);
  const futureRef = useRef<Snap[]>([]);
  const appearanceRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const appearancePanelRef = useRef<HTMLDivElement>(null);
  const cancelEditRef = useRef(false);
  const [appearancePos, setAppearancePos] = useState({ top: 0, left: 0 });

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const narrowed = Object.entries(columnFilters).filter(([, query]) => query.trim());
    return rows.filter((row) => {
      if (needle && !headers.some((header) => (row[header] ?? "").toLowerCase().includes(needle))) return false;
      return narrowed.every(([header, query]) => (row[header] ?? "").toLowerCase().includes(query.trim().toLowerCase()));
    });
  }, [columnFilters, filter, headers, rows]);

  useEffect(() => {
    if (!menu && !appearanceOpen && !filterDraft) return;
    function dismiss(target: EventTarget | null) {
      const node = target instanceof Node ? target : null;
      if (node && menuRef.current?.contains(node)) return;
      if (node && filterRef.current?.contains(node)) return;
      if (node && appearancePanelRef.current?.contains(node)) return;
      if (node instanceof Element && node.closest("[data-column-menu]")) return;
      if (node && appearanceRef.current?.contains(node)) return;
      setMenu(null);
      setAppearanceOpen(false);
      setFilterDraft(null);
    }
    function onPointerDown(event: PointerEvent) {
      dismiss(event.target);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenu(null);
        setAppearanceOpen(false);
        setFilterDraft(null);
      }
    }
    function onScroll() {
      dismiss(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [menu, appearanceOpen, filterDraft]);

  function remember() {
    pastRef.current = [...pastRef.current.slice(-39), { name: nameRef.current, headers: headersRef.current, rows: rowsRef.current, meta: metaRef.current }];
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  function applySnap(snap: Snap) {
    nameRef.current = snap.name;
    headersRef.current = snap.headers;
    rowsRef.current = snap.rows;
    metaRef.current = snap.meta;
    setName(snap.name);
    setHeaders(snap.headers);
    setRows(snap.rows);
    setMeta(snap.meta);
  }

  function load(list: CleanerList) {
    setActiveId(list.id);
    nameRef.current = list.name;
    headersRef.current = list.headers;
    rowsRef.current = list.rows;
    metaRef.current = list.meta;
    setName(list.name);
    setHeaders(list.headers);
    setRows(list.rows);
    setMeta(list.meta);
    setChecked([]);
    setImporting(null);
    setFilter("");
    setColumnFilters({});
    setPromptDraft(null);
    setSelected(null);
    setEditing(null);
    pastRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }

  async function persist(nextName: string, nextHeaders: string[], nextRows: CleanerRow[], nextMeta = metaRef.current, id = activeId) {
    if (!id) return "Open or create a list first.";
    const result = await saveCleanerList({ id, name: nextName, headers: nextHeaders, rows: nextRows, meta: nextMeta });
    if ("error" in result && result.error) return result.error;
    setLists((current) => current.map((list) => (list.id === id ? { ...list, name: nextName, headers: nextHeaders, rows: nextRows, meta: nextMeta } : list)));
    return "";
  }

  async function commit(nextHeaders: string[], nextRows: CleanerRow[], nextName = nameRef.current, nextMeta = metaRef.current) {
    headersRef.current = nextHeaders;
    rowsRef.current = nextRows;
    nameRef.current = nextName;
    metaRef.current = nextMeta;
    setHeaders(nextHeaders);
    setRows(nextRows);
    setName(nextName);
    setMeta(nextMeta);
    const problem = await persist(nextName, nextHeaders, nextRows, nextMeta);
    setError(problem);
    return problem;
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await createCleanerList(newName || "New client");
    setPending(false);
    if (!("list" in result) || !result.list) {
      setError("error" in result ? result.error : "That list could not be created.");
      return;
    }
    setLists((current) => [result.list, ...current]);
    load(result.list);
    setNewName("");
    setMessage("");
  }

  function onFile(file: File | null) {
    if (!file || !activeId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (text.length > MAX_CSV_CHARS) {
        setError("That file is too large to import here.");
        return;
      }
      try {
        const table = parseCsv(text);
        if (table.length < 2) {
          setError("The CSV needs a header row and at least one lead.");
          return;
        }
        const sourceHeaders = table[0] ?? [];
        setImporting({ headers: sourceHeaders, records: table.slice(1), choices: sourceHeaders.map((header) => suggestColumn(header)) });
        setError("");
      } catch {
        setError("That CSV could not be read.");
      }
    };
    reader.readAsText(file);
  }

  async function confirmImport() {
    if (!importing) return;
    setPending(true);
    try {
      const sheet = applyMapping(importing.headers, importing.records, importing.choices);
      remember();
      const problem = await commit(sheet.headers, sheet.rows);
      if (!problem) {
        setImporting(null);
        setMessage(`${sheet.rows.length} rows imported.`);
      }
    } catch {
      setError("Check the column matches and try again.");
    }
    setPending(false);
  }

  function enqueue(header: "Company" | "Title", scope: "auto" | "all" | string[] = "auto") {
    if (!headersRef.current.includes(header)) {
      setError(`Map a ${header} column before cleaning it.`);
      return;
    }
    const only = scope === "auto" ? (checked.length ? checked : "all") : scope;
    const job = { header, label: header === "Company" ? "Normalize Company" : "Normalize Titles", only };
    if (running === job.label || queueRef.current.some((item) => item.header === header)) {
      setMessage("Queued");
      return;
    }
    queueRef.current = [...queueRef.current, job];
    setQueue(queueRef.current);
    void drain();
  }

  async function drain() {
    if (workingRef.current) return;
    workingRef.current = true;
    while (queueRef.current.length > 0 && !stopRef.current) {
      const job = queueRef.current[0];
      if (!job) break;
      queueRef.current = queueRef.current.slice(1);
      setQueue(queueRef.current);
      setRunning(job.label);
      remember();
      const only = job.only === "all" ? undefined : job.only;
      const updated = normalizeColumn(rowsRef.current, job.header, only);
      const problem = await commit(headersRef.current, updated);
      if (!problem) setMessage(`${job.label} saved.`);
      setRunning("");
    }
    if (stopRef.current) {
      stopRef.current = false;
      queueRef.current = [];
      setQueue([]);
      setRunning("");
      setMessage("Stopped. Finished rows stay on the sheet.");
    }
    workingRef.current = false;
  }

  function openMenu(header: string, x: number, y: number, toggle = false) {
    const left = Math.min(Math.max(8, x), Math.max(8, window.innerWidth - 256));
    setMenu((current) => (toggle && current?.header === header ? null : { header, x: left, y: Math.max(8, y) }));
  }

  function runColumn(header: string, scope: "selected" | "all") {
    setMenu(null);
    if (header === "Company" || header === "Title") {
      enqueue(header, scope === "selected" ? checked : "all");
      return;
    }
    if (metaRef.current.prompts[header]) setBlockedTool(header);
  }

  function insertAiColumn(header: string, side: "left" | "right") {
    const headersNow = headersRef.current;
    if (headersNow.length >= MAX_COLUMNS) {
      setMenu(null);
      setError("This sheet already has 40 columns.");
      return;
    }
    const index = headersNow.indexOf(header);
    if (index < 0) return;
    let label = "New column";
    let count = 2;
    while (headersNow.includes(label)) label = `New column ${count++}`;
    const at = side === "left" ? index : index + 1;
    const nextHeaders = [...headersNow.slice(0, at), label, ...headersNow.slice(at)];
    const nextRows = rowsRef.current.map((row) => ({ ...row, [label]: "" }));
    setMenu(null);
    remember();
    void commit(nextHeaders, nextRows);
    setPromptDraft({ header: label, value: "" });
  }

  function toggleFreeze(header: string) {
    const frozen = metaRef.current.frozen.includes(header)
      ? metaRef.current.frozen.filter((item) => item !== header)
      : [...metaRef.current.frozen, header].slice(0, 12);
    const nextHeaders = [
      ...frozen.filter((item) => headersRef.current.includes(item)),
      ...headersRef.current.filter((item) => !frozen.includes(item)),
    ];
    setMenu(null);
    remember();
    void commit(nextHeaders, rowsRef.current, nameRef.current, { ...metaRef.current, frozen });
  }

  function renameFromMenu(header: string) {
    const next = window.prompt(`Rename "${header}" to`, header);
    setMenu(null);
    if (next == null) return;
    const label = next.trim();
    if (!label || label === header) return;
    try {
      const sheet = renameHeader(headersRef.current, rowsRef.current, header, label);
      const prompts = { ...metaRef.current.prompts };
      if (prompts[header]) {
        prompts[label] = prompts[header];
        delete prompts[header];
      }
      const frozen = metaRef.current.frozen.map((item) => (item === header ? label : item));
      remember();
      void commit(sheet.headers, sheet.rows, nameRef.current, { prompts, frozen });
    } catch {
      setError("That column name is already in the sheet.");
    }
  }

  function removeFromMenu(header: string) {
    const sheet = removeHeader(headersRef.current, rowsRef.current, header);
    const prompts = { ...metaRef.current.prompts };
    delete prompts[header];
    const frozen = metaRef.current.frozen.filter((item) => item !== header);
    setMenu(null);
    remember();
    void commit(sheet.headers, sheet.rows, nameRef.current, { prompts, frozen });
    setColumnFilters((current) => {
      const next = { ...current };
      delete next[header];
      return next;
    });
  }

  function download() {
    const href = URL.createObjectURL(new Blob([toCsv(headers, rows)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = `${name || "leads"}.csv`;
    link.click();
    URL.revokeObjectURL(href);
  }

  async function addToPipeline() {
    const chosen = checked.length ? rows.filter((row) => checked.includes(row[ROW_ID] ?? "")) : visible;
    const payload = chosen.map((row) => ({
      fullName: [row["First Name"], row["Last Name"]].filter(Boolean).join(" ") || row["Full Name"] || "",
      company: row.Company ?? "",
      email: row.Email ?? "",
    }));
    setPending(true);
    const result = await addCleanedLeads(payload);
    setPending(false);
    if ("added" in result) setMessage(`Added ${result.added} to the pipeline. ${result.skipped} already had that email.`);
    else setError(result.error);
  }

  function pinStyle(header: string, top?: number): React.CSSProperties {
    const index = meta.frozen.indexOf(header);
    if (index < 0) return top == null ? {} : { top };
    return { position: "sticky", left: 40 + index * 176, zIndex: top == null ? 15 : 45, top };
  }

  const rowHeight = density === "compact" ? 26 : 34;
  const dark = theme === "dark";

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden text-[13px]"
      style={{
        background: dark ? "#202124" : "#f8f9fa",
        color: dark ? "#e8eaed" : "#202124",
      }}
    >
      <header className="z-30 shrink-0 border-b px-3 py-2 sm:px-5" style={{ borderColor: dark ? "#3c4043" : "#dadce0", background: dark ? "#292a2d" : "#fff" }}>
        <div className="mx-auto flex max-w-[1600px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-medium tracking-tight">Lead Enrichment</h1>
            <p className="mt-0.5 truncate text-[11px]" style={{ color: dark ? "#9aa0a6" : "#5f6368" }}>
              Sheet + requirements saved per client · Clear to delete & re-upload
            </p>
          </div>
          <div className="toolbar-rail flex max-w-[min(100%,42rem)] shrink-0 items-center gap-2 overflow-x-auto">
            <SheetButton disabled={!canUndo} title="Undo" onClick={() => {
              const snap = pastRef.current.pop();
              if (!snap) return;
              futureRef.current.push({ name: nameRef.current, headers: headersRef.current, rows: rowsRef.current, meta: metaRef.current });
              applySnap(snap);
              setCanUndo(pastRef.current.length > 0);
              setCanRedo(true);
              void persist(snap.name, snap.headers, snap.rows, snap.meta);
            }}>Undo</SheetButton>
            <SheetButton disabled={!canRedo} title="Redo" onClick={() => {
              const snap = futureRef.current.pop();
              if (!snap) return;
              pastRef.current.push({ name: nameRef.current, headers: headersRef.current, rows: rowsRef.current, meta: metaRef.current });
              applySnap(snap);
              setCanUndo(true);
              setCanRedo(futureRef.current.length > 0);
              void persist(snap.name, snap.headers, snap.rows, snap.meta);
            }}>Redo</SheetButton>
            <SheetButton
              buttonRef={appearanceRef}
              onClick={() => {
                const rect = appearanceRef.current?.getBoundingClientRect();
                if (rect) setAppearancePos({ top: rect.bottom + 4, left: Math.max(8, rect.right - 220) });
                setMenu(null);
                setAppearanceOpen((open) => !open);
              }}
            >
              Appearance
            </SheetButton>
            <SheetButton onClick={() => { setMenu(null); setKeysOpen(true); }}>API keys</SheetButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 overflow-x-auto px-3 py-2 sm:px-5">
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            onClick={() => load(list)}
            className="shrink-0 rounded border px-2.5 py-1 text-xs font-medium"
            style={{
              borderColor: list.id === activeId ? "#1a73e8" : dark ? "#3c4043" : "#dadce0",
              background: list.id === activeId ? "#1a73e8" : dark ? "#292a2d" : "#fff",
              color: list.id === activeId ? "#fff" : dark ? "#e8eaed" : "#202124",
            }}
          >
            {list.name}
          </button>
        ))}
        <form onSubmit={onCreate} className="flex shrink-0 items-center gap-1">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="New client"
            aria-label="New client"
            className="h-7 w-36 rounded border bg-transparent px-2 text-xs outline-none"
            style={{ borderColor: dark ? "#3c4043" : "#dadce0" }}
          />
          <SheetButton type="submit" disabled={pending}>Add</SheetButton>
        </form>
      </div>

      {active ? (
        <div className="mx-auto flex w-full max-w-[1600px] shrink-0 items-center gap-2 overflow-x-auto px-3 pb-2 sm:px-5">
          <SheetButton onClick={() => enqueue("Company")}>Normalize Company</SheetButton>
          <SheetButton onClick={() => enqueue("Title")}>Normalize Titles</SheetButton>
            <SheetButton onClick={() => { setMenu(null); setBlockedTool("Scrape Industry"); }}>Scrape Industry</SheetButton>
          <SheetButton onClick={() => { setMenu(null); setBlockedTool("Verify Email"); }}>Verify Email</SheetButton>
          <SheetButton onClick={() => { setMenu(null); setBlockedTool("ICP Score"); }}>ICP Score</SheetButton>
          <SheetButton onClick={() => { setMenu(null); setBlockedTool("Custom Research"); }}>Custom Research</SheetButton>
          <SheetButton onClick={download} disabled={!rows.length}>Export</SheetButton>
          <SheetButton
            onClick={() => {
              remember();
              const label = `Column ${headers.length + 1}`;
              const nextHeaders = [...headersRef.current, label];
              const nextRows = rowsRef.current.map((row) => ({ ...row, [label]: "" }));
              void commit(nextHeaders, nextRows);
            }}
          >
            Add column
          </SheetButton>
          {canPromote ? <SheetButton accent onClick={addToPipeline} disabled={pending || !rows.length}>Add to pipeline</SheetButton> : null}
          <SheetButton
            onClick={() => {
              if (!window.confirm("Clear this client’s saved sheet? You can upload again.")) return;
              remember();
              void commit([], []);
              setMessage("Sheet cleared.");
            }}
          >
            Clear
          </SheetButton>
          {running || queue.length ? (
            <SheetButton onClick={() => { stopRef.current = true; queueRef.current = []; setQueue([]); setMessage("Stopping after the current clean."); }}>Stop</SheetButton>
          ) : null}
          <label className="shrink-0 cursor-pointer rounded border px-2.5 py-1 text-xs font-medium" style={{ borderColor: "#1a73e8", color: "#1a73e8" }}>
            Replace file
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => { onFile(event.target.files?.[0] ?? null); event.target.value = ""; }} />
          </label>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter…"
            aria-label="Filter rows"
            className="h-7 w-36 shrink-0 rounded border bg-transparent px-2 text-xs outline-none"
            style={{ borderColor: dark ? "#3c4043" : "#dadce0" }}
          />
          {running ? <span className="shrink-0 text-xs">Running {running}</span> : null}
          {queue.map((job) => <span key={job.header} className="shrink-0 text-xs">Queued {job.label}</span>)}
        </div>
      ) : null}

      {message ? <p className="mx-auto w-full max-w-[1600px] px-3 text-xs sm:px-5" style={{ color: "#1a73e8" }}>{message}</p> : null}
      {error ? <p className="mx-auto w-full max-w-[1600px] px-3 text-xs text-red-700 sm:px-5">{error}</p> : null}
      {filter ? <p className="mx-auto w-full max-w-[1600px] px-3 text-[11px] sm:px-5" style={{ color: "#5f6368" }}>Filtered · {visible.length}</p> : null}

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-3 pb-3 sm:px-5">
        {!active ? (
          <p className="m-auto text-sm">Create a client list to upload a CSV.</p>
        ) : importing ? (
          <div className="m-auto w-full max-w-2xl rounded-lg border bg-white p-5 shadow-xl" style={{ borderColor: "#dadce0", color: "#202124" }}>
            <p className="text-sm font-medium">Review import</p>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-2 border-b px-1 py-2 text-xs font-medium uppercase tracking-wide" style={{ borderColor: "#dadce0", color: "#5f6368" }}>
              <span>Your CSV column</span><span /><span>Tool field</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {importing.headers.map((header, index) => (
                <label key={`${header}-${index}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1 py-2 text-sm">
                  <span className="truncate">{header || `Column ${index + 1}`}</span>
                  <span style={{ color: "#5f6368" }}>→</span>
                  <select
                    value={importing.choices[index]}
                    onChange={(event) => setImporting((current) => current ? { ...current, choices: current.choices.map((choice, choiceIndex) => choiceIndex === index ? event.target.value : choice) } : current)}
                    className="h-9 w-full rounded border bg-white px-2 text-sm outline-none"
                    style={{ borderColor: "#dadce0" }}
                  >
                    <option value="skip">Skip</option>
                    <option value="extra">Keep as-is</option>
                    {CANONICAL.map((field) => <option key={field.label} value={field.label}>{field.label}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <SheetButton onClick={() => setImporting(null)}>Cancel</SheetButton>
              <SheetButton accent onClick={confirmImport} disabled={pending}>Import</SheetButton>
            </div>
          </div>
        ) : headers.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <label className="flex w-full max-w-lg cursor-pointer flex-col items-center justify-center gap-3 rounded border border-dashed bg-white px-6 py-16 text-center" style={{ borderColor: "#dadce0", color: "#202124" }}>
              <span className="text-sm font-medium">Upload a CSV for this client</span>
              <span className="text-xs" style={{ color: "#5f6368" }}>It will reopen next time you visit this client tab. Use Clear later to delete and upload a new file.</span>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => { onFile(event.target.files?.[0] ?? null); event.target.value = ""; }} />
            </label>
            <button
              type="button"
              className="rounded px-4 py-2 text-sm font-medium text-white"
              style={{ background: "#1a73e8" }}
              onClick={() => {
                remember();
                void commit(SAMPLE_HEADERS, SAMPLE_ROWS.map((row) => ({ ...row, [ROW_ID]: crypto.randomUUID() })));
              }}
            >
              Load sample data
            </button>
          </div>
        ) : (
          <div className="sheet-scroll min-h-0 flex-1 overflow-auto rounded border shadow-sm" style={{ borderColor: dark ? "#3c4043" : "#dadce0", background: dark ? "#202124" : "#fff" }}>
            <table className="border-collapse text-left" style={{ tableLayout: "fixed", width: Math.max(720, 40 + headers.length * 176) }}>
              <colgroup>
                <col style={{ width: 40 }} />
                {headers.map((header) => <col key={header} style={{ width: 176 }} />)}
              </colgroup>
              <thead>
                <tr style={{ height: 22 }}>
                  <th className="sticky left-0 top-0 z-40 w-10 border text-center text-[10px]" style={headStyle(dark)} />
                  {headers.map((header, index) => (
                    <th key={`letter-${header}`} className="sticky top-0 z-30 border text-center text-[10px] font-normal" style={{ ...headStyle(dark), ...pinStyle(header, 0) }}>{columnLetter(index)}</th>
                  ))}
                </tr>
                <tr style={{ height: rowHeight }}>
                  <th className="sticky left-0 z-40 w-10 border text-center text-[10px]" style={{ ...headStyle(dark), top: 22 }}>#</th>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="sticky z-30 border px-1.5 text-left text-xs font-medium"
                      style={{ ...headStyle(dark), ...pinStyle(header, 22) }}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        openMenu(header, event.clientX, event.clientY);
                      }}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-1">
                        <span className="truncate" title="Click the dots for column options">{header}</span>
                        {columnFilters[header]?.trim() ? <span className="shrink-0 text-[#fbbc04]" title="This column is filtered">●</span> : null}
                        <button
                          type="button"
                          data-column-menu=""
                          className="shrink-0 rounded p-0.5 hover:bg-black/5"
                          style={{ color: dark ? "#9aa0a6" : "#5f6368" }}
                          title={`Column options · ${header}`}
                          aria-label={`Column options for ${header}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            const rect = event.currentTarget.getBoundingClientRect();
                            openMenu(header, rect.right - 248, rect.bottom + 4, true);
                          }}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, rowIndex) => {
                  const id = row[ROW_ID] ?? String(rowIndex);
                  const on = checked.includes(id);
                  return (
                    <tr key={id} style={{ height: rowHeight, background: on ? (dark ? "#394457" : "#e8f0fe") : undefined }}>
                      <td className="sticky left-0 z-10 border text-center" style={{ background: dark ? "#292a2d" : "#f8f9fa", borderColor: dark ? "#3c4043" : "#dadce0" }}>
                        <button type="button" className="w-full text-[10px]" style={{ color: "#5f6368" }} onClick={(event) => {
                          if (event.shiftKey && checked.length) {
                            const ids = visible.map((item) => item[ROW_ID] ?? "");
                            const start = ids.indexOf(checked[checked.length - 1] ?? "");
                            const end = ids.indexOf(id);
                            const [from, to] = start < end ? [start, end] : [end, start];
                            setChecked([...new Set([...checked, ...ids.slice(from, to + 1)])]);
                          } else setChecked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
                        }}>{rowIndex + 1}</button>
                      </td>
                      {headers.map((header) => {
                        const value = row[header] ?? "";
                        const isEditing = editing?.id === id && editing.header === header;
                        const isSelected = selected?.id === id && selected.header === header;
                        return (
                          <td
                            key={header}
                            className="border px-2"
                            style={{
                              ...pinStyle(header),
                              background: meta.frozen.includes(header) ? (on ? (dark ? "#394457" : "#e8f0fe") : dark ? "#202124" : "#fff") : undefined,
                              borderColor: isSelected ? "#1a73e8" : dark ? "#3c4043" : "#e0e0e0",
                              boxShadow: isSelected ? "inset 0 0 0 1px #1a73e8" : undefined,
                            }}
                            onClick={() => setSelected({ id, header })}
                            onDoubleClick={() => setEditing({ id, header, value })}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editing.value}
                                className="w-full bg-transparent text-[13px] outline-none"
                                onChange={(event) => setEditing({ id, header, value: event.target.value.slice(0, 4000) })}
                                onBlur={(event) => {
                                  if (cancelEditRef.current) {
                                    cancelEditRef.current = false;
                                    setEditing(null);
                                    return;
                                  }
                                  const value = event.currentTarget.value.slice(0, 4000);
                                  remember();
                                  const next = rowsRef.current.map((item) => item[ROW_ID] === id ? { ...item, [header]: value } : item);
                                  setEditing(null);
                                  void commit(headersRef.current, next);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") event.currentTarget.blur();
                                  if (event.key === "Escape") {
                                    cancelEditRef.current = true;
                                    event.currentTarget.blur();
                                  }
                                }}
                              />
                            ) : (
                              <span className="block truncate" title={value.length > 28 ? value : undefined}>{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {menu ? (
        <ColumnMenu
          menuRef={menuRef}
          header={menu.header}
          x={menu.x}
          y={menu.y}
          selectedCount={checked.length}
          hasPrompt={Boolean(meta.prompts[menu.header])}
          builtin={menu.header === "Company" || menu.header === "Title"}
          frozen={meta.frozen.includes(menu.header)}
          onRunSelected={() => runColumn(menu.header, "selected")}
          onRunColumn={() => runColumn(menu.header, "all")}
          onEditPrompt={() => {
            setPromptDraft({ header: menu.header, value: meta.prompts[menu.header] ?? "" });
            setMenu(null);
          }}
          onInsertLeft={() => insertAiColumn(menu.header, "left")}
          onInsertRight={() => insertAiColumn(menu.header, "right")}
          onFilter={() => {
            setFilterDraft({ header: menu.header, x: menu.x, y: menu.y, value: columnFilters[menu.header] ?? "" });
            setMenu(null);
          }}
          onRename={() => renameFromMenu(menu.header)}
          onToggleFreeze={() => toggleFreeze(menu.header)}
          onRemove={() => removeFromMenu(menu.header)}
        />
      ) : null}

      {filterDraft ? (
        <div ref={filterRef} className="fixed z-[130] w-64 rounded border bg-white p-3 text-sm shadow-lg" style={{ top: filterDraft.y, left: filterDraft.x, borderColor: "#dadce0", color: "#202124" }}>
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "#80868b" }}>Filter · {filterDraft.header}</p>
          <input
            autoFocus
            value={filterDraft.value}
            placeholder="Contains…"
            aria-label={`Filter ${filterDraft.header}`}
            className="mt-2 h-8 w-full rounded border px-2 text-sm outline-none"
            style={{ borderColor: "#dadce0" }}
            onChange={(event) => {
              const value = event.target.value;
              setFilterDraft((current) => (current ? { ...current, value } : current));
              setColumnFilters((current) => ({ ...current, [filterDraft.header]: value }));
            }}
          />
          <button
            type="button"
            className="mt-2 text-xs"
            style={{ color: "#1a73e8" }}
            onClick={() => {
              setColumnFilters((current) => {
                const next = { ...current };
                delete next[filterDraft.header];
                return next;
              });
              setFilterDraft(null);
            }}
          >
            Clear filter
          </button>
        </div>
      ) : null}

      {appearanceOpen ? (
        <div ref={appearancePanelRef} className="fixed z-[130] w-56 rounded border bg-white p-3 text-sm shadow-lg" style={{ top: appearancePos.top, left: appearancePos.left, borderColor: "#dadce0", color: "#202124" }}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#5f6368" }}>Theme</p>
          <div className="mt-2 flex gap-2">
            <SheetButton onClick={() => setTheme("light")}>Light</SheetButton>
            <SheetButton onClick={() => setTheme("dark")}>Dark SaaS</SheetButton>
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide" style={{ color: "#5f6368" }}>Density</p>
          <div className="mt-2 flex gap-2">
            <SheetButton onClick={() => setDensity("compact")}>Compact</SheetButton>
            <SheetButton onClick={() => setDensity("comfortable")}>Comfortable</SheetButton>
          </div>
          <button type="button" className="mt-3 text-xs" style={{ color: "#1a73e8" }} onClick={() => setAppearanceOpen(false)}>Close</button>
        </div>
      ) : null}

      {promptDraft ? (
        <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/30 p-6" onClick={() => setPromptDraft(null)}>
          <div className="mt-10 w-full max-w-lg rounded-xl border bg-white p-5 shadow-xl" style={{ borderColor: "#dadce0", color: "#202124" }} onClick={(event) => event.stopPropagation()}>
            <p className="text-sm font-medium">{meta.prompts[promptDraft.header] ? "Edit prompt & model" : "Add a prompt to this column"}</p>
            <p className="mt-1 text-xs" style={{ color: "#5f6368" }}>{promptDraft.header}</p>
            <textarea
              autoFocus
              value={promptDraft.value}
              onChange={(event) => setPromptDraft({ header: promptDraft.header, value: event.target.value.slice(0, 4000) })}
              placeholder="Tell this column what to write for each row. Use {{Company}} and {{Title}} for other columns."
              className="mt-3 min-h-32 w-full resize-y rounded border px-3 py-2 font-mono text-[13px] leading-relaxed outline-none"
              style={{ borderColor: "#dadce0" }}
            />
            <p className="mt-2 text-xs" style={{ color: "#5f6368" }}>
              A custom prompt stays with this client. Running it needs a server key, which is not configured, so the desk does not send the sheet out. Company and Title still run their built-in clean.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <SheetButton onClick={() => setPromptDraft(null)}>Cancel</SheetButton>
              <SheetButton accent onClick={() => {
                const text = promptDraft.value.trim().slice(0, 4000);
                const prompts = { ...metaRef.current.prompts };
                if (text) prompts[promptDraft.header] = text;
                else delete prompts[promptDraft.header];
                const nextMeta = { ...metaRef.current, prompts };
                setPromptDraft(null);
                remember();
                void commit(headersRef.current, rowsRef.current, nameRef.current, nextMeta);
              }}>Save</SheetButton>
            </div>
          </div>
        </div>
      ) : null}

      {keysOpen || blockedTool ? (
        <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/30 p-6" onClick={() => { setKeysOpen(false); setBlockedTool(""); }}>
          <div className="mt-10 w-full max-w-lg rounded-xl border bg-white p-5 shadow-xl" style={{ borderColor: "#dadce0", color: "#202124" }} onClick={(event) => event.stopPropagation()}>
            <p className="text-sm font-medium">{blockedTool || "API keys"}</p>
            <p className="mt-2 text-sm" style={{ color: "#5f6368" }}>
              {blockedTool
                ? `${blockedTool} uses a server key. None is configured, so this desk does not send the sheet to an outside service.`
                : "Provider keys stay on the server for this company workspace. They are not saved in the browser. Normalize Company and Normalize Titles use built-in rules and do not need a key."}
            </p>
            <div className="mt-4 flex justify-end">
              <SheetButton accent onClick={() => { setKeysOpen(false); setBlockedTool(""); }}>Close</SheetButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function headStyle(dark: boolean): React.CSSProperties {
  return {
    background: dark ? "#2d2e30" : "#f8f9fa",
    color: dark ? "#9aa0a6" : "#5f6368",
    borderColor: dark ? "#3c4043" : "#dadce0",
  };
}

function SheetButton({
  children,
  onClick,
  disabled,
  title,
  accent,
  type = "button",
  buttonRef,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  accent?: boolean;
  type?: "button" | "submit";
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 rounded border px-2.5 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
      style={accent ? { borderColor: "#1a73e8", background: "#1a73e8", color: "#fff" } : { borderColor: "#dadce0", background: "#fff", color: "#202124" }}
    >
      {children}
    </button>
  );
}

function ColumnMenu({
  menuRef,
  header,
  x,
  y,
  selectedCount,
  hasPrompt,
  builtin,
  frozen,
  onRunSelected,
  onRunColumn,
  onEditPrompt,
  onInsertLeft,
  onInsertRight,
  onFilter,
  onRename,
  onToggleFreeze,
  onRemove,
}: {
  menuRef: React.Ref<HTMLDivElement>;
  header: string;
  x: number;
  y: number;
  selectedCount: number;
  hasPrompt: boolean;
  builtin: boolean;
  frozen: boolean;
  onRunSelected: () => void;
  onRunColumn: () => void;
  onEditPrompt: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onFilter: () => void;
  onRename: () => void;
  onToggleFreeze: () => void;
  onRemove: () => void;
}) {
  const canRun = builtin || hasPrompt;
  return (
    <div ref={menuRef} role="menu" aria-label={`Column options for ${header}`} className="fixed z-[130] max-h-[70vh] w-[248px] overflow-y-auto rounded border bg-white py-1 text-left shadow-lg" style={{ top: y, left: x, borderColor: "#dadce0", color: "#202124" }}>
      <MenuLabel>Enrich</MenuLabel>
      {selectedCount > 0 ? (
        <MenuItem icon={<Play className="size-3.5" />} disabled={!canRun} hint={canRun ? undefined : "Add a prompt first"} onClick={onRunSelected}>
          {`Run on ${selectedCount} selected ${selectedCount === 1 ? "row" : "rows"}`}
        </MenuItem>
      ) : null}
      <MenuItem icon={<Play className="size-3.5" />} disabled={!canRun} hint={canRun ? undefined : "Add a prompt first"} onClick={onRunColumn}>
        {selectedCount > 0 ? (builtin ? `Run whole ${header} column` : "Run whole column") : "Run column"}
      </MenuItem>
      <MenuItem icon={<Pencil className="size-3.5" />} onClick={onEditPrompt}>
        {hasPrompt ? "Edit prompt & model" : "Add a prompt to this column"}
      </MenuItem>
      <MenuRule />
      <MenuLabel>Insert</MenuLabel>
      <MenuItem icon={<Plus className="size-3.5" />} onClick={onInsertLeft}>Insert AI column left</MenuItem>
      <MenuItem icon={<Plus className="size-3.5" />} onClick={onInsertRight}>Insert AI column right</MenuItem>
      <MenuRule />
      <MenuLabel>Column</MenuLabel>
      <MenuItem icon={<Filter className="size-3.5" />} onClick={onFilter}>Filter…</MenuItem>
      <MenuItem icon={<Pencil className="size-3.5" />} onClick={onRename}>Rename</MenuItem>
      <MenuItem icon={frozen ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />} onClick={onToggleFreeze}>
        {frozen ? "Unfreeze" : "Freeze (pin left)"}
      </MenuItem>
      <MenuRule />
      <MenuItem icon={<Trash2 className="size-3.5" />} danger onClick={onRemove}>Remove column</MenuItem>
    </div>
  );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-[#80868b]">{children}</div>;
}

function MenuRule() {
  return <div className="my-1 border-t border-[#f1f3f4]" />;
}

function MenuItem({
  children,
  onClick,
  icon,
  disabled,
  hint,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      title={disabled ? hint : undefined}
      className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm ${disabled ? "cursor-not-allowed text-[#9aa0a6]" : danger ? "text-[#c5221f] hover:bg-[#f1f3f4]" : "text-[#202124] hover:bg-[#f1f3f4]"}`}
      onClick={onClick}
    >
      <span className={disabled ? "text-[#bdc1c6]" : danger ? "text-[#c5221f]" : "text-[#5f6368]"} aria-hidden="true">{icon}</span>
      <span className="flex-1">{children}</span>
      {disabled && hint ? <span className="text-[11px] text-[#9aa0a6]">{hint}</span> : null}
    </button>
  );
}
