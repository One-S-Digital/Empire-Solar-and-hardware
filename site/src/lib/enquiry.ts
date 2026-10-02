"use client";

import { useSyncExternalStore } from "react";

/** One line on the enquiry list. `custom` lines are free text ("not listed"). */
export type ListItem = {
  key: string;
  name: string;
  qty: number;
  brand?: string;
  code?: string;
  label?: string;
  slug?: string;
  note?: string;
  custom?: boolean;
};

const KEY = "empire_list_v1";
const EMPTY: ListItem[] = [];
const MAX_QTY = 999;

let items: ListItem[] = EMPTY;
let loaded = false;
let drawerOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) items = raw.filter((i) => i && typeof i.key === "string" && typeof i.name === "string" && i.qty > 0);
  } catch {
    /* private mode or bad data: start empty */
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    loaded = false;
    items = EMPTY;
    load();
    emit();
  });
}

function save(next: ListItem[]) {
  items = next.length ? next : EMPTY;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* the list still works for this visit */
  }
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useList(): ListItem[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return items;
    },
    () => EMPTY,
  );
}

export const useListCount = () => useList().reduce((n, i) => n + i.qty, 0);
export const useDrawerOpen = () =>
  useSyncExternalStore(
    subscribe,
    () => drawerOpen,
    () => false,
  );

export function setDrawer(open: boolean) {
  drawerOpen = open;
  emit();
}

const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));

export function addItem(item: Omit<ListItem, "qty">, qty = 1) {
  load();
  const found = items.find((i) => i.key === item.key);
  save(found ? items.map((i) => (i === found ? { ...i, qty: clamp(i.qty + qty) } : i)) : [...items, { ...item, qty: clamp(qty) }]);
}

export function addCustom(name: string, qty: number) {
  const text = name.trim();
  if (!text) return;
  addItem({ key: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name: text.slice(0, 200), custom: true }, qty);
}

export function setQty(key: string, qty: number) {
  load();
  save(items.map((i) => (i.key === key ? { ...i, qty: clamp(qty) } : i)));
}

export function setNote(key: string, note: string) {
  load();
  save(items.map((i) => (i.key === key ? { ...i, note: note.slice(0, 300) || undefined } : i)));
}

/** Returns the removed line and its position, so the caller can offer Undo. */
export function removeItem(key: string) {
  load();
  const index = items.findIndex((i) => i.key === key);
  if (index < 0) return undefined;
  const removed = items[index];
  save(items.filter((i) => i.key !== key));
  return { item: removed, index };
}

export function restoreItem(item: ListItem, index: number) {
  load();
  if (items.some((i) => i.key === item.key)) return;
  const next = [...items];
  next.splice(Math.min(index, next.length), 0, item);
  save(next);
}

export function clearList() {
  save([]);
}

/** Plain-text version of the list, for WhatsApp and the email body. */
export function listAsText(list: ListItem[]): string {
  return list
    .map((i) => {
      const parts = [`${i.qty} x ${[i.brand, i.name, i.label].filter(Boolean).join(" ")}`];
      if (i.code) parts.push(`(${i.code})`);
      if (i.note) parts.push(`- ${i.note}`);
      return parts.join(" ");
    })
    .join("\n");
}
