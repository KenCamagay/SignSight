"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FeedbackRow,
  listFeedback,
  resolveFeedback,
  getToken,
  AuditRow,
  listAudit,
  createAuditMultipart,
  AUDIT_CATEGORIES,
  absoluteUrl,
} from "../lib/api";


const FEEDBACK_CATEGORIES = [
  "general",
  "ui",
  "bug",
  "feature",
  "performance",
] as const;

const RESOLVE_UNDO_MS = 5000;


function clsx(
  ...items: Array<string | false | null | undefined>
) {
  return items.filter(Boolean).join(" ");
}


/* =========================================================
   SMALL UI HELPERS
========================================================= */

function InlineSpinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#176B49]/20 border-t-[#176B49]" />
  );
}


function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger";
}) {
  const map = {
    neutral:
      "border-[#E3E5DE] bg-[#F7F8F4] text-[#59635D]",

    ok:
      "border-[#B8DBC8] bg-[#EAF6EF] text-[#176B49]",

    warn:
      "border-[#F0D792] bg-[#FFF5D9] text-[#996D0C]",

    danger:
      "border-[#F0B9B1] bg-[#FFF0ED] text-[#B74E3E]",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold capitalize tracking-wide",
        map[tone]
      )}
    >
      {children}
    </span>
  );
}


function ExpandableText({
  text,
  previewChars = 180,
  className = "",
}: {
  text: string;
  previewChars?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const shouldClamp = text.length > previewChars;

  const shown =
    !shouldClamp || expanded
      ? text
      : `${text.slice(0, previewChars).trim()}…`;

  return (
    <div className={className}>
      <span>{shown}</span>

      {shouldClamp && (
        <>
          {" "}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-extrabold text-[#176B49] transition hover:text-[#0F563A]"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </>
      )}
    </div>
  );
}


function StatCard({
  label,
  value,
  hint,
  tone = "green",
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "green" | "orange" | "neutral";
  icon: React.ReactNode;
}) {
  const style = {
    green: {
      box: "border-[#D6E8DE] bg-[#EFF8F3]",
      icon: "bg-[#DCEFE4] text-[#176B49]",
      value: "text-[#176B49]",
    },

    orange: {
      box: "border-[#F0DCA7] bg-[#FFF8E6]",
      icon: "bg-[#FCE8B5] text-[#B57A08]",
      value: "text-[#B57A08]",
    },

    neutral: {
      box: "border-[#E2E3DD] bg-white",
      icon: "bg-[#F1F2EC] text-[#58645E]",
      value: "text-[#243A30]",
    },
  }[tone];

  return (
    <div
      className={clsx(
        "rounded-[22px] border p-5 transition hover:-translate-y-0.5 hover:shadow-sm",
        style.box
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8A908C]">
            {label}
          </p>

          <p
            className={clsx(
              "mt-2 text-3xl font-black tracking-[-0.04em]",
              style.value
            )}
          >
            {value}
          </p>

          {hint && (
            <p className="mt-1 text-xs text-[#8A908C]">
              {hint}
            </p>
          )}
        </div>

        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            style.icon
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}


function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-[24px] border border-[#E5E5DF] bg-white p-5">
      <div className="flex gap-4">
        <div className="h-11 w-11 rounded-2xl bg-[#EEF0EA]" />

        <div className="flex-1 space-y-3">
          <div className="h-3 w-32 rounded bg-[#ECEDE8]" />

          <div className="h-4 w-2/3 rounded bg-[#E3E5DF]" />

          <div className="h-3 w-1/2 rounded bg-[#EFF0EB]" />
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   TOAST
========================================================= */

type ToastTone = "ok" | "warn" | "danger";

type ToastItem = {
  id: string;
  message: string;
  tone?: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
};


function Toasts({
  items,
  onClose,
}: {
  items: ToastItem[];
  onClose: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const toneMap: Record<ToastTone, string> = {
    ok:
      "border-[#B9DCC8] bg-white",

    warn:
      "border-[#EBCF82] bg-white",

    danger:
      "border-[#F0B8AE] bg-white",
  };

  const dotMap: Record<ToastTone, string> = {
    ok: "bg-[#176B49]",
    warn: "bg-[#D89A18]",
    danger: "bg-[#C85948]",
  };

  return (
    <div className="fixed right-4 top-4 z-[80] flex w-[min(92vw,390px)] flex-col gap-3">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "rounded-[20px] border bg-white px-4 py-4 shadow-[0_16px_50px_rgba(35,55,46,0.16)]",
            toneMap[toast.tone || "ok"]
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={clsx(
                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                dotMap[toast.tone || "ok"]
              )}
            />

            <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-[#35473E]">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => onClose(toast.id)}
              className="text-sm font-bold text-[#A0A49F] transition hover:text-[#48564F]"
            >
              ✕
            </button>
          </div>

          {toast.actionLabel && toast.onAction && (
            <div className="mt-3 pl-5">
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  onClose(toast.id);
                }}
                className="rounded-xl bg-[#E8F4ED] px-3 py-1.5 text-xs font-black text-[#176B49] transition hover:bg-[#DCEDE4]"
              >
                {toast.actionLabel}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


type PendingResolve = {
  timeoutId: number;
  toastId: string;
};


/* =========================================================
   DASHBOARD
========================================================= */

export default function AdminDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [tab, setTab] =
    useState<"feedback" | "audit">("feedback");


  /* ---------------- FEEDBACK ---------------- */

  const [rows, setRows] =
    useState<FeedbackRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    isRefreshingFeedback,
    setIsRefreshingFeedback,
  ] = useState(false);

  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  const [status, setStatus] =
    useState<"" | "open" | "resolved">(
      "open"
    );

  const [category, setCategory] =
    useState("");


  /* ---------------- AUDIT ---------------- */

  const [auditRows, setAuditRows] =
    useState<AuditRow[]>([]);

  const [auditLoading, setAuditLoading] =
    useState(false);

  const [
    isRefreshingAudit,
    setIsRefreshingAudit,
  ] = useState(false);

  const [auditErr, setAuditErr] =
    useState("");

  const [aq, setAq] = useState("");
  const [aCategory, setACategory] =
    useState("");

  const [aTitle, setATitle] =
    useState("");

  const [aDetails, setADetails] =
    useState("");

  const [
    aCreateCategory,
    setACreateCategory,
  ] = useState("other");

  const [aFiles, setAFiles] =
    useState<File[]>([]);

  const [aCreating, setACreating] =
    useState(false);


  /* ---------------- COMMON ---------------- */

  const [isExporting, setIsExporting] =
    useState(false);

  const [imgModal, setImgModal] =
    useState<{
      open: boolean;
      src: string;
    } | null>(null);

  const [toasts, setToasts] =
    useState<ToastItem[]>([]);

  const [
    pendingResolveIds,
    setPendingResolveIds,
  ] = useState<Record<string, true>>({});


  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const feedbackFirstLoadRef =
    useRef(false);

  const auditFirstLoadRef =
    useRef(false);

  const feedbackReqIdRef =
    useRef(0);

  const auditReqIdRef =
    useRef(0);

  const pendingResolveMapRef =
    useRef<
      Record<string, PendingResolve>
    >({});


  /* =========================================================
     STYLES
  ========================================================= */

  const inputBase =
    "w-full rounded-[16px] border border-[#DDDFD8] bg-white px-4 py-3 text-sm font-medium text-[#263A31] outline-none transition placeholder:text-[#A4AAA6] focus:border-[#176B49] focus:ring-4 focus:ring-[#176B49]/8";

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

  const btnGhost =
    "border-[#DDE0D9] bg-white text-[#536159] hover:border-[#CBD1CA] hover:bg-[#F7F8F4]";

  const btnPrimary =
    "border-[#176B49] bg-[#176B49] text-white shadow-[0_7px_18px_rgba(23,107,73,0.17)] hover:border-[#125B3D] hover:bg-[#125B3D]";

  const btnOrange =
    "border-[#D89A18] bg-[#D89A18] text-white shadow-[0_7px_18px_rgba(216,154,24,0.16)] hover:border-[#C5890E] hover:bg-[#C5890E]";


  /* =========================================================
     COUNTS
  ========================================================= */

  const openCount = useMemo(
    () =>
      rows.filter((row) => !row.resolved)
        .length,
    [rows]
  );

  const resolvedCount = useMemo(
    () =>
      rows.filter((row) => row.resolved)
        .length,
    [rows]
  );


  /* =========================================================
     AUDIT IMAGE PREVIEWS
  ========================================================= */

  const auditPreviews = useMemo(
    () =>
      aFiles.map((file) => ({
        key: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [aFiles]
  );

  useEffect(() => {
    return () => {
      auditPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );
    };
  }, [auditPreviews]);


  /* =========================================================
     TOAST HELPERS
  ========================================================= */

  const addToast = useCallback(
    ({
      message,
      tone = "ok",
      actionLabel,
      onAction,
      duration = 3500,
    }: {
      message: string;
      tone?: ToastTone;
      actionLabel?: string;
      onAction?: () => void;
      duration?: number;
    }) => {
      const id =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          tone,
          actionLabel,
          onAction,
        },
      ]);

      if (duration > 0) {
        window.setTimeout(() => {
          setToasts((prev) =>
            prev.filter(
              (toast) => toast.id !== id
            )
          );
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );


  /* =========================================================
     FETCH FEEDBACK
  ========================================================= */

  const fetchRows = useCallback(
    async ({
      search = q,
      currentStatus = status,
      currentCategory = category,
      initial = false,
      background = false,
    }: {
      search?: string;
      currentStatus?:
        | ""
        | "open"
        | "resolved";
      currentCategory?: string;
      initial?: boolean;
      background?: boolean;
    } = {}) => {
      const reqId =
        ++feedbackReqIdRef.current;

      try {
        setErr("");

        if (initial) {
          setLoading(true);
        } else if (background) {
          setIsRefreshingFeedback(true);
        } else {
          setLoading(true);
        }

        const res = await listFeedback({
          q:
            search.trim() ||
            undefined,

          status:
            currentStatus ||
            undefined,

          category:
            currentCategory ||
            undefined,

          limit: 300,
        });

        if (
          reqId !==
          feedbackReqIdRef.current
        ) {
          return;
        }

        setRows(res);
      } catch {
        if (
          reqId !==
          feedbackReqIdRef.current
        ) {
          return;
        }

        setErr(
          "Failed to load feedback. Your session may have expired or the server may be unavailable."
        );
      } finally {
        if (
          reqId !==
          feedbackReqIdRef.current
        ) {
          return;
        }

        setLoading(false);
        setIsRefreshingFeedback(false);
      }
    },
    [q, status, category]
  );


  /* =========================================================
     FETCH AUDIT
  ========================================================= */

  const fetchAudit = useCallback(
    async ({
      search = aq,
      currentCategory = aCategory,
      initial = false,
      background = false,
    }: {
      search?: string;
      currentCategory?: string;
      initial?: boolean;
      background?: boolean;
    } = {}) => {
      const reqId =
        ++auditReqIdRef.current;

      try {
        setAuditErr("");

        if (initial) {
          setAuditLoading(true);
        } else if (background) {
          setIsRefreshingAudit(true);
        } else {
          setAuditLoading(true);
        }

        const res = await listAudit({
          q:
            search.trim() ||
            undefined,

          category:
            currentCategory ||
            undefined,

          limit: 300,
        });

        if (
          reqId !==
          auditReqIdRef.current
        ) {
          return;
        }

        setAuditRows(res);
      } catch {
        if (
          reqId !==
          auditReqIdRef.current
        ) {
          return;
        }

        setAuditErr(
          "Failed to load the audit trail. Your session may have expired or the server may be unavailable."
        );
      } finally {
        if (
          reqId !==
          auditReqIdRef.current
        ) {
          return;
        }

        setAuditLoading(false);
        setIsRefreshingAudit(false);
      }
    },
    [aq, aCategory]
  );


  /* =========================================================
     FILTER HELPERS
  ========================================================= */

  const clearFeedbackFilters = () => {
    setQ("");
    setStatus("open");
    setCategory("");
  };

  const clearAuditFilters = () => {
    setAq("");
    setACategory("");
  };


  /* =========================================================
     AUDIT FILES
  ========================================================= */

  const onPickAuditFiles = (
    files: FileList | null
  ) => {
    if (!files) return;

    const arr = Array.from(files).filter(
      (file) =>
        file.type.startsWith("image/")
    );

    const next = [
      ...aFiles,
      ...arr,
    ].slice(0, 3);

    setAFiles(next);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const removeAuditFile = (
    name: string
  ) => {
    setAFiles((prev) =>
      prev.filter(
        (file) => file.name !== name
      )
    );
  };


  /* =========================================================
     CREATE AUDIT
  ========================================================= */

  const createAudit = async () => {
    const title = aTitle.trim();

    if (title.length < 2) {
      addToast({
        message: "Title is too short.",
        tone: "warn",
      });

      return;
    }

    try {
      setACreating(true);

      const fd = new FormData();

      fd.append("title", title);

      fd.append(
        "category",
        aCreateCategory
      );

      if (aDetails.trim()) {
        fd.append(
          "details",
          aDetails.trim()
        );
      }

      aFiles.forEach((file) =>
        fd.append("images", file)
      );

      await createAuditMultipart(fd);

      setATitle("");
      setADetails("");
      setACreateCategory("other");
      setAFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      addToast({
        message:
          "Audit entry created successfully.",
        tone: "ok",
      });

      if (tab === "audit") {
        await fetchAudit({
          background: true,
        });
      }
    } catch {
      addToast({
        message:
          "Could not create the audit entry. Check the server or your login session.",
        tone: "danger",
      });
    } finally {
      setACreating(false);
    }
  };


  /* =========================================================
     RESOLVE / UNDO
  ========================================================= */

  const undoResolve = useCallback(
    (id: string) => {
      const pending =
        pendingResolveMapRef.current[id];

      if (!pending) return;

      window.clearTimeout(
        pending.timeoutId
      );

      delete pendingResolveMapRef.current[
        id
      ];

      setPendingResolveIds((prev) => {
        const next = { ...prev };

        delete next[id];

        return next;
      });

      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                resolved: false,
              }
            : row
        )
      );
    },
    []
  );


  const commitResolve = useCallback(
    async (id: string) => {
      try {
        await resolveFeedback(id);

        setPendingResolveIds(
          (prev) => {
            const next = {
              ...prev,
            };

            delete next[id];

            return next;
          }
        );

        delete pendingResolveMapRef.current[
          id
        ];

        addToast({
          message:
            "Feedback marked as resolved.",
          tone: "ok",
        });

        await fetchRows({
          background: true,
        });
      } catch {
        setRows((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  resolved: false,
                }
              : row
          )
        );

        setPendingResolveIds(
          (prev) => {
            const next = {
              ...prev,
            };

            delete next[id];

            return next;
          }
        );

        delete pendingResolveMapRef.current[
          id
        ];

        addToast({
          message:
            "Resolve failed. Changes were reverted.",
          tone: "danger",
          duration: 4500,
        });
      }
    },
    [addToast, fetchRows]
  );


  const markResolved = useCallback(
    (id: string) => {
      if (
        pendingResolveMapRef.current[id]
      ) {
        return;
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                resolved: true,
              }
            : row
        )
      );

      setPendingResolveIds(
        (prev) => ({
          ...prev,
          [id]: true,
        })
      );

      const toastId = addToast({
        message: `Marked as resolved. Undo available for ${
          RESOLVE_UNDO_MS / 1000
        }s.`,
        tone: "ok",
        actionLabel: "Undo",
        onAction: () =>
          undoResolve(id),
        duration: RESOLVE_UNDO_MS,
      });

      const timeoutId =
        window.setTimeout(() => {
          commitResolve(id);
          removeToast(toastId);
        }, RESOLVE_UNDO_MS);

      pendingResolveMapRef.current[
        id
      ] = {
        timeoutId,
        toastId,
      };
    },
    [
      addToast,
      commitResolve,
      removeToast,
      undoResolve,
    ]
  );


  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const exportCsv = async () => {
    const token = getToken();

    if (!token) {
      addToast({
        message:
          "Missing login token. Please log in again.",
        tone: "warn",
      });

      return;
    }

    try {
      setIsExporting(true);

      const API =
        process.env
          .NEXT_PUBLIC_API_BASE!;

      const res = await fetch(
        `${API}/admin/export.csv`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        addToast({
          message: "Export failed.",
          tone: "danger",
        });

        return;
      }

      const text = await res.text();

      const blob = new Blob(
        [text],
        {
          type: "text/csv",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        `signsight_feedback_${
          new Date()
            .toISOString()
            .slice(0, 10)
        }.csv`;

      a.click();

      URL.revokeObjectURL(url);

      addToast({
        message:
          "CSV exported successfully.",
        tone: "ok",
      });
    } catch {
      addToast({
        message: "Export failed.",
        tone: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };


  /* =========================================================
     INITIAL LOAD + LIVE SEARCH
  ========================================================= */

  useEffect(() => {
    if (
      tab === "feedback" &&
      !feedbackFirstLoadRef.current
    ) {
      feedbackFirstLoadRef.current =
        true;

      fetchRows({
        initial: true,
      });
    }

    if (
      tab === "audit" &&
      !auditFirstLoadRef.current
    ) {
      auditFirstLoadRef.current =
        true;

      fetchAudit({
        initial: true,
      });
    }
  }, [tab, fetchRows, fetchAudit]);


  useEffect(() => {
    if (
      tab !== "feedback" ||
      !feedbackFirstLoadRef.current
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        fetchRows({
          background: true,
        });
      }, 400);

    return () =>
      window.clearTimeout(timer);
  }, [
    q,
    status,
    category,
    tab,
    fetchRows,
  ]);


  useEffect(() => {
    if (
      tab !== "audit" ||
      !auditFirstLoadRef.current
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        fetchAudit({
          background: true,
        });
      }, 400);

    return () =>
      window.clearTimeout(timer);
  }, [
    aq,
    aCategory,
    tab,
    fetchAudit,
  ]);


  /* =========================================================
     IMAGE MODAL
  ========================================================= */

  useEffect(() => {
    if (!imgModal?.open) return;

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setImgModal(null);
      }
    };

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [imgModal]);


  useEffect(() => {
    return () => {
      Object.values(
        pendingResolveMapRef.current
      ).forEach((item) => {
        window.clearTimeout(
          item.timeoutId
        );
      });
    };
  }, []);


  const ImgModal = () => {
    if (!imgModal?.open) return null;

    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-[#102A20]/80 p-5 backdrop-blur-sm"
        onClick={() =>
          setImgModal(null)
        }
      >
        <div
          className="w-full max-w-5xl overflow-hidden rounded-[28px] bg-white p-3 shadow-2xl"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <img
            src={imgModal.src}
            alt="attachment"
            className="max-h-[78vh] w-full rounded-[20px] object-contain"
          />

          <div className="flex justify-end p-2 pt-4">
            <button
              onClick={() =>
                setImgModal(null)
              }
              className={clsx(
                btnBase,
                btnGhost
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };


  const feedbackHasFilters =
    !!q.trim() ||
    !!category ||
    status !== "open";

  const auditHasFilters =
    !!aq.trim() || !!aCategory;


  /* =========================================================
     ICONS
  ========================================================= */

  const feedbackIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3h6m-8.25 9l2.25-3h9.75A3.75 3.75 0 0021 13.5v-6a3.75 3.75 0 00-3.75-3.75H6.75A3.75 3.75 0 003 7.5v6a3.75 3.75 0 002.25 3.43V20.25z"
      />
    </svg>
  );

  const auditIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5.25h6m-6 4.5h6m-6 4.5h4.5M6.75 3h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25A2.25 2.25 0 016.75 3z"
      />
    </svg>
  );


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F5F4EE] text-[#26382F]">
      <Toasts
        items={toasts}
        onClose={removeToast}
      />

      <ImgModal />


      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#176B49] lg:flex">
        <div className="relative flex h-full flex-col overflow-hidden px-5 py-6">

          {/* decoration */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-60 w-60 rounded-full border-[45px] border-white/[0.035]" />

          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#D89A18]/10 blur-2xl" />


          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#FFF9E9] shadow-md">
              <span className="font-black text-[#176B49]">
                SS
              </span>
            </div>

            <div className="leading-none">
              <p className="text-lg font-black tracking-tight text-white">
                SIGN
              </p>

              <p className="mt-1 text-lg font-black tracking-tight text-[#F0B63C]">
                SIGHT
              </p>
            </div>
          </div>


          {/* navigation */}
          <div className="relative z-10 mt-12">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
              Workspace
            </p>

            <nav className="mt-3 space-y-2">
              <button
                onClick={() =>
                  setTab("feedback")
                }
                className={clsx(
                  "flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-extrabold transition",
                  tab === "feedback"
                    ? "bg-white text-[#176B49] shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                )}
              >
                <span
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-xl",
                    tab === "feedback"
                      ? "bg-[#EAF5EE]"
                      : "bg-white/10"
                  )}
                >
                  {feedbackIcon}
                </span>

                Feedback
              </button>

              <button
                onClick={() =>
                  setTab("audit")
                }
                className={clsx(
                  "flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-extrabold transition",
                  tab === "audit"
                    ? "bg-white text-[#176B49] shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                )}
              >
                <span
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-xl",
                    tab === "audit"
                      ? "bg-[#FFF3D3] text-[#B27808]"
                      : "bg-white/10"
                  )}
                >
                  {auditIcon}
                </span>

                Audit Trail
              </button>
            </nav>
          </div>


          {/* bottom */}
          <div className="relative z-10 mt-auto">
            <div className="mb-4 rounded-[18px] border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D89A18]/20 text-sm font-black text-[#FFD879]">
                  A
                </div>

                <div>
                  <p className="text-xs font-extrabold text-white">
                    Administrator
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/40">
                    Secure session
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-[15px] px-4 py-3 text-sm font-extrabold text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h10.5m0 0l-3-3m3 3l-3 3"
                />
              </svg>

              Log out
            </button>
          </div>
        </div>
      </aside>


      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <div className="sticky top-0 z-30 border-b border-[#DFE1DA] bg-[#176B49] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF8E4] text-xs font-black text-[#176B49]">
              SS
            </div>

            <div>
              <p className="text-xs font-black text-white">
                SIGN
                <span className="ml-1 text-[#F0B63C]">
                  SIGHT
                </span>
              </p>

              <p className="text-[10px] text-white/45">
                Admin
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              setTab("feedback")
            }
            className={clsx(
              "rounded-xl py-2 text-xs font-extrabold",
              tab === "feedback"
                ? "bg-white text-[#176B49]"
                : "bg-white/10 text-white/70"
            )}
          >
            Feedback
          </button>

          <button
            onClick={() =>
              setTab("audit")
            }
            className={clsx(
              "rounded-xl py-2 text-xs font-extrabold",
              tab === "audit"
                ? "bg-white text-[#176B49]"
                : "bg-white/10 text-white/70"
            )}
          >
            Audit Trail
          </button>
        </div>
      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="min-h-screen lg:ml-[260px]">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">


          {/* =================================================
              FEEDBACK
          ================================================== */}

          {tab === "feedback" && (
            <div>
              {/* header */}
              <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#B57A08]">
                    <span className="h-2 w-2 rounded-full bg-[#D89A18]" />

                    Feedback management
                  </div>

                  <h1 className="text-3xl font-black tracking-[-0.045em] text-[#20392E] sm:text-4xl">
                    Feedback Inbox
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7D8580]">
                    Review feedback from SignSight users, track issues,
                    and resolve submitted concerns.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportCsv}
                    disabled={
                      isExporting ||
                      loading ||
                      isRefreshingFeedback
                    }
                    className={clsx(
                      btnBase,
                      btnGhost
                    )}
                  >
                    {isExporting
                      ? "Exporting..."
                      : "Export CSV"}
                  </button>

                  <button
                    onClick={() =>
                      fetchRows({
                        background: true,
                      })
                    }
                    disabled={
                      loading ||
                      isRefreshingFeedback
                    }
                    className={clsx(
                      btnBase,
                      btnPrimary
                    )}
                  >
                    {(loading ||
                      isRefreshingFeedback) && (
                      <InlineSpinner />
                    )}

                    {loading ||
                    isRefreshingFeedback
                      ? "Refreshing"
                      : "Refresh"}
                  </button>
                </div>
              </div>


              {/* statistics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Open"
                  value={openCount}
                  hint="Needs attention"
                  tone="orange"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8.25v4.5m0 3h.008v.008H12v-.008zM10.03 3.659L2.33 17.01A2.25 2.25 0 004.278 20.4h15.444a2.25 2.25 0 001.948-3.39L13.97 3.66a2.25 2.25 0 00-3.94 0z"
                      />
                    </svg>
                  }
                />

                <StatCard
                  label="Resolved"
                  value={resolvedCount}
                  hint="Completed items"
                  tone="green"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75l2.25 2.25L15 9.75m6-3.75c-4.5 0-7.5-1.5-9-3-1.5 1.5-4.5 3-9 3 0 7.5 3 12 9 15 6-3 9-7.5 9-15z"
                      />
                    </svg>
                  }
                />

                <StatCard
                  label="Showing"
                  value={rows.length}
                  hint="Current results"
                  tone="neutral"
                  icon={feedbackIcon}
                />
              </div>


              {/* filter toolbar */}
              <div className="mt-6 rounded-[22px] border border-[#E1E3DC] bg-white p-3 shadow-[0_6px_26px_rgba(33,56,45,0.04)]">
                <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_190px_auto]">

                  <div className="relative">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#949B96]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                      />
                    </svg>

                    <input
                      value={q}
                      onChange={(e) =>
                        setQ(e.target.value)
                      }
                      placeholder="Search feedback..."
                      className={clsx(
                        inputBase,
                        "pl-11"
                      )}
                    />

                    {(loading ||
                      isRefreshingFeedback) && (
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <InlineSpinner />
                      </div>
                    )}
                  </div>


                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | ""
                          | "open"
                          | "resolved"
                      )
                    }
                    className={inputBase}
                  >
                    <option value="open">
                      Open
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                    <option value="">
                      All statuses
                    </option>
                  </select>


                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className={inputBase}
                  >
                    <option value="">
                      All categories
                    </option>

                    {FEEDBACK_CATEGORIES.map(
                      (cat) => (
                        <option
                          key={cat}
                          value={cat}
                        >
                          {cat}
                        </option>
                      )
                    )}
                  </select>


                  <button
                    onClick={
                      clearFeedbackFilters
                    }
                    className={clsx(
                      btnBase,
                      btnGhost
                    )}
                  >
                    Clear
                  </button>
                </div>


                {feedbackHasFilters && (
                  <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
                    {!!q.trim() && (
                      <button
                        onClick={() =>
                          setQ("")
                        }
                        className="rounded-full border border-[#CFE2D6] bg-[#EFF8F3] px-3 py-1.5 text-xs font-extrabold text-[#176B49]"
                      >
                        Search: {q.trim()} ×
                      </button>
                    )}

                    {status !== "open" && (
                      <button
                        onClick={() =>
                          setStatus("open")
                        }
                        className="rounded-full border border-[#E2E3DD] bg-[#F7F8F4] px-3 py-1.5 text-xs font-extrabold text-[#616B65]"
                      >
                        Status:{" "}
                        {status || "all"} ×
                      </button>
                    )}

                    {!!category && (
                      <button
                        onClick={() =>
                          setCategory("")
                        }
                        className="rounded-full border border-[#F0DCA7] bg-[#FFF8E6] px-3 py-1.5 text-xs font-extrabold text-[#A97409]"
                      >
                        Category:{" "}
                        {category} ×
                      </button>
                    )}
                  </div>
                )}
              </div>


              {/* error */}
              {!!err && (
                <div className="mt-4 flex items-center justify-between gap-4 rounded-[18px] border border-[#EDB7AE] bg-[#FFF0ED] px-4 py-3 text-sm text-[#A84A3D]">
                  <span>{err}</span>

                  <button
                    onClick={() =>
                      fetchRows({
                        background: true,
                      })
                    }
                    className="shrink-0 font-black underline"
                  >
                    Retry
                  </button>
                </div>
              )}


              {/* inbox */}
              <div className="mt-7">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-[#263B31]">
                      Inbox
                    </h2>

                    <p className="mt-1 text-xs text-[#8A918D]">
                      {status === "open"
                        ? "Showing open feedback."
                        : status ===
                            "resolved"
                          ? "Showing resolved feedback."
                          : "Showing all feedback."}
                    </p>
                  </div>

                  <Pill>
                    {rows.length} results
                  </Pill>
                </div>


                {loading ? (
                  <div className="space-y-3">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                ) : rows.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-[#D6DAD4] bg-white/65 px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#EDF4F0] text-[#176B49]">
                      {feedbackIcon}
                    </div>

                    <h3 className="mt-4 font-black text-[#263B31]">
                      No feedback found
                    </h3>

                    <p className="mt-1 text-sm text-[#8A918D]">
                      {feedbackHasFilters
                        ? "Try changing or clearing your filters."
                        : "There are no feedback entries yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rows.map((row) => {
                      const cat = (
                        row.category ||
                        "general"
                      ).toLowerCase();

                      const catTone =
                        cat === "bug"
                          ? "danger"
                          : cat ===
                              "performance"
                            ? "warn"
                            : cat === "ui" ||
                                cat ===
                                  "feature"
                              ? "ok"
                              : "neutral";

                      const isPending =
                        !!pendingResolveIds[
                          row.id
                        ];

                      return (
                        <article
                          key={row.id}
                          className={clsx(
                            "group overflow-hidden rounded-[24px] border bg-white transition hover:border-[#CAD7D0] hover:shadow-[0_12px_32px_rgba(35,55,46,0.07)]",
                            row.resolved
                              ? "border-[#DDE5E0]"
                              : "border-[#E5E1D5]"
                          )}
                        >
                          <div className="flex">
                            <div
                              className={clsx(
                                "w-1.5 shrink-0",
                                row.resolved
                                  ? "bg-[#176B49]"
                                  : "bg-[#D89A18]"
                              )}
                            />

                            <div className="min-w-0 flex-1 p-5">
                              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Pill
                                      tone={
                                        catTone
                                      }
                                    >
                                      {cat}
                                    </Pill>

                                    {row.resolved ? (
                                      <Pill tone="ok">
                                        {isPending
                                          ? "Resolving..."
                                          : "Resolved"}
                                      </Pill>
                                    ) : (
                                      <Pill tone="warn">
                                        Open
                                      </Pill>
                                    )}

                                    {isPending && (
                                      <Pill tone="warn">
                                        Undo available
                                      </Pill>
                                    )}
                                  </div>


                                  <div className="mt-4 text-[15px] font-bold leading-6 text-[#26382F]">
                                    <ExpandableText
                                      text={
                                        row.message
                                      }
                                      previewChars={
                                        220
                                      }
                                    />
                                  </div>


                                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#8A918D]">
                                    <span>
                                      {new Date(
                                        row.created_at
                                      ).toLocaleString()}
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-[#CDD0CB]" />

                                    <span>
                                      {row.platform ||
                                        "Unknown platform"}
                                    </span>

                                    <span>
                                      {row.app_version
                                        ? `v${row.app_version}`
                                        : "No version"}
                                    </span>

                                    <span>
                                      {row.device ||
                                        "Unknown device"}
                                    </span>
                                  </div>


                                  <div className="mt-4 flex items-center gap-2 text-xs">
                                    <span className="font-semibold text-[#838B86]">
                                      Rating
                                    </span>

                                    <span className="font-black text-[#B57A08]">
                                      {row.rating ??
                                        "—"}
                                      /5
                                    </span>
                                  </div>


                                  {(row
                                    .image_urls
                                    ?.length ??
                                    0) >
                                    0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {row.image_urls!.map(
                                        (url) => {
                                          const src =
                                            absoluteUrl(
                                              url
                                            );

                                          return (
                                            <button
                                              key={
                                                url
                                              }
                                              type="button"
                                              onClick={() =>
                                                setImgModal(
                                                  {
                                                    open: true,
                                                    src,
                                                  }
                                                )
                                              }
                                              className="overflow-hidden rounded-[14px] border border-[#DDE0DA] bg-[#F7F7F3]"
                                            >
                                              <img
                                                src={
                                                  src
                                                }
                                                alt="Feedback attachment"
                                                className="h-20 w-20 object-cover transition duration-200 hover:scale-105"
                                              />
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>


                                <div className="shrink-0">
                                  {row.resolved ? (
                                    isPending ? (
                                      <button
                                        onClick={() =>
                                          undoResolve(
                                            row.id
                                          )
                                        }
                                        className={clsx(
                                          btnBase,
                                          btnGhost
                                        )}
                                      >
                                        Undo
                                      </button>
                                    ) : (
                                      <div className="inline-flex items-center gap-2 rounded-[14px] bg-[#EFF7F2] px-4 py-2.5 text-xs font-extrabold text-[#176B49]">
                                        ✓ Resolved
                                      </div>
                                    )
                                  ) : (
                                    <button
                                      onClick={() =>
                                        markResolved(
                                          row.id
                                        )
                                      }
                                      disabled={
                                        !!pendingResolveIds[
                                          row.id
                                        ]
                                      }
                                      className={clsx(
                                        btnBase,
                                        btnPrimary
                                      )}
                                    >
                                      Resolve
                                      <span>
                                        →
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* =================================================
              AUDIT TRAIL
          ================================================== */}

          {tab === "audit" && (
            <div>
              {/* header */}
              <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#B57A08]">
                    <span className="h-2 w-2 rounded-full bg-[#D89A18]" />

                    Administration record
                  </div>

                  <h1 className="text-3xl font-black tracking-[-0.045em] text-[#20392E] sm:text-4xl">
                    Audit Trail
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7D8580]">
                    Document changes, fixes,
                    administrative actions, and
                    important SignSight updates.
                  </p>
                </div>

                <button
                  onClick={() =>
                    fetchAudit({
                      background: true,
                    })
                  }
                  disabled={
                    auditLoading ||
                    isRefreshingAudit
                  }
                  className={clsx(
                    btnBase,
                    btnPrimary
                  )}
                >
                  {(auditLoading ||
                    isRefreshingAudit) && (
                    <InlineSpinner />
                  )}

                  {auditLoading ||
                  isRefreshingAudit
                    ? "Refreshing"
                    : "Refresh"}
                </button>
              </div>


              <div className="grid items-start gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">


                {/* CREATE PANEL */}
                <aside className="rounded-[26px] border border-[#DDE1DA] bg-white p-5 shadow-[0_8px_30px_rgba(34,54,45,0.045)] xl:sticky xl:top-6">

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#FFF3D3] text-[#B27808]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="font-black text-[#273B31]">
                        New audit entry
                      </h2>

                      <p className="mt-0.5 text-xs text-[#8B928E]">
                        Record an admin action
                      </p>
                    </div>
                  </div>


                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-extrabold text-[#536159]">
                        Title
                      </label>

                      <input
                        value={aTitle}
                        onChange={(e) =>
                          setATitle(
                            e.target.value
                          )
                        }
                        placeholder="e.g. Fixed camera lag"
                        className={
                          inputBase
                        }
                      />
                    </div>


                    <div>
                      <label className="mb-2 block text-xs font-extrabold text-[#536159]">
                        Category
                      </label>

                      <select
                        value={
                          aCreateCategory
                        }
                        onChange={(e) =>
                          setACreateCategory(
                            e.target.value
                          )
                        }
                        className={
                          inputBase
                        }
                      >
                        {AUDIT_CATEGORIES.map(
                          (cat) => (
                            <option
                              key={cat}
                              value={cat}
                            >
                              {cat}
                            </option>
                          )
                        )}
                      </select>
                    </div>


                    <div>
                      <label className="mb-2 block text-xs font-extrabold text-[#536159]">
                        Details
                      </label>

                      <textarea
                        value={aDetails}
                        onChange={(e) =>
                          setADetails(
                            e.target.value
                          )
                        }
                        placeholder="Describe what was changed..."
                        className={clsx(
                          inputBase,
                          "min-h-[130px] resize-y"
                        )}
                      />
                    </div>


                    <div>
                      <label className="mb-2 block text-xs font-extrabold text-[#536159]">
                        Attachments
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          onPickAuditFiles(
                            e.target.files
                          )
                        }
                        className="hidden"
                        id="auditFiles"
                      />

                      <label
                        htmlFor="auditFiles"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#C9CFC9] bg-[#F8F9F5] px-4 py-4 text-xs font-extrabold text-[#637069] transition hover:border-[#176B49] hover:bg-[#F0F7F3] hover:text-[#176B49]"
                      >
                        <span className="text-lg">
                          +
                        </span>

                        Add images

                        <span className="font-medium text-[#9AA09C]">
                          ({aFiles.length}/3)
                        </span>
                      </label>
                    </div>


                    {auditPreviews.length >
                      0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {auditPreviews.map(
                          (preview) => (
                            <div
                              key={
                                preview.key
                              }
                              className="group relative aspect-square overflow-hidden rounded-[14px] border border-[#DDE0DA]"
                            >
                              <img
                                src={
                                  preview.url
                                }
                                alt={
                                  preview.name
                                }
                                className="h-full w-full cursor-pointer object-cover"
                                onClick={() =>
                                  setImgModal(
                                    {
                                      open: true,
                                      src: preview.url,
                                    }
                                  )
                                }
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeAuditFile(
                                    preview.name
                                  )
                                }
                                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[10px] font-black text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}


                    <button
                      onClick={createAudit}
                      disabled={aCreating}
                      className={clsx(
                        btnBase,
                        btnOrange,
                        "w-full py-3"
                      )}
                    >
                      {aCreating ? (
                        <>
                          <InlineSpinner />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create audit entry
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                </aside>


                {/* TIMELINE */}
                <section>
                  {/* filters */}
                  <div className="rounded-[22px] border border-[#E1E3DC] bg-white p-3">
                    <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">

                      <div className="relative">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#949B96]"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 21-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                          />
                        </svg>

                        <input
                          value={aq}
                          onChange={(e) =>
                            setAq(
                              e.target.value
                            )
                          }
                          placeholder="Search audit trail..."
                          className={clsx(
                            inputBase,
                            "pl-11"
                          )}
                        />

                        {(auditLoading ||
                          isRefreshingAudit) && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <InlineSpinner />
                          </div>
                        )}
                      </div>


                      <select
                        value={aCategory}
                        onChange={(e) =>
                          setACategory(
                            e.target.value
                          )
                        }
                        className={
                          inputBase
                        }
                      >
                        <option value="">
                          All categories
                        </option>

                        {AUDIT_CATEGORIES.map(
                          (cat) => (
                            <option
                              key={cat}
                              value={cat}
                            >
                              {cat}
                            </option>
                          )
                        )}
                      </select>


                      <button
                        onClick={
                          clearAuditFilters
                        }
                        className={clsx(
                          btnBase,
                          btnGhost
                        )}
                      >
                        Clear
                      </button>
                    </div>


                    {auditHasFilters && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!!aq.trim() && (
                          <button
                            onClick={() =>
                              setAq("")
                            }
                            className="rounded-full border border-[#CCE0D4] bg-[#EFF8F3] px-3 py-1.5 text-xs font-extrabold text-[#176B49]"
                          >
                            Search:{" "}
                            {aq.trim()} ×
                          </button>
                        )}

                        {!!aCategory && (
                          <button
                            onClick={() =>
                              setACategory(
                                ""
                              )
                            }
                            className="rounded-full border border-[#F0DCA7] bg-[#FFF8E6] px-3 py-1.5 text-xs font-extrabold text-[#A97409]"
                          >
                            Category:{" "}
                            {aCategory} ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>


                  {!!auditErr && (
                    <div className="mt-4 flex items-center justify-between rounded-[18px] border border-[#EDB7AE] bg-[#FFF0ED] px-4 py-3 text-sm text-[#A84A3D]">
                      <span>
                        {auditErr}
                      </span>

                      <button
                        onClick={() =>
                          fetchAudit({
                            background:
                              true,
                          })
                        }
                        className="font-black underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}


                  <div className="mb-5 mt-7 flex items-end justify-between">
                    <div>
                      <h2 className="text-lg font-black text-[#273B31]">
                        Activity
                      </h2>

                      <p className="mt-1 text-xs text-[#8A918D]">
                        Newest activity first
                      </p>
                    </div>

                    <Pill>
                      {auditRows.length} entries
                    </Pill>
                  </div>


                  {auditLoading ? (
                    <div className="space-y-3">
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </div>
                  ) : auditRows.length ===
                    0 ? (
                    <div className="rounded-[26px] border border-dashed border-[#D6DAD4] bg-white/65 px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFF3D3] text-[#B27808]">
                        {auditIcon}
                      </div>

                      <h3 className="mt-4 font-black text-[#263B31]">
                        No audit entries
                      </h3>

                      <p className="mt-1 text-sm text-[#8A918D]">
                        {auditHasFilters
                          ? "Try clearing or changing your filters."
                          : "Create an audit entry to begin tracking changes."}
                      </p>
                    </div>
                  ) : (
                    <div className="relative">

                      {/* timeline line */}
                      <div className="absolute bottom-8 left-[17px] top-7 hidden w-px bg-[#D8DED9] sm:block" />


                      <div className="space-y-4">
                        {auditRows.map(
                          (audit) => {
                            const auditCategory =
                              (
                                audit.category ||
                                "other"
                              ).toString();

                            return (
                              <article
                                key={
                                  audit.id
                                }
                                className="relative sm:pl-12"
                              >
                                {/* timeline node */}
                                <div className="absolute left-[8px] top-6 z-10 hidden h-[19px] w-[19px] rounded-full border-[5px] border-[#F5F4EE] bg-[#D89A18] shadow-[0_0_0_1px_#D8C182] sm:block" />


                                <div className="rounded-[24px] border border-[#E0E3DC] bg-white p-5 transition hover:border-[#CFD6D1] hover:shadow-[0_12px_35px_rgba(35,55,46,0.06)]">

                                  <div className="flex flex-wrap items-center gap-2">
                                    <Pill tone="ok">
                                      {
                                        auditCategory
                                      }
                                    </Pill>

                                    <span className="text-xs text-[#929994]">
                                      {new Date(
                                        audit.created_at
                                      ).toLocaleString()}
                                    </span>
                                  </div>


                                  <div className="mt-3 text-base font-black leading-6 text-[#26382F]">
                                    <ExpandableText
                                      text={
                                        audit.title
                                      }
                                      previewChars={
                                        130
                                      }
                                    />
                                  </div>


                                  {!!audit.details && (
                                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#707A74]">
                                      <ExpandableText
                                        text={
                                          audit.details
                                        }
                                        previewChars={
                                          260
                                        }
                                      />
                                    </div>
                                  )}


                                  {(audit
                                    .image_urls
                                    ?.length ??
                                    0) >
                                    0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {audit.image_urls!.map(
                                        (url) => {
                                          const src =
                                            absoluteUrl(
                                              url
                                            );

                                          return (
                                            <button
                                              key={
                                                url
                                              }
                                              type="button"
                                              onClick={() =>
                                                setImgModal(
                                                  {
                                                    open: true,
                                                    src,
                                                  }
                                                )
                                              }
                                              className="overflow-hidden rounded-[14px] border border-[#DDE0DA]"
                                            >
                                              <img
                                                src={
                                                  src
                                                }
                                                alt="Audit attachment"
                                                className="h-20 w-20 object-cover transition hover:scale-105"
                                              />
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>
                              </article>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}


          {/* footer */}
          <footer className="mt-12 border-t border-[#DFE2DB] py-6 text-center text-[11px] font-medium text-[#989F9A]">
            SignSight Administration
          </footer>
        </div>
      </main>
    </div>
  );
}