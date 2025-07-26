"use client";
import Link from "next/link";
import { PlusIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function QuickActions() {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-2 text-sm font-semibold text-gray-600">Quick Actions</h2>
      <div className="space-y-2">
        <Link
          href="/create"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          New Calendar
        </Link>
        <Link
          href="/calendars"
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          My Calendars
        </Link>
      </div>
    </div>
  );
}