import { useAuth } from "../stores/auth";
import API_BASE_URL from "../config/api";

// The four reading shelves a member can place a book on, in display order.
// `badge` is the Tailwind class set used to render a status pill/label.
export const SHELF_STATUSES = [
  {
    value: "want_to_read",
    label: "Want to Read",
    badge:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  {
    value: "reading",
    label: "Reading",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    value: "read",
    label: "Read",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    value: "for_swap",
    label: "For Swap",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
];

export const shelfStatusLabel = (value) =>
  SHELF_STATUSES.find((s) => s.value === value)?.label || "";

export const shelfStatusBadge = (value) =>
  SHELF_STATUSES.find((s) => s.value === value)?.badge ||
  "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

// useShelf centralizes the reading-shelf API calls so the book page, profile and
// wishlist all talk to the backend the same way.
export function useShelf() {
  const { getToken } = useAuth();

  // setStatus adds a book to the caller's shelf or moves it to a new status.
  const setStatus = async (bookId, status) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/shelf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ book_id: bookId, status }),
    });
    if (!res.ok) {
      const msg = (await res.text().catch(() => "")).trim();
      throw new Error(msg || "Failed to update shelf");
    }
    return res.json();
  };

  // removeFromShelf takes a book off the caller's shelf entirely.
  const removeFromShelf = async (bookId) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/shelf?book_id=${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("Failed to update shelf");
    }
  };

  // fetchShelf loads the caller's shelf, or another member's when userId is set.
  const fetchShelf = async (userId) => {
    const token = await getToken();
    const url = userId
      ? `${API_BASE_URL}/shelf?user_id=${userId}`
      : `${API_BASE_URL}/shelf`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      throw new Error("Failed to load shelf");
    }
    return (await res.json()) || [];
  };

  return { setStatus, removeFromShelf, fetchShelf };
}
