import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function TimeTracking({ issueId }) {
  const [logs, setLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTime = async () => {
    const token = sessionStorage.getItem("token");
    if (!token || !issueId) return;

    setLoading(true);
    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [logsResponse, totalResponse] = await Promise.all([
        fetch(`${API_URL}/time/issues/${issueId}`, { headers }),
        fetch(`${API_URL}/time/issues/${issueId}/total`, { headers }),
      ]);

      if (logsResponse.status === 401 || totalResponse.status === 401) {
        alert("Your login session expired. Please login again.");
        return;
      }

      const logsData = await logsResponse.json().catch(() => []);
      const totalData = await totalResponse.json().catch(() => ({}));

      if (logsResponse.ok) {
        setLogs(Array.isArray(logsData) ? logsData : []);
      }

      if (totalResponse.ok) {
        setTotalHours(Number(totalData.total_hours || 0));
      }
    } catch (error) {
      console.error("Load time tracking error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTime();
  }, [issueId]);

  const addTime = async () => {
    const token = sessionStorage.getItem("token");
    const numericHours = Number(hours);

    if (!token) {
      alert("Your login session expired. Please login again.");
      return;
    }

    if (!numericHours || numericHours <= 0) {
      alert("Please enter valid hours greater than 0.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/time/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issue_id: Number(issueId),
          hours: numericHours,
          description: description.trim() || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        alert("Your login session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        alert(data.detail || "Failed to log time.");
        return;
      }

      setHours("");
      setDescription("");
      await loadTime();
    } catch (error) {
      console.error("Add time error:", error);
      alert("Cannot connect to the BugFlow backend.");
    } finally {
      setSaving(false);
    }
  };

  const deleteTime = async (logId) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Delete this time log?")) return;

    try {
      const response = await fetch(`${API_URL}/time/logs/${logId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to delete time log.");
        return;
      }

      await loadTime();
    } catch (error) {
      console.error("Delete time error:", error);
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  return (
    <div
      style={{
        marginTop: "18px",
        paddingTop: "18px",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <strong>⏱️ Time Tracking</strong>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: "8px",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: "700",
            fontSize: "13px",
          }}
        >
          Total: {totalHours} hour{totalHours === 1 ? "" : "s"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr auto",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          style={{
            padding: "9px 10px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
          }}
        />

        <input
          type="text"
          placeholder="What did you work on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: "9px 10px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
          }}
        />

        <button
          type="button"
          className="primary-button"
          onClick={addTime}
          disabled={saving}
        >
          {saving ? "Saving..." : "Log Time"}
        </button>
      </div>

      <div style={{ marginTop: "14px" }}>
        {loading ? (
          <p style={{ color: "#64748b", fontSize: "13px" }}>Loading time logs...</p>
        ) : logs.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "13px" }}>No time logged yet.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                padding: "9px 0",
                borderBottom: "1px solid #f1f5f9",
                fontSize: "13px",
              }}
            >
              <div>
                <strong>{log.hours} hr</strong>
                {log.description && (
                  <span style={{ marginLeft: "8px", color: "#64748b" }}>
                    {log.description}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="small-button"
                onClick={() => deleteTime(log.id)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}