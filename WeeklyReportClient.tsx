"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Player, FuelLog } from "@/lib/types";
import { pct, statusFromPctOff } from "@/lib/format";

function pctOff(actual: number | null, advised: number | null): number | null {
  if (advised === null || advised === 0 || actual === null) return null;
  return (actual - advised) / advised;
}

function sum(logs: FuelLog[], k: keyof FuelLog) {
  return logs.reduce((a, r) => a + (Number(r[k] ?? 0) || 0), 0);
}

export default function WeeklyReportClient() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string>("");
  const [gameWeek, setGameWeek] = useState<number>(1);
  const [logs, setLogs] = useState<FuelLog[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("players").select("*").order("created_at");
      setPlayers((p ?? []) as Player[]);
      setPlayerId(((p?.[0] as any)?.id) ?? "");
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
      setLogs((data ?? []) as FuelLog[]);
    })();
  }, [playerId, gameWeek]);

  const totals = useMemo(() => {
    const choA = sum(logs, "cho_advised_g"); const choX = sum(logs, "cho_actual_g");
    const proA = sum(logs, "pro_advised_g"); const proX = sum(logs, "pro_actual_g");
    const fatA = sum(logs, "fat_advised_g"); const fatX = sum(logs, "fat_actual_g");
    return {
      cho: { advised: choA, actual: choX, pct: pctOff(choX || null, choA || null) },
      pro: { advised: proA, actual: proX, pct: pctOff(proX || null, proA || null) },
      fat: { advised: fatA, actual: fatX, pct: pctOff(fatX || null, fatA || null) },
    };
  }, [logs]);

  function SummaryRow({ label, advised, actual, pctOffValue }: any) {
    const s = statusFromPctOff(pctOffValue);
    return (
      <tr>
        <td><b>{label}</b></td>
        <td>{Math.round(advised)}g</td>
        <td>{Math.round(actual)}g</td>
        <td>{pct(pctOffValue)}</td>
        <td><span className={"badge " + s.tone}>{s.label}</span></td>
      </tr>
    );
  }

  return (
    <div className="grid">
      <div className="card">
        <h3>Weekly report</h3>
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
      </div>

      <div className="card">
        <h3>Totals + compliance</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Macro</th><th>Advised</th><th>Actual</th><th>% Off</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <SummaryRow label="CHO" advised={totals.cho.advised} actual={totals.cho.actual} pctOffValue={totals.cho.pct} />
            <SummaryRow label="PRO" advised={totals.pro.advised} actual={totals.pro.actual} pctOffValue={totals.pro.pct} />
            <SummaryRow label="FAT" advised={totals.fat.advised} actual={totals.fat.actual} pctOffValue={totals.fat.pct} />
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Entries</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Day</th>
              <th>CHO A</th><th>CHO X</th>
              <th>PRO A</th><th>PRO X</th>
              <th>FAT A</th><th>FAT X</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((r) => (
              <tr key={r.id}>
                <td>{r.log_date}</td>
                <td>{r.day_label}</td>
                <td>{r.cho_advised_g ?? "—"}</td>
                <td>{r.cho_actual_g ?? "—"}</td>
                <td>{r.pro_advised_g ?? "—"}</td>
                <td>{r.pro_actual_g ?? "—"}</td>
                <td>{r.fat_advised_g ?? "—"}</td>
                <td>{r.fat_actual_g ?? "—"}</td>
                <td>{r.notes ?? ""}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={9} className="muted">No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
