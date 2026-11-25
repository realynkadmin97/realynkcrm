"use client";

import { useMemo, useRef, useState } from "react";
import { addCleanedLeads, createCleanerList, removeCleanerList, saveCleanerList } from "@/app/clean-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CANONICAL,
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

type Job = { header: "Company" | "Title"; label: string };

export function CleanerDesk({ initialLists, canPromote }: { initialLists: CleanerList[]; canPromote: boolean }) {
  const [lists, setLists] = useState(initialLists);
  const [activeId, setActiveId] = useState(initialLists[0]?.id ?? "");
  const active = lists.find((list) => list.id === activeId) ?? null;
  const [name, setName] = useState(active?.name ?? "");
  const [headers, setHeaders] = useState(active?.headers ?? []);
  const [rows, setRows] = useState<CleanerRow[]>(active?.rows ?? []);
  const [checked, setChecked] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [importing, setImporting] = useState<{ headers: string[]; records: string[][]; choices: string[] } | null>(null);
  const [queue, setQueue] = useState<Job[]>([]);
  const [running, setRunning] = useState<Job | null>(null);
  const [newName, setNewName] = useState("");
  const rowsRef = useRef(rows);
  const headersRef = useRef(headers);
  const nameRef = useRef(name);
  const queueRef = useRef<Job[]>([]);
  const stopRef = useRef(false);
  const workingRef = useRef(false);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => headers.some((header) => (row[header] ?? "").toLowerCase().includes(needle)));
  }, [filter, headers, rows]);

  function load(list: CleanerList) {
    setActiveId(list.id);
    setName(list.name);
    setHeaders(list.headers);
    setRows(list.rows);
    nameRef.current = list.name;
    headersRef.current = list.headers;
    rowsRef.current = list.rows;
    setChecked([]);
    setImporting(null);
    setFilter("");
  }

  async function persist(nextName: string, nextHeaders: string[], nextRows: CleanerRow[], id = activeId) {
    if (!id) return "Open or create a list first.";
    const result = await saveCleanerList({ id, name: nextName, headers: nextHeaders, rows: nextRows });
    if ("error" in result && result.error) return result.error;
    setLists((current) =>
      current.map((list) => (list.id === id ? { ...list, name: nextName, headers: nextHeaders, rows: nextRows } : list)),
    );
    return "";
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await createCleanerList(newName || "Untitled list");
    setPending(false);
    if (!("list" in result) || !result.list) {
      setError("error" in result ? result.error : "That list could not be created.");
      return;
    }
    setLists((current) => [result.list, ...current]);
    load(result.list);
    setNewName("");
    setMessage("List created. Import a CSV when you are ready.");
  }

  function onFile(file: File | null) {
    if (!file) return;
    if (!activeId) {
      setError("Create a list before importing.");
      return;
    }
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
        setImporting({
          headers: sourceHeaders,
          records: table.slice(1),
          choices: sourceHeaders.map((header) => suggestColumn(header)),
        });
        setError("");
        setMessage("Match each column, then bring the rows into this list.");
      } catch {
        setError("That CSV could not be read.");
      }
    };
    reader.readAsText(file);
  }

  async function confirmImport() {
    if (!importing || !active) return;
    setPending(true);
    try {
      const sheet = applyMapping(importing.headers, importing.records, importing.choices);
      const problem = await persist(nameRef.current, sheet.headers, sheet.rows);
      if (problem) setError(problem);
      else {
        headersRef.current = sheet.headers;
        rowsRef.current = sheet.rows;
        setHeaders(sheet.headers);
        setRows(sheet.rows);
        setChecked([]);
        setImporting(null);
        setMessage(`${sheet.rows.length} rows saved to ${nameRef.current}.`);
        setError("");
      }
    } catch (caught) {
      setError(caught instanceof Error && caught.message.startsWith("CRM:") ? "Check the column matches and try again." : "That import could not be saved.");
    }
    setPending(false);
  }

  async function commitSheet(nextHeaders: string[], nextRows: CleanerRow[], nextName = nameRef.current) {
    headersRef.current = nextHeaders;
    rowsRef.current = nextRows;
    nameRef.current = nextName;
    setHeaders(nextHeaders);
    setRows(nextRows);
    setName(nextName);
    const problem = await persist(nextName, nextHeaders, nextRows);
    if (problem) setError(problem);
    else setError("");
    return problem;
  }

  function enqueue(header: "Company" | "Title") {
    if (!headersRef.current.includes(header)) {
      setError(`Map a ${header} column before cleaning it.`);
      return;
    }
    const job = { header, label: header === "Company" ? "Normalize company" : "Normalize titles" };
    if (running?.header === header || queueRef.current.some((item) => item.header === header)) {
      setMessage("That clean is already running or queued.");
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
      setRunning(job);
      const only = checked.length ? checked : undefined;
      const updated = normalizeColumn(rowsRef.current, job.header, only);
      rowsRef.current = updated;
      setRows(updated);
      const problem = await persist(nameRef.current, headersRef.current, updated);
      setError(problem);
      if (!problem) setMessage(`${job.label} saved.`);
      setRunning(null);
    }
    if (stopRef.current) {
      stopRef.current = false;
      queueRef.current = [];
      setQueue([]);
      setRunning(null);
      setMessage("Stopped. Finished rows stay on the sheet.");
    }
    workingRef.current = false;
  }

  function stop() {
    stopRef.current = true;
    queueRef.current = [];
    setQueue([]);
    setMessage("Stopping after the current clean.");
  }

  async function addToPipeline() {
    const chosen = checked.length ? rows.filter((row) => checked.includes(row[ROW_ID] ?? "")) : rows;
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

  function download() {
    const csv = toCsv(headers, rows);
    const href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = `${name || "leads"}.csv`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => load(list)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm ${list.id === activeId ? "border-primary bg-primary/10" : "border-border"}`}
            >
              {list.name}
            </button>
          ))}
        </div>
        <form onSubmit={onCreate} className="flex gap-2">
          <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="New list name" aria-label="New list name" />
          <Button type="submit" disabled={pending}>
            New list
          </Button>
        </form>
      </div>

      <p className="text-sm text-muted-foreground">
        Industry lookup, email verification, and ICP scoring stay off until a server key is configured. This desk does not send the sheet to an outside service.
      </p>
      {message ? <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{message}</p> : null}
      {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      {!active ? <p className="text-sm text-muted-foreground">Create a list to import the first CSV.</p> : null}

      {active ? (
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <Input
            value={name}
            onChange={(event) => {
              nameRef.current = event.target.value;
              setName(event.target.value);
            }}
            aria-label="List name"
            className="md:max-w-xs"
          />
          <Button type="button" variant="outline" onClick={() => commitSheet(headers, rows, name)} disabled={pending}>
            Save
          </Button>
          <label className="text-sm">
            <span className="sr-only">CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="block text-sm"
              onChange={(event) => {
                onFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
          </label>
          <Button type="button" variant="outline" onClick={() => enqueue("Company")}>
            Normalize company
          </Button>
          <Button type="button" variant="outline" onClick={() => enqueue("Title")}>
            Normalize titles
          </Button>
          <Button type="button" variant="outline" onClick={download} disabled={!rows.length}>
            Export CSV
          </Button>
          {canPromote ? (
            <Button type="button" onClick={addToPipeline} disabled={pending || !rows.length}>
              Add to pipeline
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Export the CSV, or ask a manager to add these rows to the pipeline.</p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const result = await removeCleanerList(active.id);
              if ("error" in result && result.error) setError(result.error);
              else {
                const next = lists.filter((list) => list.id !== active.id);
                setLists(next);
                if (next[0]) load(next[0]);
                else {
                  setActiveId("");
                  setHeaders([]);
                  setRows([]);
                  headersRef.current = [];
                  rowsRef.current = [];
                }
                setMessage("List removed.");
              }
            }}
          >
            Remove list
          </Button>
          {running || queue.length ? (
            <Button type="button" variant="outline" onClick={stop}>
              Stop
            </Button>
          ) : null}
          {running ? <span className="text-sm">Running {running.label}</span> : null}
          {queue.map((job) => (
            <span key={job.header} className="text-sm text-muted-foreground">
              Queued {job.label}
            </span>
          ))}
        </div>
      ) : null}

      {importing ? (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <p className="font-medium">Match the columns</p>
          {importing.headers.map((header, index) => (
            <label key={`${header}-${index}`} className="grid gap-1 text-sm md:grid-cols-[1fr_16rem] md:items-center">
              <span>{header || `Column ${index + 1}`}</span>
              <select
                value={importing.choices[index]}
                onChange={(event) =>
                  setImporting((current) =>
                    current
                      ? { ...current, choices: current.choices.map((choice, choiceIndex) => (choiceIndex === index ? event.target.value : choice)) }
                      : current,
                  )
                }
                className="h-8 rounded-lg border border-input bg-transparent px-2"
              >
                <option value="skip">Skip</option>
                <option value="extra">Keep as its own column</option>
                {CANONICAL.map((field) => (
                  <option key={field.label} value={field.label}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="flex gap-2">
            <Button type="button" onClick={confirmImport} disabled={pending}>
              Import rows
            </Button>
            <Button type="button" variant="outline" onClick={() => setImporting(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {active && headers.length > 0 ? (
        <>
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter visible rows" aria-label="Filter rows" className="md:max-w-sm" />
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-2">
                    <input
                      type="checkbox"
                      aria-label="Select visible rows"
                      checked={visible.length > 0 && visible.every((row) => checked.includes(row[ROW_ID] ?? ""))}
                      onChange={(event) => {
                        const ids = visible.map((row) => row[ROW_ID] ?? "");
                        setChecked((current) => (event.target.checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id))));
                      }}
                    />
                  </th>
                  {headers.map((header) => (
                    <th key={header} className="p-2 font-medium">
                      <span className="flex items-center gap-2">
                        <input
                          defaultValue={header}
                          aria-label={`Rename ${header}`}
                          className="w-full min-w-28 bg-transparent"
                          onBlur={async (event) => {
                            const next = event.target.value;
                            if (next === header) return;
                            try {
                              const sheet = renameHeader(headersRef.current, rowsRef.current, header, next);
                              await commitSheet(sheet.headers, sheet.rows);
                            } catch {
                              event.target.value = header;
                              setError("That column name is already in the sheet.");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="text-xs text-muted-foreground"
                          onClick={async () => {
                            const sheet = removeHeader(headersRef.current, rowsRef.current, header);
                            await commitSheet(sheet.headers, sheet.rows);
                            setMessage(`${header} removed.`);
                          }}
                        >
                          Remove
                        </button>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const id = row[ROW_ID] ?? "";
                  return (
                    <tr key={id} className="border-b border-border align-top">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          aria-label="Select row"
                          checked={checked.includes(id)}
                          onChange={(event) =>
                            setChecked((current) => (event.target.checked ? [...current, id] : current.filter((item) => item !== id)))
                          }
                        />
                      </td>
                      {headers.map((header) => (
                        <td key={header} className="p-2">
                          <textarea
                            value={row[header] ?? ""}
                            rows={Math.min(4, Math.max(1, Math.ceil((row[header] ?? "").length / 28)))}
                            className="w-full min-w-36 resize-y rounded-md border border-transparent bg-transparent px-1 py-1 hover:border-border focus:border-ring focus:outline-none"
                            onChange={(event) => {
                              const value = event.target.value.slice(0, 4000);
                              const next = rowsRef.current.map((item) => (item[ROW_ID] === id ? { ...item, [header]: value } : item));
                              rowsRef.current = next;
                              setRows(next);
                            }}
                            onBlur={() => commitSheet(headersRef.current, rowsRef.current)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {visible.length === 0 ? <p className="text-sm text-muted-foreground">No rows match that filter.</p> : null}
        </>
      ) : null}
    </div>
  );
}
