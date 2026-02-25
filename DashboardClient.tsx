"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Player, FuelLog } from "@/lib/types";
import { pct, statusFromPctOff } from "@/lib/format";

function pctOff(actual: number | null, advised: number | null): number | null {
  if (advised === null || advised === 0 || actual === null) return null;
  return (actual - advised) / advised;
}

function agg(logs: FuelLog[]) {
  const sum = (k: keyof FuelLog) => logs.reduce((a, r) => a + (Number(r[k] ?? 0) || 0), 0);
  const choA = sum("cho_advised_g"); const choX = sum("cho_actual_g");
  const proA = sum("pro_advised_g"); const proX = sum("pro_actual_g");
  const fatA = sum("fat_advised_g"); const fatX = sum("fat_actual_g");
  return {
    cho: { advised: choA, actual: choX, pct: pctOff(choX || null, choA || null) },
    pro: { advised: proA, actual: proX, pct: pctOff(proX || null, proA || null) },
    fat: { advised: fatA, actual: fatX, pct: pctOff(fatX || null, fatA || null) },
  };
}

export default function DashboardClient() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string>("");
  const [gameWeek, setGameWeek] = useState<number>(1);
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: p } = await supabase.from("players").select("*").order("created_at");
      setPlayers((p ?? []) as Player[]);
      const defaultId = (p?.[0] as any)?.id ?? "";
      setPlayerId(defaultId);
      setLoading(false);
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

  const a = useMemo(() => agg(logs), [logs]);

  function Metric({ label, pctOffValue, advised, actual }: any) {
    const s = statusFromPctOff(pctOffValue);
    return (
      <div className="card">
        <h3>{label}</h3>
        <div className="metric">
          <div>
            <div className="value">{pct(pctOffValue)}</div>
            <div className="sub">{Math.round(actual)}g actual • {Math.round(advised)}g advised</div>
          </div>
          <div className={"badge " + s.tone}>{s.label}</div>
        </div>
      </div>
    );
  }

  const rowTone = (r: FuelLog) => {
    const p = pctOff(r.cho_actual_g, r.cho_advised_g);
    const s = statusFromPctOff(p);
    return s.tone === "good" ? "row-good" : s.tone === "warn" ? "row-warn" : "row-bad";
  };

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
              <input
                type="number"
                value={gameWeek}
                onChange={(e) => setGameWeek(Number(e.target.value || 1))}
                min={1}
              />
            </label>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Tip: Build the week in <b>Fuel Log</b>, then review it here.
          </div>
        </div>

        <div className="card">
          <h3>What this shows</h3>
          <div className="muted">
            % Off = (Actual − Advised) ÷ Advised. Traffic lights: ±10% green, 10–20% amber, &gt;20% red.
          </div>
        </div>
      </div>

      <div className="grid cols-3">
        <Metric label="Carbs (CHO)" pctOffValue={a.cho.pct} advised={a.cho.advised} actual={a.cho.actual} />
        <Metric label="Protein (PRO)" pctOffValue={a.pro.pct} advised={a.pro.advised} actual={a.pro.actual} />
        <Metric label="Fat (FAT)" pctOffValue={a.fat.pct} advised={a.fat.advised} actual={a.fat.actual} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Week entries</h3>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th><th>Day</th>
                <th>CHO A</th><th>CHO X</th><th>PRO A</th><th>PRO X</th><th>FAT A</th><th>FAT X</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((r) => (
                <tr key={r.id} className={rowTone(r)}>
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
              {logs.length === 0 && (
                <tr><td colSpan={9} className="muted">No entries yet for this player/week.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
