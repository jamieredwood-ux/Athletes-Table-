"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Shell({ children }: { children: React.ReactNode }) {
  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="kicker">ATHLETES TABLE</div>
          <div className="title">Fuel Compliance Dashboard</div>
        </div>

        <div className="nav">
          <Link className="pill" href="/">Dashboard</Link>
          <Link className="pill" href="/fuel-log">Fuel Log</Link>
          <Link className="pill" href="/weekly-report">Weekly Report</Link>
          <Link className="pill" href="/players">Players</Link>
          <Link className="pill" href="/uefa">UEFA</Link>
          <button className="pill" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {children}
    </div>
  );
}
