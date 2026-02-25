"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Player } from "@/lib/types";

export default function PlayersClient() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("players").select("*").order("created_at");
    if (error) alert(error.message);
    setPlayers((data ?? []) as Player[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updatePlayer(id: string, patch: Partial<Player>) {
    const { error } = await supabase.from("players").update(patch).eq("id", id);
    if (error) alert(error.message);
    await load();
  }

  async function seedIfEmpty() {
    if (players.length) return;
    const { error } = await supabase.from("players").insert([
      { name: "Player 1", body_mass_kg: 75 },
      { name: "Player 2", body_mass_kg: 75 }
    ]);
    if (error) alert(error.message);
    await load();
  }

  return (
    <div className="grid cols-2">
      <div className="card">
        <h3>Players</h3>
        <div className="muted">Set names + body mass (used for UEFA g/kg → grams conversion).</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={seedIfEmpty}>Create Player 1 & 2 (if empty)</button>
        </div>
      </div>

      <div className="card">
        <h3>Edit</h3>
        {loading ? "Loading…" : players.length === 0 ? (
          <div className="muted">No players yet. Click “Create Player 1 & 2”.</div>
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            {players.map(p => (
              <div key={p.id} className="card" style={{ padding: 14, background: "rgba(255,255,255,.02)" }}>
                <div className="split" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                  <label>
                    Name
                    <input defaultValue={p.name} onBlur={(e)=>updatePlayer(p.id, { name: e.target.value })} />
                  </label>
                  <label>
                    Body Mass (kg)
                    <input
                      type="number"
                      defaultValue={p.body_mass_kg}
                      onBlur={(e)=>updatePlayer(p.id, { body_mass_kg: Number(e.target.value || p.body_mass_kg) })}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
