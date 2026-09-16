"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, UserPlus } from "lucide-react";
import { addEmployee, renameEmployee } from "@/lib/employee-actions";

type EmployeeRow = {
  id: number;
  name: string;
  logCount: number;
  avgAccuracy: number;
  lastActive: Date | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function EmployeesTable({ employees }: { employees: EmployeeRow[] }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      await addEmployee(newName.trim());
      setNewName("");
      setAdding(false);
    });
  }

  function submitRename(id: number) {
    if (!editName.trim()) return;
    startTransition(async () => {
      await renameEmployee(id, editName.trim());
      setEditingId(null);
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <div className="text-sm font-semibold text-neutral-900">
          Employees ({employees.length})
        </div>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            <UserPlus size={13} /> Add Employee
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAdd()}
              placeholder="Full name"
              className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={submitAdd}
              className="rounded-full bg-neutral-900 p-1.5 text-white"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full border border-neutral-300 p-1.5"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3 px-4 py-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
        <div>Name</div>
        <div>Logs</div>
        <div>Avg. Accuracy</div>
        <div>Last Active</div>
        <div></div>
      </div>

      {employees.map((emp) => (
        <div
          key={emp.id}
          className="grid grid-cols-5 items-center gap-3 border-t border-neutral-100 px-4 py-3 text-sm"
        >
          {editingId === emp.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitRename(emp.id)}
              className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
            />
          ) : (
            <div className="font-medium text-neutral-900">{emp.name}</div>
          )}
          <div className="text-neutral-600">{emp.logCount}</div>
          <div className="text-neutral-600">
            {emp.logCount ? `${emp.avgAccuracy}%` : "—"}
          </div>
          <div className="text-neutral-600">
            {emp.lastActive ? dateFormatter.format(emp.lastActive) : "—"}
          </div>
          <div className="flex justify-end">
            {editingId === emp.id ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => submitRename(emp.id)}
                  className="rounded-full bg-neutral-900 p-1.5 text-white"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-full border border-neutral-300 p-1.5"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingId(emp.id);
                  setEditName(emp.name);
                }}
                className="rounded-full border border-neutral-300 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
