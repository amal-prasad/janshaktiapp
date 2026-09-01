// Run with: npm run seed
// Requires GOOGLE_APPLICATION_CREDENTIALS pointing at a service account key,
// and scripts/users.json (gitignored) shaped like scripts/users.example.json.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type SeedUser = { email: string; password: string; name: string; role: "admin" | "editor" };

const usersPath = path.resolve(process.cwd(), "scripts/users.json");

if (!existsSync(usersPath)) {
  console.error(
    `Missing scripts/users.json.\n` +
      `Copy scripts/users.example.json to scripts/users.json and fill in real accounts (this file is gitignored, never commit real passwords).`,
  );
  process.exit(1);
}

const users: SeedUser[] = JSON.parse(readFileSync(usersPath, "utf-8"));

// Seeding the emulators needs no key -- the SDK routes to localhost instead.
const emulated = !!process.env.FIRESTORE_EMULATOR_HOST;
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credPath && !emulated) {
  console.error(
    "Missing GOOGLE_APPLICATION_CREDENTIALS env var — point it at your service account JSON key file.",
  );
  process.exit(1);
}

initializeApp(
  emulated
    ? { projectId: process.env.GCLOUD_PROJECT ?? "demo-janshakti" }
    : { credential: existsSync(credPath!) ? cert(credPath!) : applicationDefault() },
);

const auth = getAuth();
const db = getFirestore();

async function upsertUser(u: SeedUser): Promise<void> {
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(u.email);
    uid = existing.uid;
    await auth.updateUser(uid, { password: u.password, displayName: u.name });
  } catch {
    const created = await auth.createUser({
      email: u.email,
      password: u.password,
      displayName: u.name,
    });
    uid = created.uid;
  }

  await db.collection("users").doc(uid).set(
    { uid, name: u.name, role: u.role } satisfies { uid: string; name: string; role: string },
    { merge: true },
  );

  console.log(`✔ ${u.email} -> uid=${uid} role=${u.role}`);
}

async function main() {
  for (const u of users) {
    await upsertUser(u);
  }
  console.log(`Done. Seeded ${users.length} user(s).`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
