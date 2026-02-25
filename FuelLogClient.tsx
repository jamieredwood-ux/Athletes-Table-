"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Player, FuelLog } from "@/lib/types";
import { safeNum, pct, statusFromPctOff } from "@/lib/format";

const DAY_LABELS = ["MD","MD+1","MD+2","MD+3","MD+4","MD-2","MD-1"] as const;

function pctOff(actual: number | null, advised: number | null): number | null {
  if (advised === null || advised === 0 || actual === null) return null;
  return (actual - advised) / advised;
}

export default function FuelLogClient() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string>("");
  const [gameWeek, setGameWeek] = useState<number>(1);
  const [rows, setRows] = useState<FuelLog[]>([]);
  const [saving, setSaving] = useState(false);

  // form fields
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [dayLabel, setDayLabel] = useState<(typeof DAY_LABELS)[number]>("MD-1");
  const [choA, setChoA] = useState(""); const [choX, setChoX] = useState("");
  const [proA, setProA] = useState(""); const [proX, setProX] = useState("");
  const [fatA, setFatA] = useState(""); const [fatX, setFatX] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("players").select("*").order("created_at");
      setPlayers((p ?? []) as Player[]);
      const defaultId = (p?.[0] as any)?.id ?? "";
      setPlayerId(defaultId);
    })();
  }, []);

  useEffect(() => {
    if (!playerId) return;
    (async () => {
      const { data } = await supabase
        .from("fuel_logs")
        .select("*")
        .eq("player_id", playerId)
        .eq("game_week", gameWeek)
        .order("log_date", { ascending: true });
      setRows((data ?? []) as FuelLog[]);
    })();
  }, [playerId, gameWeek]);

  const rowTone = (r: FuelLog) => {
    const p = pctOff(r.cho_actual_g, r.cho_advised_g);
    const s = statusFromPctOff(p);
    return s.tone === "good" ? "row-good" : s.tone === "warn" ? "row-warn" : "row-bad";
  };

  async function addRow(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId) return;

    setSaving(true);
    const payload: any = {
      player_id: playerId,
      game_week: gameWeek,
      log_date: logDate,
      day_label: dayLabel,
      cho_advised_g: safeNum(choA),
      cho_actual_g: safeNum(choX),
      pro_advised_g: safeNum(proA),
      pro_actual_g: safeNum(proX),
      fat_advised_g: safeNum(fatA),
      fat_actual_g: safeNum(fatX),
      notes: notes.trim() ? notes.trim() : null,
    };

    const { error } = await supabase.from("fuel_logs").insert(payload);
    if (error) {
      alert(error.message);
    } else {
      // refresh
      const { data } = await supabase
        .from("fuel_logs")
        .select("*")
        .eq("player_id", playerId)
        .eq("game_week", gameWeek)
        .order("log_date", { ascending: true });
      setRows((data ?? []) as FuelLog[]);
      setNotes("");
    }
    setSaving(false);
  }

  async function deleteRow(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("fuel_logs").delete().eq("id", id);
    if (error) alert(error.message);
    else setRows(rows.filter(r => r.id !== id));
  }

  return (
    <div>
      <div className="grid cols-2">
        <div className="card">
          <h3>Selection</h3>
          <div className="split">
            <label style={{ minWidth: 260 }}>
              Player
              <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
                {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label style={{ minWidth: 180 }}>
              Game Week
              <input type="number" value={gameWeek} onChange={(e)=>setGameWeek(Number(e.target.value||1))} min={1} />
            </label>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>Enter total grams only (no g/kg shown).</div>
        </div>

        <div className="card">
          <h3>Add entry</h3>
          <form className="form" onSubmit={addRow}>
            <label>
              Date
              <input type="date" value={logDate} onChange={(e)=>setLogDate(e.target.value)} />
            </label>
            <label>
              Day
              <select value={dayLabel} onChange={(e)=>setDayLabel(e.target.value as any)}>
                {DAY_LABELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label>
              CHO Advised (g)
              <input inputMode="numeric" value={choA} onChange={(e)=>setChoA(e.target.value)} placeholder="e.g. 480" />
            </label>
            <label>
              CHO Actual (g)
              <input inputMode="numeric" value={choX} onChange={(e)=>setChoX(e.target.value)} placeholder="e.g. 455" />
            </label>

            <label>
              PRO Advised (g)
              <input inputMode="numeric" value={proA} onChange={(e)=>setProA(e.target.value)} placeholder="e.g. 180" />
            </label>
            <label>
              PRO Actual (g)
              <input inputMode="numeric" value={proX} onChange={(e)=>setProX(e.target.value)} placeholder="e.g. 190" />
            </label>

            <label>
              FAT Advised (g)
              <input inputMode="numeric" value={fatA} onChange={(e)=>setFatA(e.target.value)} placeholder="e.g. 95" />
            </label>
            <label>
              FAT Actual (g)
              <input inputMode="numeric" value={fatX} onChange={(e)=>setFatX(e.target.value)} placeholder="e.g. 102" />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              Notes
              <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Optional…" />
            </label>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
              <button className="btn" disabled={saving}>{saving ? "Saving…" : "Add entry"}</button>
              <button type="button" className="btn secondary" onClick={()=>{setChoA("");setChoX("");setProA("");setProX("");setFatA("");setFatX("");setNotes("");}}>
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Entries for selected player/week</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Day</th>
              <th>CHO A</th><th>CHO X</th><th>CHO %</th>
              <th>PRO A</th><th>PRO X</th><th>PRO %</th>
              <th>FAT A</th><th>FAT X</th><th>FAT %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className={rowTone(r)}>
                <td>{r.log_date}</td>
                <td>{r.day_label}</td>
                <td>{r.cho_advised_g ?? "—"}</td>
                <td>{r.cho_actual_g ?? "—"}</td>
                <td>{pct(pctOff(r.cho_actual_g, r.cho_advised_g))}</td>
                <td>{r.pro_advised_g ?? "—"}</td>
                <td>{r.pro_actual_g ?? "—"}</td>
                <td>{pct(pctOff(r.pro_actual_g, r.pro_advised_g))}</td>
                <td>{r.fat_advised_g ?? "—"}</td>
                <td>{r.fat_actual_g ?? "—"}</td>
                <td>{pct(pctOff(r.fat_actual_g, r.fat_advised_g))}</td>
                <td><button className="btn secondary" onClick={()=>deleteRow(r.id)}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={12} className="muted">No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
