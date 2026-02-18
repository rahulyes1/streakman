"use client";

const AUTH_COOKIE_NAME = "streakman_auth";
const AUTH_USER_KEY = "streakman_auth_user";
const AUTH_USERS_KEY = "streakman_auth_users";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function readJSON(key, fallbackValue) {
  if (!canUseBrowserStorage()) return fallbackValue;

  const raw = localStorage.getItem(key);
  if (!raw) return fallbackValue;

  try {
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function writeJSON(key, value) {
  if (!canUseBrowserStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function setSessionCookie() {
  if (!canUseBrowserStorage()) return;
  document.cookie = `${AUTH_COOKIE_NAME}=1; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

function clearSessionCookie() {
  if (!canUseBrowserStorage()) return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function emitAuthUpdated() {
  if (!canUseBrowserStorage()) return;
  window.dispatchEvent(new Event("authUpdated"));
}

export function getCurrentUser() {
  return readJSON(AUTH_USER_KEY, null);
}

export function signOut() {
  if (!canUseBrowserStorage()) return;
  localStorage.removeItem(AUTH_USER_KEY);
  clearSessionCookie();
  emitAuthUpdated();
}

export function signInWithEmail({ email, password }) {
  const users = readJSON(AUTH_USERS_KEY, []);
  const normalizedEmail = normalizeEmail(email);

  const user = users.find((item) => item.email === normalizedEmail);
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  writeJSON(AUTH_USER_KEY, sessionUser);
  setSessionCookie();
  emitAuthUpdated();

  return sessionUser;
}

export function registerWithEmail({ name, email, password }) {
  const users = readJSON(AUTH_USERS_KEY, []);
  const normalizedEmail = normalizeEmail(email);

  const exists = users.some((item) => item.email === normalizedEmail);
  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  writeJSON(AUTH_USERS_KEY, [...users, newUser]);

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  writeJSON(AUTH_USER_KEY, sessionUser);
  setSessionCookie();
  emitAuthUpdated();

  return sessionUser;
}
