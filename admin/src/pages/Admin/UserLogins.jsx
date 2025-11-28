import { useContext, useEffect, useState, useCallback } from "react";
import { AdminContext } from "../../context/AdminContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-toastify";

dayjs.extend(relativeTime);

const columns = [
  { key: "createdAt", label: "Time" },
  { key: "email", label: "Email" },
  { key: "name", label: "Name" },
  { key: "method", label: "Method" },
  { key: "success", label: "Status" },
  { key: "ip", label: "IP" },
];

const UserLogins = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    email: "",
    method: "",
    success: "",
  });

  const fetchLogins = useCallback(
    async (pageOverride = page) => {
      try {
        if (!aToken) {
          toast.error("Missing admin token. Please login again.");
          return;
        }
        if (!backendUrl) {
          toast.error("Backend URL is not configured (VITE_BACKEND_URL).");
          return;
        }
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", pageOverride);
        params.append("limit", limit);
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params.append(k, v);
        });
        const url = `${backendUrl}/api/admin/login-events?${params.toString()}`;
        let res = await fetch(url, {
          headers: { aToken },
        });
        let contentType = res.headers.get("content-type") || "";
        // Fallback to POST if backend version doesn't support GET
        if (!res.ok || !contentType.includes("application/json")) {
          const paramsObj = { page: pageOverride, limit, ...filters };
          const postUrl = `${backendUrl}/api/admin/login-events`;
          res = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", aToken },
            body: JSON.stringify(paramsObj),
          });
          contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            const text = await res.text();
            const snippet = text.slice(0, 200).replace(/\s+/g, " ").trim();
            throw new Error(`Non-JSON response from ${postUrl}: ${snippet}`);
          }
        }
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
          setPage(data.page);
          setTotal(data.total);
        } else {
          toast.error(data.message || "Failed to load login events");
        }
      } catch (e) {
        console.error("UserLogins fetch error:", e);
        toast.error(e.message || "Failed to load login events");
      } finally {
        setLoading(false);
      }
    },
    [aToken, backendUrl, filters, limit, page]
  );

  useEffect(() => {
    fetchLogins(1);
  }, [fetchLogins]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="w-full p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-4">User Login Events</h1>
      <div className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <input
            value={filters.email}
            onChange={(e) =>
              setFilters((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="Filter email"
            className="border p-2 rounded"
          />
          <select
            value={filters.method}
            onChange={(e) =>
              setFilters((f) => ({ ...f, method: e.target.value }))
            }
            className="border p-2 rounded"
          >
            <option value="">All Methods</option>
            <option value="password">Password</option>
            <option value="google">Google</option>
          </select>
          <select
            value={filters.success}
            onChange={(e) =>
              setFilters((f) => ({ ...f, success: e.target.value }))
            }
            className="border p-2 rounded"
          >
            <option value="">All Status</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </select>
          <button
            onClick={() => {
              setFilters({ email: "", method: "", success: "" });
            }}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded"
          >
            Reset Filters
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={loading || page <= 1}
            onClick={() => fetchLogins(page - 1)}
            className="px-3 py-2 bg-blue-50 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={loading || page >= totalPages}
            onClick={() => fetchLogins(page + 1)}
            className="px-3 py-2 bg-blue-50 border rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            disabled={loading}
            onClick={() => fetchLogins(page)}
            className="px-3 py-2 bg-green-50 border rounded"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left font-medium p-2 border-b">
                  {c.label}
                </th>
              ))}
              <th className="text-left font-medium p-2 border-b">
                UA (truncated)
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="p-4 text-center">
                  No login events found
                </td>
              </tr>
            )}
            {!loading &&
              items.map((ev) => (
                <tr key={ev._id} className="odd:bg-white even:bg-gray-50">
                  <td
                    className="p-2 border-b whitespace-nowrap"
                    title={ev.createdAt}
                  >
                    {dayjs(ev.createdAt).fromNow()}
                  </td>
                  <td className="p-2 border-b">{ev.email}</td>
                  <td className="p-2 border-b">{ev.name || "-"}</td>
                  <td className="p-2 border-b capitalize">{ev.method}</td>
                  <td className="p-2 border-b">
                    {ev.success ? (
                      <span className="text-green-600">Success</span>
                    ) : (
                      <span className="text-red-600">Failed</span>
                    )}
                  </td>
                  <td className="p-2 border-b">{ev.ip || "-"}</td>
                  <td
                    className="p-2 border-b max-w-xs truncate"
                    title={ev.userAgent}
                  >
                    {ev.userAgent || "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserLogins;
