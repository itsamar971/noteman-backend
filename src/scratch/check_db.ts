import { storage } from "../storage";
import { db } from "../db";
import { users } from "../shared/schema";

async function check() {
  try {
    const admin = await storage.getUserByUsername("admin");
    console.log("Admin User:", admin ? "Found" : "Not Found");
    process.exit(0);
  } catch (err) {
    console.error("Check Error:", err);
    process.exit(1);
  }
}

check();
