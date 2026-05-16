import { config } from "dotenv";
import path from "path";

let loaded = false;

export function loadEnv(): void {
  if (loaded) return;
  config({ path: path.resolve(process.cwd(), ".env.local") });
  loaded = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    console.error("Update .env.local to point at the production Supabase project:");
    console.error("  https://supabase.com/dashboard/project/mxhwyrnitasstkzuwhlr/settings/api-keys");
    process.exit(1);
  }
  if (url.includes("127.0.0.1") || url.includes("localhost")) {
    console.warn("[warn] NEXT_PUBLIC_SUPABASE_URL points to localhost - results will NOT appear in the live Vercel app.");
    console.warn("[warn] Update .env.local with the production URL to sync results.");
  }
}
