import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Search, SlidersHorizontal, X } from "lucide-react";
import { getIssues } from "../Services/issuesService";
import { Navigate, useNavigate } from "react-router-dom";
import FlipIssue from "./FlipIssue";

function formatDateHeb(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await getIssues();
        if (!on) return;
        rows.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
        setIssues(rows);
      } catch (e) {
        setError(`לא ניתן לטעון גליונות (${e.message})`);
      } finally {
        setLoading(false);
      }
    })();
    return () => (on = false);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return issues;
    return issues.filter((x) =>
      [x.title, formatDateHeb(x.issueDate)].some((f) =>
        (f || "").toLowerCase().includes(q.toLowerCase())
      )
    );
  }, [issues, query]);

  const openIssue = (it) => {
    console.log("🧪 issue clicked:", it);
    navigate(`/issues/${it.issue_id}`, { state: it });
};

  return (
    <div dir="rtl" className="min-h-screen w-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 opacity-70" />
          <h1 className="text-xl md:text-2xl font-semibold">כל הגליונות</h1>
          <div className="ml-auto relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
            <input
              type="text"
              placeholder="חיפוש לפי שם גיליון או תאריך…"
              className="w-full rounded-xl border px-10 py-2 outline-none focus:ring-2 focus:ring-teal-700/30"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* States */}
      {loading && <div className="py-14 text-center text-gray-600">טוען…</div>}
      {!loading && error && (
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((it) => (
  <button
 key={it.issue_id}  
  onClick={() => openIssue(it)}
  className="group text-right rounded-2xl overflow-hidden border hover:shadow-md transition-shadow bg-white"
  title={it.title}
>
    <div className="aspect-[3/4] w-full bg-gray-100 flex items-center justify-center overflow-hidden">
      {it.coverImage ? (
        <img
          src={it.coverImage}
          alt={it.title}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center">
          <CalendarDays className="w-8 h-8 opacity-50" />
          <div className="mt-2 text-xs text-gray-500">אין תמונת שער</div>
        </div>
      )}
    </div>
    <div className="p-3">
      <div className="font-medium leading-tight line-clamp-2">{it.title}</div>
      <div className="text-xs text-gray-500 mt-1">{formatDateHeb(it.issueDate)}</div>
      <div className="mt-2 inline-flex items-center gap-1 text-sm text-teal-800">
        <ExternalLink className="w-4 h-4" />
        פתיחה
      </div>
    </div>
  </button>
))}

          
        </div>
      )}

      
        
      <button onClick={() => navigate("/FlipIssue")}>Analytics</button>
      <button onClick={() => navigate("/AnalyticsTable")}>Analytics</button>
      <button onClick={() => navigate("/AdvertisersList")}>Advertisers</button>
    </div>
  );
}
