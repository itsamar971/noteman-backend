import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase environment variables are missing!");
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("Supabase initialized with Service Role Key (Admin Access)");
} else {
  console.log("Supabase initialized with Anon Key (Limited Access)");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
