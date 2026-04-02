import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  try {
    const existing = await storage.getUserByUsername("admin");
    const defaultPassword = "noteman2026";
    
    if (!existing) {
      await storage.createUser({
        username: "admin",
        password: defaultPassword,
      });
      console.log("Admin seeded.");
    } else {
      // If admin exists, ensure the password is hashed (simple check)
      // Bcrypt hashes usually start with $2a$ or $2b$
      if (!existing.password.startsWith("$2a$") && !existing.password.startsWith("$2b$")) {
        console.log(`Current password: ${existing.password.slice(0, 3)}...`);
        console.log("Admin exists but password is not hashed. Updating...");
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, existing.id));
        console.log("Admin password updated to a hashed version.");
      } else {
        console.log("Admin already exists and is already secured (hashed).");
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedAdmin();
