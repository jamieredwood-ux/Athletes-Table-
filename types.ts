export type Player = {
  id: string;
  name: string;
  body_mass_kg: number;
};

export type FuelLog = {
  id: string;
  player_id: string;
  game_week: number;
  log_date: string; // YYYY-MM-DD
  day_label: "MD"|"MD+1"|"MD+2"|"MD+3"|"MD+4"|"MD-2"|"MD-1";
  cho_advised_g: number | null;
  cho_actual_g: number | null;
  pro_advised_g: number | null;
  pro_actual_g: number | null;
  fat_advised_g: number | null;
  fat_actual_g: number | null;
  notes: string | null;
};
