import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Modal } from "@/components/ui/Modal";
import { PageHead } from "@/components/ui/PageHead";
import { Status } from "@/components/ui/Status";
import { useAsync, useDebounced } from "@/hooks/useAsync";
import { errorMessage } from "@/lib/errors";
import { listUsers, setUserStatus } from "@/services/adminService";
import { User, UserRole, UserStatus } from "@/types/user";
import { formatDate } from "@/utils/format";

const roleLabel: Record<UserRole, string> = {
  donor: "Donor",
  beneficiary: "Beneficiary",
  agency: "Agency",
  admin: "Admin",
};
const statusLabel: Record<UserStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};
const statusTone: Record<UserStatus, string> = {
  active: "green",
  pending: "gold",
  suspended: "red",
};

const columns = "2fr 1fr 1.1fr 1fr 1fr 1.1fr";

type Action = { label: string; next: "active" | "suspended"; title: string };

function actionFor(user: User): Action | null {
  if (user.role === "admin") return null; // admin accounts cannot be changed here
  if (user.status === "active") return { label: "Suspend", next: "suspended", title: "Account suspended" };
  if (user.status === "suspended") return { label: "Reactivate", next: "active", title: "Account reactivated" };
  return { label: "Approve", next: "active", title: "Account approved" };
}

export default function Users() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [status, setStatus] = useState<"all" | UserStatus>("all");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [actionError, setActionError] = useState("");
  const q = useDebounced(query);

  const { data, loading, error, reload } = useAsync(
    () =>
      listUsers({
        q: q || undefined,
        role: role === "all" ? undefined : role,
        status: status === "all" ? undefined : status,
        perPage: 100,
      }),
    [q, role, status],
  );
  const users = data?.items ?? [];

  async function apply(user: User, action: Action) {
    setActionError("");
    try {
      await setUserStatus(user.id, action.next);
      setModal({
        title: action.title,
        message: `${user.name} is now ${statusLabel[action.next].toLowerCase()}.`,
      });
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Platform administration"
        title="User management"
        description="Search and manage stakeholder accounts."
      />

      <div className="panel">
        <div className="result-tools">
          <div className="search-box">
            <Search />
            <input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value as "all" | UserRole)}>
            <option value="all">All roles</option>
            {(Object.keys(roleLabel) as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {roleLabel[r]}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as "all" | UserStatus)}>
            <option value="all">All statuses</option>
            {(Object.keys(statusLabel) as UserStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </div>

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {actionError && <ErrorNotice message={actionError} />}
        {!data && loading && <Loading label="Loading users…" />}

        {data && (
          <>
            <div style={{ overflowX: "auto" }}>
              <div className="data-table" style={{ minWidth: 860 }}>
                <div className="table-head" style={{ gridTemplateColumns: columns }}>
                  <span>User</span>
                  <span>Role</span>
                  <span>County</span>
                  <span>Status</span>
                  <span>Last active</span>
                  <span />
                </div>
                {users.map((user) => {
                  const action = actionFor(user);
                  return (
                    <div className="table-row" key={user.id} style={{ gridTemplateColumns: columns }}>
                      <div>
                        <b>{user.name}</b>
                        <br />
                        <small style={{ color: "var(--muted)" }}>{user.email}</small>
                      </div>
                      <span>{roleLabel[user.role]}</span>
                      <span>{user.county ?? "-"}</span>
                      <Status tone={statusTone[user.status]}>{statusLabel[user.status]}</Status>
                      <span>{formatDate(user.lastActiveOn)}</span>
                      {action ? (
                        <Button variant="ghost" onClick={() => void apply(user, action)}>
                          {action.label}
                        </Button>
                      ) : (
                        <span />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {users.length === 0 && <p style={{ padding: "18px 4px" }}>No users match your search.</p>}
            <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 11 }}>
              Showing {users.length} of {data.total} users
            </p>
          </>
        )}
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal?.title ?? ""}>
        <p>{modal?.message}</p>
        <Button onClick={() => setModal(null)}>Done</Button>
      </Modal>
    </>
  );
}
