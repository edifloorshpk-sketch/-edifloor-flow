import { cookies } from "next/headers";

export interface StaffIdentity {
  id: string;
  name: string;
}

const COOKIE_NAME = "edifloor_identity";

export async function getStaffIdentity(): Promise<StaffIdentity | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export const IDENTITY_COOKIE_NAME = COOKIE_NAME;
