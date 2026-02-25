"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Player } from "@/lib/types";

type Guidance = { id: number; label: string; g_per_kg_low: number | null; g_per_kg_high: number | null; notes: string | null; };

export default function UefaClient() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string>("");
  const [guidance, setGuidance] = useState<Guidance[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("players").select("*").order("created_at");
      setPlayers((p ?? []) as Player[]);
      setPlayerId(((p?.[0] as any)?.id) ?? "");
      const { data: g } = await supabase.from("uefa_guidance").select("*").order("id");
      setGuidance((g ?? []) as Guidance[]);
    })();
  }, []);

  const player = useMemo(() => players.find(p => p.id === playerId) ?? null, [players, playerId]);

  function grams(v: number | null, kg: number | null) {
    if (v === null || kg === null) return null;
    return Math.round(v * kg);
  }

  return (
    <div className="grid cols-2">
      <div className="card">
        <h3>Player conversion</h3>
        <label style={{ maxWidth: 360 }}>
          Player
          <select value={playerId} onChange={(e)=>setPlayerId(e.target.value)}>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div className="muted" style={{ marginTop: 10 }}>
          Body mass: <b>{player ? player.body_mass_kg : "—"} kg</b>
        </div>
        <div className="muted" style={{ marginTop: 10 }}>
          This page is a reference panel. Your daily plan still uses <b>total grams</b> in Fuel Log.
        </div>
      </div>

      <div className="card">
        <h3>UEFA guidance (reference)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Guideline</th>
              <th>g/kg</th>
              <th>Grams (this player)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {guidance.map(g => {
              const low = g.g_per_kg_low;
              const high = g.g_per_kg_high;
              const kg = player?.body_mass_kg ?? null;

              const gkg = high === null ? `${low ?? "—"}` : `${low ?? "—"}–${high}`;
              const gramsText = high === null
                ? (grams(low, kg) === null ? "—" : `${grams(low, kg)}g`)
                : `${grams(low, kg) ?? "—"}–${grams(high, kg) ?? "—"}g`;

              return (
                <tr key={g.id}>
                  <td>{g.label}</td>
                  <td>{gkg}</td>
                  <td>{gramsText}</td>
                  <td className="muted">{g.notes ?? ""}</td>
                </tr>
              );
            })}
            {guidance.length === 0 && <tr><td colSpan={4} className="muted">No guidance rows found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
