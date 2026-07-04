import { cookies } from "next/headers";

export type AppSession = {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  signedInAt?: string;
};

const APP_COOKIE = "myd1_app_session";

export async function getAppSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(APP_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppSession;
  } catch {
    return null;
  }
}
