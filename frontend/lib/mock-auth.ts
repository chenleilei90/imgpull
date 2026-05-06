"use client";

import { useSyncExternalStore } from "react";

export type MockRole = "user" | "admin";

export interface MockSession {
  role: MockRole;
  name: string;
  email: string;
  points: number;
  frozenPoints: number;
  createdAt: string;
}

const STORAGE_KEY = "imgpull.mockAuth.v1";
const AUTH_EVENT = "imgpull:mock-auth";
let cachedRaw: string | null | undefined;
let cachedSession: MockSession | null = null;

export const mockUsers: Record<MockRole, Omit<MockSession, "createdAt">> = {
  user: {
    role: "user",
    name: "运维同学",
    email: "ops@demo.com",
    points: 576,
    frozenPoints: 8
  },
  admin: {
    role: "admin",
    name: "super_admin",
    email: "admin@demo.local",
    points: 0,
    frozenPoints: 0
  }
};

export function createMockSession(role: MockRole) {
  const session: MockSession = {
    ...mockUsers[role],
    createdAt: new Date().toISOString()
  };
  const raw = JSON.stringify(session);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSession = session;
  window.dispatchEvent(new Event(AUTH_EVENT));
  return session;
}

function readMockSessionSnapshot(): MockSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSession;

  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return cachedSession;
  }

  try {
    const session = JSON.parse(raw) as MockSession;
    cachedSession = session.role === "user" || session.role === "admin" ? session : null;
    return cachedSession;
  } catch {
    cachedSession = null;
    return cachedSession;
  }
}

export function getMockSession(): MockSession | null {
  return readMockSessionSnapshot();
}

export function clearMockSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSession = null;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function subscribeMockSession(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useMockSession() {
  return useSyncExternalStore(subscribeMockSession, readMockSessionSnapshot, () => null);
}
