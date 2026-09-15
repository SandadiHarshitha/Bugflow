import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  // =====================================================
  // LOGIN
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // SIGN UP
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );

  // =====================================================
  // PAGE NAVIGATION
  // =====================================================

  const [activePage, setActivePage] = useState("dashboard");

  // =====================================================
  // PROFILE / SETTINGS
  // =====================================================

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("Developer");

  // =====================================================
  // ROLE-BASED ACCESS CONTROL
  // =====================================================

  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(
    sessionStorage.getItem("role") || "Developer"
  );

  const normalizedRole = String(currentUserRole || "Developer")
    .trim()
    .toLowerCase();

  const isAdmin = normalizedRole === "admin";
  const isManager = normalizedRole === "manager";
  const isDeveloper = normalizedRole === "developer";
  const isTester = normalizedRole === "tester";

  // Real BugFlow permissions
  const canManageProjects = isManager || isAdmin;
  const canAssignIssues = isManager || isAdmin;
  const canDeleteIssues = isManager || isAdmin;
  const canEditIssues = isDeveloper || isManager || isAdmin;
  const canChangeIssueStatus = isDeveloper || isManager || isAdmin;
  const canManageSprints = isManager || isAdmin;

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [issues, setIssues] = useState([]);
  const [issueSearch, setIssueSearch] = useState("");
  const [issuePriorityFilter, setIssuePriorityFilter] = useState("All");
  const [issueStatusFilter, setIssueStatusFilter] = useState("All");
  const [issueSort, setIssueSort] = useState("Newest");
  const [issuePage, setIssuePage] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [issueReport, setIssueReport] = useState(null);
  const [developerWorkload, setDeveloperWorkload] = useState([]);
  const [riskRadarResult, setRiskRadarResult] = useState(null);
  const [fixImpactResult, setFixImpactResult] = useState(null);
  const [codeReviewResult, setCodeReviewResult] = useState(null);
const [predictiveSprintResult, setPredictiveSprintResult] = useState(null);
const [codeReviewPrNumber, setCodeReviewPrNumber] = useState("");
  const [historicalResult, setHistoricalResult] = useState(null);
const [evidenceResult, setEvidenceResult] = useState(null);
const [investigationResult, setInvestigationResult] = useState(null);

const [evidenceQuestion, setEvidenceQuestion] = useState("");
const [evidenceText, setEvidenceText] = useState("");
const [investigationIssueId, setInvestigationIssueId] = useState("");
    // TIME TRACKING
  const [issueTimeLogs, setIssueTimeLogs] = useState({});
  const [issueTimeTotals, setIssueTimeTotals] = useState({});
  const [timeLogLoading, setTimeLogLoading] = useState({});
  const [timeLogHours, setTimeLogHours] = useState("");
  const [timeLogDescription, setTimeLogDescription] = useState("");
  const [timeLogSaving, setTimeLogSaving] = useState(false);

  // ISSUE ACTIVITY
  const [issueActivities, setIssueActivities] = useState({});
  const [expandedActivities, setExpandedActivities] = useState({});
  const [activityLoading, setActivityLoading] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);
  // ISSUE ATTACHMENTS
  const [issueAttachments, setIssueAttachments] = useState({});
  const [expandedAttachments, setExpandedAttachments] = useState({});
  const [attachmentLoading, setAttachmentLoading] = useState({});
  const [selectedAttachmentFiles, setSelectedAttachmentFiles] = useState({});

  // ISSUE COMMENTS
  const [issueComments, setIssueComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  const [loading, setLoading] = useState(false);

  // =====================================================
  // MODALS
  // =====================================================

  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // EDIT ISSUE
  const [editIssueId, setEditIssueId] = useState(null);

  // =====================================================
  // CREATE ISSUE FORM
  // =====================================================

  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  const [enhancingDescription, setEnhancingDescription] =
    useState(false);

  const [issuePriority, setIssuePriority] = useState("Medium");
  const [issueStatus, setIssueStatus] = useState("Open");

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("");

  // DUPLICATE ISSUE DETECTION
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(true);

  // =====================================================
  // SPRINT PLANNING
  // =====================================================
  const [sprints, setSprints] = useState([]);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [sprintSaving, setSprintSaving] = useState(false);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState(null);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");
  const [sprintStatus, setSprintStatus] = useState("Planned");
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [sprintIssueIds, setSprintIssueIds] = useState([]);
  const [sprintAssignIssueId, setSprintAssignIssueId] = useState("");

  // =====================================================
  // SMART BUGFLOW FEATURES
  // =====================================================
  const [semanticSearch, setSemanticSearch] = useState("");
  const [semanticResults, setSemanticResults] = useState([]);
  const [resolutionIssueId, setResolutionIssueId] = useState("");
  const [resolutionSuggestions, setResolutionSuggestions] = useState([]);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState(
    localStorage.getItem("bugflow_github_repo") || ""
  );
  const [githubIssueNumber, setGithubIssueNumber] = useState("");
  const [integrationMessage, setIntegrationMessage] = useState("");
  const [apiStatus, setApiStatus] = useState("Not checked");


  // =====================================================
  // AI
  // =====================================================

  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);

  // AI DEFECT CLASSIFICATION
  const [aiClassification, setAiClassification] = useState(null);
  const [classifyingIssue, setClassifyingIssue] = useState(false);
  const [savingClassification, setSavingClassification] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("Logging in...");

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      sessionStorage.setItem("token", data.access_token);

      await loadCurrentUser();
      setLoggedIn(true);
      setMessage("");
    } catch (error) {
      console.error(error);

      setMessage(
        "Cannot connect to BugFlow backend. Make sure FastAPI is running."
      );
    }
  };

  // =====================================================
  // SIGN UP
  // =====================================================

  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (signupPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setMessage("Creating your account...");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: "Developer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Registration failed.";

        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((item) => item.msg)
            .join(", ");
        } else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        }

        setMessage(errorMessage);
        return;
      }

      // Registration succeeded. Return to login.
      setShowSignup(false);
      setEmail(signupEmail.trim());
      setPassword("");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");

      setMessage(
        "Account created successfully. Please login."
      );
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Cannot connect to BugFlow backend. Make sure FastAPI is running."
      );
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // =====================================================
  // HANDLE GOOGLE CALLBACK
  // =====================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const googleToken = params.get("google_token");
    const googleError = params.get("google_error");

    if (googleToken) {
      sessionStorage.setItem("token", googleToken);
      loadCurrentUser();
      setLoggedIn(true);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    } else if (googleError) {
      setMessage(
        googleError === "user_not_registered"
          ? "This Google account is not registered in BugFlow."
          : "Google sign-in failed. Please try again."
      );

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    sessionStorage.removeItem("token");

    setShowProfileMenu(false);
    setShowProfilePanel(false);
    setShowSettingsPanel(false);

    setLoggedIn(false);
    setActivePage("dashboard");

    setProjects([]);
    setIssues([]);
    setCurrentUser(null);
    setCurrentUserRole("Developer");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("role");
    setNotifications([]);
    setReadNotificationIds([]);
    setShowNotifications(false);

    setEmail("");
    setPassword("");
  };

  // =====================================================
  // LOAD CURRENT USER / ROLE
  // =====================================================

  const loadCurrentUser = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return null;
      }

      if (!response.ok) return null;

      const user = await response.json();
      const role = user.role || "Developer";

      setCurrentUser(user);
      setCurrentUserRole(role);
      setProfileName(user.name || "BugFlow User");
      setProfileEmail(user.email || "");
      setProfileRole(role);

      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("role", role);

      return user;
    } catch (error) {
      console.error("Load current user error:", error);
      return null;
    }
  };

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    if (loggedIn) {
      loadCurrentUser().finally(() => {
        loadDashboardData();
      });
    }
  }, [loggedIn]);
  const loadBackendNotifications = async () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/notifications`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      console.error("Failed to load notifications.");
      return;
    }

    const data = await response.json();

    setNotifications(
      (Array.isArray(data) ? data : []).map(
        (notification) => ({
          ...notification,
          icon:
            notification.notification_type === "assignment"
              ? "👨‍💻"
              : "🔔",
          title:
            notification.notification_type === "assignment"
              ? "Issue Assigned"
              : "Notification",
          message: notification.message,
          time: notification.created_at
            ? new Date(
                notification.created_at
              ).toLocaleString()
            : "Now",
        })
      )
    );

    setReadNotificationIds(
      (Array.isArray(data) ? data : [])
        .filter((notification) => notification.is_read)
        .map((notification) => notification.id)
    );
  } catch (error) {
    console.error(
      "Notification loading error:",
      error
    );
  }
};


useEffect(() => {
  if (loggedIn) {
    loadBackendNotifications();
  }
}, [loggedIn]);

  useEffect(() => {
    if (loggedIn && activePage === "sprints") {
      loadSprints();
    }
  }, [loggedIn, activePage]);

  const loadRecentDashboardActivity = async (issueList) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      return;
    }

    if (!Array.isArray(issueList) || issueList.length === 0) {
      setRecentActivity([]);
      return;
    }

    setRecentActivityLoading(true);

    try {
      const recentIssues = issueList.slice(0, 8);

      const results = await Promise.all(
        recentIssues.map(async (issue) => {
          try {
            const response = await fetch(
              `${API_URL}/issues/${issue.id}/activity`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.status === 401) {
              logout();
              return [];
            }

            if (!response.ok) {
              return [];
            }

            const data = await response.json();

            return (Array.isArray(data) ? data : []).map((activity) => ({
              ...activity,
              issue_id: issue.id,
              issue_title: issue.title,
            }));
          } catch (error) {
            console.error(
              `Dashboard activity error for issue ${issue.id}:`,
              error
            );
            return [];
          }
        })
      );

      const flattened = results
        .flat()
        .sort((a, b) => {
          const aTime = a.created_at
            ? new Date(a.created_at).getTime()
            : 0;
          const bTime = b.created_at
            ? new Date(b.created_at).getTime()
            : 0;
          return bTime - aTime;
        })
        .slice(0, 8);

      setRecentActivity(flattened);
    } catch (error) {
      console.error("Recent dashboard activity error:", error);
      setRecentActivity([]);
    } finally {
      setRecentActivityLoading(false);
    }
  };
  const loadAnalyticsData = async () => {
  const token = sessionStorage.getItem("token");

  if (!token) return;

  try {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const [reportResponse, workloadResponse] = await Promise.all([
      fetch(`${API_URL}/reports/issues`, {
        method: "GET",
        headers,
      }),

      fetch(`${API_URL}/reports/workload`, {
        method: "GET",
        headers,
      }),
    ]);

    if (
      reportResponse.status === 401 ||
      workloadResponse.status === 401
    ) {
      logout();
      return;
    }

    if (reportResponse.ok) {
      const reportData = await reportResponse.json();
      setIssueReport(reportData);
    }

    if (workloadResponse.ok) {
      const workloadData = await workloadResponse.json();

      setDeveloperWorkload(
        Array.isArray(workloadData)
          ? workloadData
          : []
      );
    }
  } catch (error) {
    console.error("Analytics loading error:", error);
  }
};

  const loadDashboardData = async () => {
    setLoading(true);

    const token = sessionStorage.getItem("token");

    try {
      // =================================================
      // GET PROJECTS
      // =================================================

      const projectResponse = await fetch(
        `${API_URL}/projects`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (projectResponse.status === 401) {
        logout();
        return;
      }

      const projectData = await projectResponse.json();

      const projectList = Array.isArray(projectData)
        ? projectData
        : [];

      setProjects(projectList);

      // =================================================
      // SET DEFAULT PROJECT
      // =================================================

      if (
        projectList.length > 0 &&
        !selectedProjectId
      ) {
        setSelectedProjectId(
          String(projectList[0].id)
        );
      }

      // =================================================
      // GET ISSUES
      // =================================================

      const issueResponse = await fetch(
        `${API_URL}/issues`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (issueResponse.status === 401) {
        logout();
        return;
      }

      const issueData = await issueResponse.json();

      const issueList = Array.isArray(issueData)
        ? issueData
        : [];

      setIssues(issueList);

      loadRecentDashboardActivity(issueList);

      const developerResponse = await fetch(
        `${API_URL}/developers`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (developerResponse.status === 401) {
        logout();
        return;
      }

      const developerData = await developerResponse.json();

      setDevelopers(
        Array.isArray(developerData)
          ? developerData
          : []
      );
      await loadAnalyticsData();
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };
    // =====================================================
  // HISTORICAL RESOLUTION INTELLIGENCE
  // =====================================================

  const analyzeHistoricalResolution = async (issueId) => {
    const issue = issues.find(
      (item) => String(item.id) === String(issueId)
    );

    if (!issue) {
      alert("Please select an issue.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    const historicalIssues = issues
      .filter(
        (item) =>
          String(item.id) !== String(issue.id) &&
          ["Resolved", "Closed"].includes(item.status)
      )
      .slice(0, 30);

    try {
      const response = await fetch(
        `${API_URL}/ai/historical-resolution`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: issue.title || "",
            description: issue.description || "",
            category: issue.category || "Other",
            module: issue.module || "Unknown",
            severity: issue.severity || "Medium",
            priority: issue.priority || "Medium",
            historical_issues: historicalIssues,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
          "Historical resolution analysis failed."
        );
        return;
      }

      setHistoricalResult(data);
    } catch (error) {
      console.error(
        "Historical resolution error:",
        error
      );
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  // =====================================================
  // EXPLAINABLE EVIDENCE EXPLORER
  // =====================================================

  const exploreEvidence = async () => {
    if (!evidenceQuestion.trim()) {
      alert("Please enter a question.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/ai/evidence-explorer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: evidenceQuestion,
            current_issue: "",
            evidence: evidenceText
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
          "Evidence analysis failed."
        );
        return;
      }

      setEvidenceResult(data);
    } catch (error) {
      console.error(
        "Evidence explorer error:",
        error
      );
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  // =====================================================
  // AI-POWERED ISSUE INVESTIGATION
  // =====================================================

  const investigateIssue = async (issueId) => {
    const issue = issues.find(
      (item) => String(item.id) === String(issueId)
    );

    if (!issue) {
      alert("Please select an issue.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/ai/issue-investigation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: issue.title || "",
            description: issue.description || "",
            category: issue.category || "Other",
            module: issue.module || "Unknown",
            severity: issue.severity || "Medium",
            priority: issue.priority || "Medium",
            historical_context: [],
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
          "Issue investigation failed."
        );
        return;
      }

      setInvestigationResult(data);
    } catch (error) {
      console.error(
        "Issue investigation error:",
        error
      );
      alert("Cannot connect to the BugFlow backend.");
    }
  };
  const runGitHubCodeReview = async () => {
  const issue = issues.find(
    (item) =>
      String(item.id) === String(resolutionIssueId)
  );

  if (!issue) {
    alert("Please select an issue first.");
    return;
  }

  if (!githubRepoUrl.trim()) {
    alert("Please save a GitHub repository first.");
    return;
  }

  if (!codeReviewPrNumber.trim()) {
    alert("Please enter a GitHub pull request number.");
    return;
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Your session has expired. Please login again.");
    logout();
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/ai/github-code-review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issue_id: issue.id,
          issue_title: issue.title || "",
          issue_description: issue.description || "",
          repo_url: githubRepoUrl,
          pr_number: Number(codeReviewPrNumber),
        }),
      }
    );

    const data = await response.json().catch(
      () => ({})
    );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      alert(
        data.detail ||
          "GitHub code review failed."
      );
      return;
    }

    setCodeReviewResult(data);
  } catch (error) {
    console.error(
      "GitHub code review error:",
      error
    );

    alert(
      "Cannot connect to the BugFlow backend."
    );
  }
};
const runPredictiveSprintAnalytics = async () => {
  const sprint = sprints.find(
    (item) =>
      String(item.id) === String(selectedSprintId)
  );

  if (!sprint) {
    alert("Please select a sprint first.");
    return;
  }

  const sprintIssues = issues.filter((issue) =>
    sprintIssueIds.includes(issue.id)
  );

  const total = sprintIssues.length;

  const completed = sprintIssues.filter((issue) =>
    [
      "resolved",
      "closed",
      "done",
      "completed",
    ].includes(
      String(issue.status || "").toLowerCase()
    )
  ).length;

  const remaining = total - completed;

  const highPriority = sprintIssues.filter(
    (issue) =>
      ["high", "critical"].includes(
        String(issue.priority || "").toLowerCase()
      )
  ).length;

  const unassigned = sprintIssues.filter(
    (issue) => !issue.assigned_to
  ).length;

  const developerIds = [
    ...new Set(
      sprintIssues
        .map((issue) => issue.assigned_to)
        .filter(Boolean)
    ),
  ];

  const progress =
    total > 0
      ? Math.round((completed / total) * 100)
      : 100;

  const historicalSprints = sprints
    .filter(
      (item) =>
        String(item.id) !== String(sprint.id)
    )
    .slice(0, 10)
    .map((item) => {
      const itemIssues = issues.filter(
        (issue) =>
          sprintIssueIds.includes(issue.id)
      );

      return {
        name: item.name,
        status: item.status,
        issue_count: itemIssues.length,
      };
    });

  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Your session has expired. Please login again.");
    logout();
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/ai/predictive-sprint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sprint_name: sprint.name,
          total_issues: total,
          completed_issues: completed,
          remaining_issues: remaining,
          high_priority_issues: highPriority,
          unassigned_issues: unassigned,
          developer_count: developerIds.length,
          sprint_progress_percent: progress,
          historical_sprints: historicalSprints,
        }),
      }
    );

    const data = await response.json().catch(
      () => ({})
    );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      alert(
        data.detail ||
          "Predictive sprint analysis failed."
      );
      return;
    }

    setPredictiveSprintResult(data);
  } catch (error) {
    console.error(
      "Predictive sprint error:",
      error
    );

    alert(
      "Cannot connect to the BugFlow backend."
    );
  }
};
  // =====================================================
// =====================================================
  // SPRINT PLANNING
  // =====================================================

  const resetSprintForm = () => {
    setShowSprintForm(false);
    setEditingSprintId(null);
    setSprintName("");
    setSprintGoal("");
    setSprintStartDate("");
    setSprintEndDate("");
    setSprintStatus("Planned");
  };

  const openCreateSprint = () => {
    if (!canManageSprints) {
      alert("Only Manager or Admin users can manage sprints.");
      return;
    }

    if (projects.length === 0) {
      alert("Please create a project first.");
      return;
    }

    setEditingSprintId(null);
    setSprintName("");
    setSprintGoal("");
    setSprintStartDate("");
    setSprintEndDate("");
    setSprintStatus("Planned");
    setShowSprintForm(true);
  };

  const openEditSprint = (sprint) => {
    if (!canManageSprints) {
      alert("Only Manager or Admin users can manage sprints.");
      return;
    }

    setEditingSprintId(sprint.id);
    setSprintName(sprint.name || "");
    setSprintGoal(sprint.goal || "");
    setSprintStartDate(sprint.start_date || "");
    setSprintEndDate(sprint.end_date || "");
    setSprintStatus(sprint.status || "Planned");
    setShowSprintForm(true);
  };

  const loadSprints = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      return;
    }

    setSprintLoading(true);

    try {
      const response = await fetch(`${API_URL}/sprints`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        alert(data.detail || "Failed to load sprints.");
        return;
      }

      const sprintList = Array.isArray(data) ? data : [];
      setSprints(sprintList);

      if (!selectedSprintId && sprintList.length > 0) {
        setSelectedSprintId(String(sprintList[0].id));
      }
    } catch (error) {
      console.error("Load sprints error:", error);
      alert("Cannot connect to the BugFlow backend.");
    } finally {
      setSprintLoading(false);
    }
  };

  const saveSprint = async () => {
    if (!canManageSprints) {
      alert("Only Manager or Admin users can manage sprints.");
      return;
    }

    if (!sprintName.trim()) {
      alert("Sprint name is required.");
      return;
    }

    if (!selectedProjectId) {
      alert("Please select a project.");
      return;
    }

    if (!sprintStartDate || !sprintEndDate) {
      alert("Start date and end date are required.");
      return;
    }

    if (sprintStartDate > sprintEndDate) {
      alert("Start date cannot be after end date.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setSprintSaving(true);

    try {
      const isEditing = editingSprintId !== null;
      const url = isEditing
        ? `${API_URL}/sprints/${editingSprintId}`
        : `${API_URL}/sprints`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: Number(selectedProjectId),
          name: sprintName.trim(),
          goal: sprintGoal.trim(),
          start_date: sprintStartDate,
          end_date: sprintEndDate,
          status: sprintStatus,
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to save sprint.");
        return;
      }

      alert(isEditing ? "Sprint updated successfully." : "Sprint created successfully.");
      resetSprintForm();
      setSelectedSprintId(String(data.id));
      await loadSprints();
    } catch (error) {
      console.error("Save sprint error:", error);
      alert("Cannot connect to the BugFlow backend.");
    } finally {
      setSprintSaving(false);
    }
  };

  const deleteSprint = async (sprint) => {
    if (!canManageSprints) {
      alert("Only Manager or Admin users can manage sprints.");
      return;
    }

    if (!window.confirm(`Delete sprint \"${sprint.name}\"?`)) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sprints/${sprint.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to delete sprint.");
        return;
      }

      if (String(selectedSprintId) === String(sprint.id)) {
        setSelectedSprintId("");
        setSprintIssueIds([]);
      }

      await loadSprints();
      alert("Sprint deleted successfully.");
    } catch (error) {
      console.error("Delete sprint error:", error);
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  const loadSprintIssues = async (sprintId) => {
    if (!sprintId) {
      setSprintIssueIds([]);
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sprints/${sprintId}/issues`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        alert(data.detail || "Failed to load sprint issues.");
        return;
      }

      setSprintIssueIds(
        Array.isArray(data) ? data.map((issue) => issue.id) : []
      );
    } catch (error) {
      console.error("Load sprint issues error:", error);
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  const handleSprintSelection = async (value) => {
    setSelectedSprintId(value);
    setSprintAssignIssueId("");
    await loadSprintIssues(value);
  };

  const assignIssueToSprint = async () => {
    if (!canManageSprints) {
      alert("Only Manager or Admin users can manage sprints.");
      return;
    }

    if (!selectedSprintId || !sprintAssignIssueId) {
      alert("Select both a sprint and an issue.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/sprints/${selectedSprintId}/issues`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            issue_id: Number(sprintAssignIssueId),
          }),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to assign issue to sprint.");
        return;
      }

      setSprintAssignIssueId("");
      await loadSprintIssues(selectedSprintId);
      alert(data.message || "Issue assigned to sprint successfully.");
    } catch (error) {
      console.error("Assign issue to sprint error:", error);
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  const removeIssueFromSprint = async (issueId) => {
    if (!canManageSprints) {
      alert("Only Manager or Admin users can manage sprints.");
      return;
    }

    if (!selectedSprintId) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/sprints/${selectedSprintId}/issues/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to remove issue from sprint.");
        return;
      }

      await loadSprintIssues(selectedSprintId);
    } catch (error) {
      console.error("Remove issue from sprint error:", error);
      alert("Cannot connect to the BugFlow backend.");
    }
  };

  const getSprintProjectName = (projectId) => {
    const project = projects.find(
      (item) => Number(item.id) === Number(projectId)
    );
    return project?.project_name || "Unknown project";
  };

  const getSprintIssues = () => {
    return issues.filter((issue) => sprintIssueIds.includes(issue.id));
  };

  // =====================================================
  // PROJECT CRUD
  // =====================================================

const openCreateProject = () => {
  if (!canManageProjects) {
    alert("Only Manager or Admin users can manage projects.");
    return;
  }

  setEditingProjectId(null);
  setProjectName("");
  setProjectDescription("");
  setShowProjectForm(true);
};

const openEditProject = (project) => {
  if (!canManageProjects) {
    alert("Only Manager or Admin users can manage projects.");
    return;
  }

  setEditingProjectId(project.id);
  setProjectName(project.project_name || "");
  setProjectDescription(project.description || "");
  setShowProjectForm(true);
};

const closeProjectForm = () => {
  setShowProjectForm(false);
  setEditingProjectId(null);
  setProjectName("");
  setProjectDescription("");
};

const saveProject = async () => {
  if (!canManageProjects) {
    alert("Only Manager or Admin users can manage projects.");
    return;
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Please login again.");
    return;
  }

  if (!projectName.trim()) {
    alert("Project name is required.");
    return;
  }

  setProjectSaving(true);

  try {
    const isEditing = editingProjectId !== null;

    const url = isEditing
      ? `${API_URL}/projects/${editingProjectId}`
      : `${API_URL}/projects`;

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_name: projectName.trim(),
        description: projectDescription.trim(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Project save error:", data);
      alert(
        data.detail ||
          `Unable to ${isEditing ? "update" : "create"} project.`
      );
      return;
    }

    alert(
      isEditing
        ? "Project updated successfully."
        : "Project created successfully."
    );

    closeProjectForm();

    await loadDashboardData();
  } catch (error) {
    console.error("Project save error:", error);
    alert("Cannot connect to BugFlow backend.");
  } finally {
    setProjectSaving(false);
  }
};

const deleteProject = async (project) => {
  if (!canManageProjects) {
    alert("Only Manager or Admin users can manage projects.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete project "${project.project_name}"?`
  );

  if (!confirmed) {
    return;
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Please login again.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/projects/${project.id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Project delete error:", data);
      alert(
        data.detail ||
          "Unable to delete project."
      );
      return;
    }

    alert("Project deleted successfully.");

    await loadDashboardData();
  } catch (error) {
    console.error("Project delete error:", error);
    alert("Cannot connect to BugFlow backend.");
  }
};

  // =====================================================
  // PAGE NAVIGATION HELPERS
  // =====================================================

  const navigateTo = (page) => {
    setShowCreateIssue(false);
    setShowAI(false);
    setShowProfileMenu(false);
    setShowProfilePanel(false);
    setShowSettingsPanel(false);
    setShowNotifications(false);
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // OPEN CREATE ISSUE
  // =====================================================

  const openCreateIssue = () => {
    if (projects.length === 0) {
      alert(
        "No project available. Please create a project first."
      );

      return;
    }

    if (!selectedProjectId) {
      setSelectedProjectId(
        String(projects[0].id)
      );
    }

    setEditIssueId(null);
    setShowCreateIssue(false);
    setShowDuplicateWarning(true);
    setAiClassification(null);
    setActivePage("create");
  };

  // =====================================================
  // ENHANCE ISSUE DESCRIPTION WITH AI
  // =====================================================

  const enhanceIssueDescription = async () => {
    if (!issueDescription.trim()) {
      alert("Please enter a description first.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setEnhancingDescription(true);

    try {
      const response = await fetch(
        `${API_URL}/ai/enhance-description`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            description: issueDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : "AI enhancement failed.";

        alert(errorMessage);
        return;
      }

      if (data.enhanced_description) {
        setIssueDescription(
          data.enhanced_description
        );
      } else {
        alert(
          "AI did not return an enhanced description."
        );
      }
    } catch (error) {
      console.error(
        "AI description enhancement error:",
        error
      );

      alert(
        "Could not connect to the AI service. Please make sure the backend is running."
      );
    } finally {
      setEnhancingDescription(false);
    }
  };

  // =====================================================
  // AI DEFECT CLASSIFICATION
  // =====================================================

  const classifyIssueWithAI = async () => {
    if (!issueTitle.trim()) {
      alert("Please enter an issue title first.");
      return;
    }

    if (!issueDescription.trim()) {
      alert("Please enter an issue description first.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setClassifyingIssue(true);

    try {
      const response = await fetch(
        `${API_URL}/ai/classify-issue`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: issueTitle.trim(),
            description: issueDescription.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
            "AI classification failed."
        );
        return;
      }

      setAiClassification(data);

      if (data.priority) {
        setIssuePriority(data.priority);
      }
    } catch (error) {
      console.error("AI classification error:", error);
      alert(
        "Could not connect to the AI service. Please make sure the backend is running."
      );
    } finally {
      setClassifyingIssue(false);
    }
  };

  const updateAIClassificationField = (field, value) => {
    setAiClassification((current) => ({
      ...(current || {}),
      [field]: value,
    }));

    if (field === "priority") {
      setIssuePriority(value);
    }
  };

  const saveAIClassificationForIssue = async (issueId, classification) => {
    if (!issueId || !classification) {
      return true;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      logout();
      return false;
    }

    setSavingClassification(true);

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}/ai-classification`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: classification.category || "Other",
            module: classification.module || "Unknown",
            defect_type: classification.defect_type || "Other",
            severity: classification.severity || "Medium",
            priority: classification.priority || issuePriority || "Medium",
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        return false;
      }

      if (!response.ok) {
        console.error("AI classification save failed:", data);
        alert(
          data.detail ||
            "Issue was created, but AI classification could not be saved."
        );
        return false;
      }

      setIssues((currentIssues) =>
        currentIssues.map((item) =>
          item.id === issueId
            ? {
                ...item,
                category: data.category,
                module: data.module,
                defect_type: data.defect_type,
                severity: data.severity,
                priority: data.priority,
              }
            : item
        )
      );

      return true;
    } catch (error) {
      console.error("Save AI classification error:", error);
      alert(
        "Issue was created, but AI classification could not be saved."
      );
      return false;
    } finally {
      setSavingClassification(false);
    }
  };

  // =====================================================
  // EDIT ISSUE
  // =====================================================

  const openEditIssue = (issue) => {
    if (!canEditIssues) {
      alert("Tester users can view and report issues, but cannot edit them.");
      return;
    }

    setEditIssueId(issue.id);
    setIssueTitle(issue.title || "");
    setIssueDescription(issue.description || "");
    setIssuePriority(issue.priority || "Medium");
    setIssueStatus(issue.status || "Open");
    setSelectedProjectId(issue.project_id ? String(issue.project_id) : "");
    setSelectedDeveloperId(issue.assigned_to ? String(issue.assigned_to) : "");

    if (issue.category || issue.module || issue.defect_type || issue.severity) {
      setAiClassification({
        category: issue.category || "Other",
        module: issue.module || "Unknown",
        defect_type: issue.defect_type || "Other",
        severity: issue.severity || "Medium",
        priority: issue.priority || "Medium",
        reason: "Existing AI classification for this issue.",
      });
    } else {
      setAiClassification(null);
    }

    setActivePage("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateIssue = async () => {
    if (!canEditIssues) {
      alert("You do not have permission to edit issues.");
      return;
    }

    if (!editIssueId) return;
    if (!issueTitle.trim()) { alert("Please enter an issue title."); return; }
    if (!issueDescription.trim()) { alert("Please enter an issue description."); return; }
    if (!selectedProjectId) { alert("Please select a project."); return; }

    const token = sessionStorage.getItem("token");
    if (!token) { alert("Your session has expired. Please login again."); logout(); return; }

    try {
      const response = await fetch(`${API_URL}/issues/${editIssueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: issueTitle.trim(),
          description: issueDescription.trim(),
          status: issueStatus,
          priority: issuePriority,
          project_id: Number(selectedProjectId),
          assigned_to: selectedDeveloperId ? Number(selectedDeveloperId) : null,
        }),
      });

      const data = await response.json();
      if (response.status === 401) { logout(); return; }
      if (!response.ok) { alert(data.detail || "Failed to update issue."); return; }

      if (aiClassification) {
        await saveAIClassificationForIssue(
          editIssueId,
          { ...aiClassification, priority: issuePriority }
        );
      }

      setIssues((currentIssues) =>
        currentIssues.map((item) =>
          item.id === editIssueId ? {
            ...item,
            title: data.title ?? issueTitle.trim(),
            description: data.description ?? issueDescription.trim(),
            status: data.status ?? issueStatus,
            priority: data.priority ?? issuePriority,
            project_id: data.project_id ?? Number(selectedProjectId),
            assigned_to: data.assigned_to ?? (selectedDeveloperId ? Number(selectedDeveloperId) : null),
          } : item
        )
      );

      setEditIssueId(null);
      setIssueTitle("");
      setIssueDescription("");
      setIssuePriority("Medium");
      setIssueStatus("Open");
      setSelectedProjectId("");
      setSelectedDeveloperId("");
      setAiClassification(null);
      await loadDashboardData();
      alert("Issue updated successfully! 🐞");
      setActivePage("issues");
    } catch (error) {
      console.error("Update issue error:", error);
      alert("Cannot connect to BugFlow backend. Make sure FastAPI is running.");
    }
  };

  // =====================================================
  // DUPLICATE ISSUE DETECTION
  // =====================================================

  const getDuplicateIssues = () => {
    const titleWords = new Set(
      issueTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2)
    );

    const descriptionWords = new Set(
      issueDescription
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2)
    );

    if (titleWords.size === 0 && descriptionWords.size === 0) {
      return [];
    }

    return issues
      .filter((issue) => !editIssueId || issue.id !== editIssueId)
      .map((issue) => {
        const existingWords = new Set(
          `${issue.title || ""} ${issue.description || ""}`
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2)
        );

        const inputWords = new Set([...titleWords, ...descriptionWords]);
        const commonWords = [...inputWords].filter((word) =>
          existingWords.has(word)
        ).length;

        const similarity =
          inputWords.size > 0 ? commonWords / inputWords.size : 0;

        return { ...issue, similarity };
      })
      .filter((issue) => issue.similarity >= 0.45)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  };

  const duplicateIssues =
    activePage === "create" && showDuplicateWarning
      ? getDuplicateIssues()
      : [];

  // =====================================================
  // CREATE ISSUE
  // =====================================================

  const handleCreateIssue = async () => {
    // -----------------------------------------------
    // VALIDATE TITLE
    // -----------------------------------------------

    if (!issueTitle.trim()) {
      alert("Please enter an issue title.");
      return;
    }

    // -----------------------------------------------
    // VALIDATE DESCRIPTION
    // -----------------------------------------------

    if (!issueDescription.trim()) {
      alert("Please enter an issue description.");
      return;
    }

    // -----------------------------------------------
    // VALIDATE PROJECT
    // -----------------------------------------------

    if (!selectedProjectId) {
      alert("Please select a project.");
      return;
    }

    const token = sessionStorage.getItem("token");

    // -----------------------------------------------
    // DATA REQUIRED BY POST /issues
    // -----------------------------------------------

    const issueData = {
      title: issueTitle.trim(),

      description:
        issueDescription.trim(),

      status: issueStatus,

      priority: issuePriority,

      project_id:
        Number(selectedProjectId),

      assigned_to: selectedDeveloperId
        ? Number(selectedDeveloperId)
        : null,
    };

    console.log(
      "Sending issue:",
      issueData
    );

    try {
      const response = await fetch(
        `${API_URL}/issues`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept: "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            issueData
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "Create issue response:",
        data
      );

      // -----------------------------------------------
      // ERROR
      // -----------------------------------------------

      if (!response.ok) {
        console.error(
          "Create issue failed:",
          data
        );

        if (
          response.status === 401
        ) {
          alert(
            "Your login session expired. Please login again."
          );

          logout();

          return;
        }

        alert(
          data.detail ||
            "Failed to create issue."
        );

        return;
      }

      // -----------------------------------------------
      // SAVE AI CLASSIFICATION IF IT EXISTS
      // -----------------------------------------------

      if (aiClassification && data.id) {
        await saveAIClassificationForIssue(
          data.id,
          { ...aiClassification, priority: issuePriority }
        );
      }

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      alert(
        aiClassification
          ? "Issue created with AI classification! 🐞🤖"
          : "Issue created successfully! 🐞"
      );

      setShowCreateIssue(false);
      setEditIssueId(null);

      setIssueTitle("");
      setIssueDescription("");
      setIssuePriority("Medium");
      setIssueStatus("Open");
      setSelectedDeveloperId("");
      setShowDuplicateWarning(true);
      setAiClassification(null);

      await loadDashboardData();

    } catch (error) {
      console.error(
        "Create issue error:",
        error
      );

      alert(
        "Cannot connect to BugFlow backend. Make sure FastAPI is running."
      );
    }
  };

  // =====================================================
  // MILESTONE 2
  // UPDATE ISSUE STATUS
  // =====================================================

  const updateIssueStatus = async (
    issueId,
    newStatus
  ) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert(
        "Your session has expired. Please login again."
      );

      logout();

      return;
    }

    const issue = issues.find(
      (item) => item.id === issueId
    );

    if (!issue) {
      alert("Issue not found.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Accept: "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: issue.title,

            description:
              issue.description,

            status: newStatus,

            priority:
              issue.priority,

            project_id:
              issue.project_id,

            assigned_to:
              issue.assigned_to ?? null,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to update issue status."
        );

        return;
      }

      // Update UI immediately
      setIssues((currentIssues) =>
        currentIssues.map((item) =>
          item.id === issueId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

    } catch (error) {
      console.error(
        "Update issue status error:",
        error
      );

      alert(
        "Cannot connect to the backend."
      );
    }
  };

  // =====================================================
  // DELETE ISSUE
  // =====================================================

  const deleteIssue = async (issueId) => {
    if (!canDeleteIssues) {
      alert("Only Manager or Admin users can delete issues.");
      return;
    }

    const issue = issues.find(
      (item) => item.id === issueId
    );

    if (!issue) {
      alert("Issue not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete issue "${issue.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(
          data?.detail ||
            "Failed to delete issue."
        );
        return;
      }

      setIssues((currentIssues) =>
        currentIssues.filter(
          (item) => item.id !== issueId
        )
      );

      setExpandedActivities((current) => {
        const next = { ...current };
        delete next[issueId];
        return next;
      });

      setIssueActivities((current) => {
        const next = { ...current };
        delete next[issueId];
        return next;
      });

      setIssueComments((current) => {
        const next = { ...current };
        delete next[issueId];
        return next;
      });

      setExpandedComments((current) => {
        const next = { ...current };
        delete next[issueId];
        return next;
      });

      setCommentInputs((current) => {
        const next = { ...current };
        delete next[issueId];
        return next;
      });

      alert("Issue deleted successfully.");
    } catch (error) {
      console.error(
        "Delete issue error:",
        error
      );

      alert(
        "Cannot connect to BugFlow backend. Make sure FastAPI is running."
      );
    }
  };

  // =====================================================
  // UPDATE ISSUE PRIORITY
  // =====================================================

  const updateIssuePriority = async (
    issueId,
    newPriority
  ) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    const issue = issues.find(
      (item) => item.id === issueId
    );

    if (!issue) {
      alert("Issue not found.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: issue.title,
            description: issue.description,
            status: issue.status || "Open",
            priority: newPriority,
            project_id: issue.project_id,
            assigned_to: issue.assigned_to ?? null,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to update issue priority."
        );
        return;
      }

      setIssues((currentIssues) =>
        currentIssues.map((item) =>
          item.id === issueId
            ? {
                ...item,
                priority: newPriority,
              }
            : item
        )
      );

      // Refresh activity if it is currently open.
      if (expandedActivities[issueId]) {
        await loadIssueActivity(issueId);
      }
    } catch (error) {
      console.error(
        "Update issue priority error:",
        error
      );

      alert("Cannot connect to the backend.");
    }
  };

  // =====================================================
  // MILESTONE 2
  // UPDATE ISSUE ASSIGNMENT
  // =====================================================

  const updateIssueAssignment = async (
    issueId,
    newDeveloperId
  ) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    const issue = issues.find(
      (item) => item.id === issueId
    );

    if (!issue) {
      alert("Issue not found.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: issue.title,
            description: issue.description,
            status: issue.status || "Open",
            priority: issue.priority || "Medium",
            project_id: issue.project_id,
            assigned_to: newDeveloperId
              ? Number(newDeveloperId)
              : null,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to update issue assignment."
        );
        return;
      }

      setIssues((currentIssues) =>
        currentIssues.map((item) =>
          item.id === issueId
            ? {
                ...item,
                assigned_to: newDeveloperId
                  ? Number(newDeveloperId)
                  : null,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Update issue assignment error:",
        error
      );

      alert("Cannot connect to the backend.");
    }
  };

  // =====================================================
  // ISSUE ACTIVITY
  // =====================================================

  const loadIssueActivity = async (issueId) => {

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setActivityLoading((current) => ({
      ...current,
      [issueId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}/activity`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || "Failed to load issue activity.");
        return;
      }

      const data = await response.json();

      setIssueActivities((current) => ({
        ...current,
        [issueId]: Array.isArray(data) ? data : [],
      }));

      setExpandedActivities((current) => ({
        ...current,
        [issueId]: true,
      }));

    } catch (error) {
      console.error("Load issue activity error:", error);
      alert("Cannot connect to the backend.");
    } finally {
      setActivityLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  const toggleIssueActivity = (issueId) => {
    if (expandedActivities[issueId]) {
      setExpandedActivities((current) => ({
        ...current,
        [issueId]: false,
      }));
      return;
    }

    loadIssueActivity(issueId);
  };
 
  
  // =====================================================
  // TIME TRACKING
  // =====================================================

  const loadIssueTimeLogs = async (issueId) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setTimeLogLoading((current) => ({
      ...current,
      [issueId]: true,
    }));

    try {
      const [logsResponse, totalResponse] = await Promise.all([
        fetch(`${API_URL}/time/issues/${issueId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/time/issues/${issueId}/total`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        logsResponse.status === 401 ||
        totalResponse.status === 401
      ) {
        logout();
        return;
      }

      const logsData = await logsResponse.json().catch(() => []);
      const totalData = await totalResponse.json().catch(() => ({}));

      if (!logsResponse.ok) {
        alert(
          logsData.detail ||
            "Failed to load time logs."
        );
        return;
      }

      if (!totalResponse.ok) {
        alert(
          totalData.detail ||
            "Failed to load total logged hours."
        );
        return;
      }

      setIssueTimeLogs((current) => ({
        ...current,
        [issueId]: Array.isArray(logsData)
          ? logsData
          : [],
      }));

      setIssueTimeTotals((current) => ({
        ...current,
        [issueId]: Number(totalData.total_hours || 0),
      }));
    } catch (error) {
      console.error(
        "Load time logs error:",
        error
      );

      alert(
        "Cannot connect to the backend."
      );
    } finally {
      setTimeLogLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };


  const addTimeLog = async (issueId) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    const hours = Number(timeLogHours);

    if (!hours || hours <= 0) {
      alert("Please enter valid hours greater than 0.");
      return;
    }

    setTimeLogSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/time/logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            hours: hours,
            description:
              timeLogDescription.trim() || null,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to add time log."
        );
        return;
      }

      setTimeLogHours("");
      setTimeLogDescription("");

      await loadIssueTimeLogs(issueId);
    } catch (error) {
      console.error(
        "Add time log error:",
        error
      );

      alert(
        "Cannot connect to the backend."
      );
    } finally {
      setTimeLogSaving(false);
    }
  };


  const deleteTimeLog = async (
    logId,
    issueId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this time log?"
    );

    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/time/logs/${logId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to delete time log."
        );
        return;
      }

      await loadIssueTimeLogs(issueId);
    } catch (error) {
      console.error(
        "Delete time log error:",
        error
      );

      alert(
        "Cannot connect to the backend."
      );
    }
  };
// =====================================================
// ISSUE ATTACHMENTS
// =====================================================

const loadIssueAttachments = async (issueId) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Your session has expired. Please login again.");
    logout();
    return;
  }

  setAttachmentLoading((current) => ({
    ...current,
    [issueId]: true,
  }));

  try {
    const response = await fetch(
      `${API_URL}/issues/${issueId}/attachments`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      alert(data.detail || "Failed to load attachments.");
      return;
    }

    setIssueAttachments((current) => ({
      ...current,
      [issueId]: Array.isArray(data) ? data : [],
    }));

    setExpandedAttachments((current) => ({
      ...current,
      [issueId]: true,
    }));
  } catch (error) {
    console.error("Load attachments error:", error);
    alert("Cannot connect to the backend.");
  } finally {
    setAttachmentLoading((current) => ({
      ...current,
      [issueId]: false,
    }));
  }
};

const toggleIssueAttachments = (issueId) => {
  if (expandedAttachments[issueId]) {
    setExpandedAttachments((current) => ({
      ...current,
      [issueId]: false,
    }));
    return;
  }

  loadIssueAttachments(issueId);
};
const uploadIssueAttachment = async (issueId) => {
  const file = selectedAttachmentFiles[issueId];

  if (!file) {
    alert("Please choose a file first.");
    return;
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Your session has expired. Please login again.");
    logout();
    return;
  }

  setAttachmentLoading((current) => ({
    ...current,
    [issueId]: true,
  }));

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_URL}/issues/${issueId}/attachments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(data.detail || "Failed to upload attachment.");
      return;
    }

    setSelectedAttachmentFiles((current) => ({
      ...current,
      [issueId]: null,
    }));

    const input = document.getElementById(
      `attachment-input-${issueId}`
    );

    if (input) {
      input.value = "";
    }

    await loadIssueAttachments(issueId);

  } catch (error) {
    console.error("Upload attachment error:", error);
    alert("Cannot connect to the backend.");
  } finally {
    setAttachmentLoading((current) => ({
      ...current,
      [issueId]: false,
    }));
  }
};

  // =====================================================
  // DOWNLOAD ISSUE ATTACHMENT
  // =====================================================

  const downloadIssueAttachment = async (attachment) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/attachments/${attachment.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || "Failed to download attachment.");
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        attachment.original_filename ||
        attachment.filename ||
        attachment.file_name ||
        attachment.name ||
        "attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download attachment error:", error);
      alert("Cannot connect to the backend.");
    }
  };

  // =====================================================
  // DELETE ISSUE ATTACHMENT
  // =====================================================

  const deleteIssueAttachment = async (issueId, attachment) => {
    const fileName =
      attachment.original_filename ||
      attachment.filename ||
      attachment.file_name ||
      attachment.name ||
      "this attachment";

    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setAttachmentLoading((current) => ({
      ...current,
      [issueId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/attachments/${attachment.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to delete attachment.");
        return;
      }

      await loadIssueAttachments(issueId);
    } catch (error) {
      console.error("Delete attachment error:", error);
      alert("Cannot connect to the backend.");
    } finally {
      setAttachmentLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  // =====================================================
  // ISSUE COMMENTS
  // =====================================================

  const loadIssueComments = async (issueId) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setCommentLoading((current) => ({
      ...current,
      [issueId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}/comments`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        alert(data.detail || "Failed to load comments.");
        return;
      }

      setIssueComments((current) => ({
        ...current,
        [issueId]: Array.isArray(data) ? data : [],
      }));

      setExpandedComments((current) => ({
        ...current,
        [issueId]: true,
      }));
    } catch (error) {
      console.error("Load comments error:", error);
      alert("Cannot connect to the backend.");
    } finally {
      setCommentLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  const toggleIssueComments = (issueId) => {
    if (expandedComments[issueId]) {
      setExpandedComments((current) => ({
        ...current,
        [issueId]: false,
      }));
      return;
    }

    loadIssueComments(issueId);
  };

  const addIssueComment = async (issueId) => {
    const commentText = String(commentInputs[issueId] || "").trim();

    if (!commentText) {
      alert("Please write a comment first.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setCommentLoading((current) => ({
      ...current,
      [issueId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/issues/${issueId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: commentText,
          }),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to add comment.");
        return;
      }

      setCommentInputs((current) => ({
        ...current,
        [issueId]: "",
      }));

      await loadIssueComments(issueId);
    } catch (error) {
      console.error("Add comment error:", error);
      alert("Cannot connect to the backend.");
    } finally {
      setCommentLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  const deleteIssueComment = async (issueId, comment) => {
    if (!comment?.id) {
      alert("Comment ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please login again.");
      logout();
      return;
    }

    setCommentLoading((current) => ({
      ...current,
      [issueId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/comments/${comment.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.detail || "Failed to delete comment.");
        return;
      }

      await loadIssueComments(issueId);
    } catch (error) {
      console.error("Delete comment error:", error);
      alert("Cannot connect to the backend.");
    } finally {
      setCommentLoading((current) => ({
        ...current,
        [issueId]: false,
      }));
    }
  };

  // =====================================================
  // AI REPORT GENERATION
  // =====================================================

  const generateAIReport = () => {
    if (!aiText.trim()) {
      alert(
        "Please describe the issue first."
      );
      return;
    }

    const text = aiText.trim();

    // Lightweight local AI-style bug report generation.
    // This keeps the current project fully local and does not require
    // an external API key.
    const lowerText = text.toLowerCase();

    let priority = "Medium";

    if (
      lowerText.includes("crash") ||
      lowerText.includes("crashes") ||
      lowerText.includes("cannot login") ||
      lowerText.includes("can't login") ||
      lowerText.includes("payment") ||
      lowerText.includes("data loss") ||
      lowerText.includes("security") ||
      lowerText.includes("not working")
    ) {
      priority = "High";
    }

    if (
      lowerText.includes("down") ||
      lowerText.includes("completely") ||
      lowerText.includes("production")
    ) {
      priority = "Critical";
    }

    const titleText =
      text.charAt(0).toUpperCase() +
      text.slice(1).replace(/[.!?]+$/, "");

    const generated = {
      title:
        titleText.length > 80
          ? titleText.substring(0, 80) + "..."
          : titleText,

      description:
        `The user reported the following issue:\n\n${text}`,

      priority,

      steps: [
        "Open the BugFlow application.",
        "Navigate to the affected feature or page.",
        "Perform the action related to the reported issue.",
        "Observe the application behaviour.",
      ],

      expected:
        "The application should perform the expected action successfully without errors.",

      actual:
        `The application shows the reported problem: ${text}`,

      environment:
        "BugFlow Web Application",

      severity:
        priority === "Critical"
          ? "Critical"
          : priority === "High"
            ? "High"
            : priority === "Medium"
              ? "Medium"
              : "Low",
    };

    setAiResult(generated);
  };

  // =====================================================
  // USE AI RESULT IN CREATE ISSUE
  // =====================================================

  const useAIResult = () => {
    if (!aiResult) {
      return;
    }

    setIssueTitle(
      aiResult.title
    );

    setIssueDescription(
      `${aiResult.description}

Steps to reproduce:
${aiResult.steps
  .map(
    (step, index) =>
      `${index + 1}. ${step}`
  )
  .join("\n")}

Expected result:
${aiResult.expected}

Actual result:
${aiResult.actual}`
    );

    setIssuePriority(
      aiResult.priority
    );

    setShowAI(false);

    setActivePage("create");
  };

  // =====================================================
  // ISSUE SEARCH + FILTER
  // =====================================================

  const exportIssuesCSV = () => {
    if (!issues.length) {
      alert("There are no issues to export.");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Description",
      "Priority",
      "Status",
      "Project ID",
      "Developer",
    ];

    const escapeCSV = (value) => {
      const textValue = String(value ?? "");
      return `"${textValue.replace(/"/g, '""')}"`;
    };

    const rows = issues.map((issue) => [
      issue.id,
      issue.title,
      issue.description,
      issue.priority,
      issue.status,
      issue.project_id,
      issue.assigned_to || issue.developer || issue.developer_name || "",
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `bugflow-issues-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredIssues = issues
    .filter((issue) => {
      const search = issueSearch.trim().toLowerCase();

      const matchesSearch =
        !search ||
        String(issue.title || "")
          .toLowerCase()
          .includes(search) ||
        String(issue.description || "")
          .toLowerCase()
          .includes(search) ||
        String(issue.id || "")
          .toLowerCase()
          .includes(search);

      const matchesPriority =
        issuePriorityFilter === "All" ||
        String(issue.priority || "Medium") === issuePriorityFilter;

      const matchesStatus =
        issueStatusFilter === "All" ||
        String(issue.status || "Open") === issueStatusFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      if (issueSort === "Title A-Z") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      if (issueSort === "Priority") {
        const order = {
          Critical: 1,
          High: 2,
          Medium: 3,
          Low: 4,
        };

        return (
          (order[String(a.priority || "Medium")] || 99) -
          (order[String(b.priority || "Medium")] || 99)
        );
      }

      if (issueSort === "Status") {
        return String(a.status || "").localeCompare(
          String(b.status || "")
        );
      }

      return Number(b.id || 0) - Number(a.id || 0);
    });

  const issuesPerPage = 8;
  const totalIssuePages = Math.max(1, Math.ceil(filteredIssues.length / issuesPerPage));
  const safeIssuePage = Math.min(issuePage, totalIssuePages);
  const paginatedIssues = filteredIssues.slice(
    (safeIssuePage - 1) * issuesPerPage,
    safeIssuePage * issuesPerPage
  );

  const copyIssueId = async (issueId) => {
    try {
      await navigator.clipboard.writeText(String(issueId));
      alert(`Issue #${issueId} copied.`);
    } catch (error) {
      console.error("Could not copy issue ID:", error);
    }
  };

  // =====================================================
  // PROFILE / SETTINGS HELPERS
  // =====================================================

  const loadProfileData = () => {
    if (currentUser) {
      setProfileName(
        currentUser.name ||
          currentUser.full_name ||
          currentUser.username ||
          currentUser.email?.split("@")[0] ||
          "BugFlow User"
      );
      setProfileEmail(currentUser.email || "");
      setProfileRole(currentUser.role || currentUserRole || "Developer");
      return;
    }

    const storedUser =
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setProfileName(
          user.name ||
            user.full_name ||
            user.username ||
            user.email?.split("@")[0] ||
            "BugFlow User"
        );

        setProfileEmail(
          user.email ||
            user.email_address ||
            ""
        );

        setProfileRole(
          user.role ||
            user.user_role ||
            "Developer"
        );

        return;
      } catch (error) {
        console.warn("Could not parse stored user:", error);
      }
    }

    const storedEmail =
      sessionStorage.getItem("email") ||
      sessionStorage.getItem("user_email") ||
      "";

    setProfileEmail(storedEmail);

    setProfileName(
      sessionStorage.getItem("profile_name") ||
        (storedEmail
          ? storedEmail.split("@")[0]
          : "BugFlow User")
    );

    setProfileRole(
      sessionStorage.getItem("role") ||
        sessionStorage.getItem("user_role") ||
        "Developer"
    );
  };

  const openProfilePanel = () => {
    loadProfileData();
    setShowProfileMenu(false);
    setShowSettingsPanel(false);
    setShowProfilePanel(true);
  };

  const openSettingsPanel = () => {
    loadProfileData();
    setShowProfileMenu(false);
    setShowProfilePanel(false);
    setShowSettingsPanel(true);
  };

  const closeAccountPanels = () => {
    setShowProfileMenu(false);
    setShowProfilePanel(false);
    setShowSettingsPanel(false);
  };

  const saveProfile = () => {
    const name = profileName.trim();

    if (!name) {
      alert("Name cannot be empty.");
      return;
    }

    sessionStorage.setItem("profile_name", name);

    const storedUser =
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        sessionStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            name,
          })
        );
      } catch (error) {
        console.warn("Could not update stored user:", error);
      }
    }

    alert("Profile updated successfully.");
  };

  // =====================================================
  // NOTIFICATION HELPERS
  // =====================================================

  const buildNotifications = (issueList) => {
    if (!Array.isArray(issueList)) {
      setNotifications([]);
      return;
    }

    const next = [];

    const highPriority = issueList.filter(
      (issue) =>
        String(issue.priority || "").toLowerCase() === "high" ||
        String(issue.priority || "").toLowerCase() === "critical"
    );

    highPriority.slice(0, 5).forEach((issue) => {
      next.push({
        id: `priority-${issue.id}`,
        type: "priority",
        icon: "🚨",
        title: "High-priority issue",
        message: issue.title || `Issue #${issue.id}`,
        time: "Needs attention",
      });
    });

    const openIssues = issueList.filter(
      (issue) =>
        String(issue.status || "").toLowerCase() === "open"
    );

    if (openIssues.length > 0) {
      next.push({
        id: "open-issues",
        type: "issue",
        icon: "🐞",
        title: "Open issues",
        message: `${openIssues.length} issue${
          openIssues.length === 1 ? "" : "s"
        } still open`,
        time: "Workspace",
      });
    }

    const assignedIssues = issueList.filter(
      (issue) =>
        issue.assigned_to !== null &&
        issue.assigned_to !== undefined
    );

    if (assignedIssues.length > 0) {
      next.push({
        id: "assigned-issues",
        type: "assignment",
        icon: "👨‍💻",
        title: "Assigned work",
        message: `${assignedIssues.length} issue${
          assignedIssues.length === 1 ? "" : "s"
        } currently assigned`,
        time: "Workspace",
      });
    }

    if (next.length === 0) {
      next.push({
        id: "all-clear",
        type: "success",
        icon: "✅",
        title: "All clear",
        message: "No immediate issue alerts.",
        time: "Now",
      });
    }

    setNotifications(next);
  };

  useEffect(() => {
    if (loggedIn) {
      buildNotifications(issues);
    }
  }, [issues, loggedIn]);
    // LOAD TIME LOGS WHEN ISSUE DETAILS OPENS
  useEffect(() => {
    if (selectedIssue && loggedIn) {
      setTimeLogHours("");
      setTimeLogDescription("");
      loadIssueTimeLogs(selectedIssue.id);
    }
  }, [selectedIssue, loggedIn]);

  const unreadNotificationCount = notifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

const markNotificationRead = async (notificationId) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      console.error("Failed to mark notification as read.");
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    );

    setReadNotificationIds((current) =>
      current.includes(notificationId)
        ? current
        : [...current, notificationId]
    );
  } catch (error) {
    console.error("Mark notification read error:", error);
  }
};


const markAllNotificationsRead = async () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      console.error("Failed to mark all notifications as read.");
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );

    setReadNotificationIds(
      notifications.map((notification) => notification.id)
    );
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );
  }
};


const clearNotifications = async () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/notifications`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      console.error("Failed to clear notifications.");
      return;
    }

    setNotifications([]);
    setReadNotificationIds([]);
    setShowNotifications(false);
  } catch (error) {
    console.error(
      "Clear notifications error:",
      error
    );
  }
};

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-logo">
            🐞
          </div>

          <h1>
            BugFlow
          </h1>

          <p className="login-subtitle">
            {showSignup
              ? "Create your BugFlow account"
              : "Smart Bug Management System"}
          </p>

          {showSignup ? (
            <>
              <form onSubmit={handleSignup}>

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) =>
                    setSignupName(e.target.value)
                  }
                  required
                />

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) =>
                    setSignupEmail(e.target.value)
                  }
                  required
                />

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={signupPassword}
                  onChange={(e) =>
                    setSignupPassword(e.target.value)
                  }
                  minLength={6}
                  required
                />

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={signupConfirmPassword}
                  onChange={(e) =>
                    setSignupConfirmPassword(
                      e.target.value
                    )
                  }
                  minLength={6}
                  required
                />

                <button
                  className="login-button"
                  type="submit"
                >
                  Create Account
                </button>

              </form>

              {message && (
                <p className="login-message">
                  {message}
                </p>
              )}

              <p
                style={{
                  textAlign: "center",
                  marginTop: "18px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() => {
                    setShowSignup(false);
                    setMessage("");
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#2563eb",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "14px",
                  }}
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleLogin}>

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  className="login-button"
                  type="submit"
                >
                  Login
                </button>

              </form>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "22px 0",
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >

                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "#e2e8f0",
                  }}
                />

                <span>OR</span>

                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "#e2e8f0",
                  }}
                />

              </div>

              <button
                type="button"
                className="google-login-button"
                onClick={handleGoogleLogin}
              >
                <svg
                  className="google-logo"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.58A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.08.31-1.58V7.89H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.11l3.24-2.53z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.43 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39z"
                  />
                </svg>

                <span>
                  Continue with Google
                </span>
              </button>

              {message && (
                <p className="login-message">
                  {message}
                </p>
              )}

              <p
                style={{
                  textAlign: "center",
                  marginTop: "18px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Don't have an account?{" "}

                <button
                  type="button"
                  onClick={() => {
                    setShowSignup(true);
                    setMessage("");
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#2563eb",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "14px",
                  }}
                >
                  Sign Up
                </button>
              </p>
            </>
          )}

          <p className="login-footer">
            BugFlow © 2026
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // SMART BUGFLOW FEATURE HELPERS
  // =====================================================

  const getIssueSearchText = (issue) =>
    [
      issue.title,
      issue.description,
      issue.category,
      issue.module,
      issue.defect_type,
      issue.severity,
      issue.priority,
      issue.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const getSearchTokens = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2);

  const getSemanticScore = (query, issue) => {
    const queryTokens = [...new Set(getSearchTokens(query))];
    const issueTokens = new Set(getSearchTokens(getIssueSearchText(issue)));

    if (!queryTokens.length) return 0;

    let matches = 0;
    queryTokens.forEach((token) => {
      if (issueTokens.has(token)) {
        matches += 1;
        return;
      }

      for (const issueToken of issueTokens) {
        if (issueToken.includes(token) || token.includes(issueToken)) {
          matches += 0.65;
          break;
        }
      }
    });

    return Math.round((matches / queryTokens.length) * 100);
  };

  const runSemanticDefectSearch = () => {
    const query = semanticSearch.trim();
    if (!query) {
      setSemanticResults([]);
      return;
    }

    const results = issues
      .map((issue) => ({ ...issue, smartScore: getSemanticScore(query, issue) }))
      .filter((issue) => issue.smartScore > 0)
      .sort((a, b) => b.smartScore - a.smartScore)
      .slice(0, 10);

    setSemanticResults(results);
  };

  const getResolutionSuggestions = (issueId) => {
    const target = issues.find((issue) => String(issue.id) === String(issueId));
    if (!target) {
      setResolutionSuggestions([]);
      return;
    }

    const targetText = getIssueSearchText(target);
    const resolved = issues
      .filter((issue) =>
        ["resolved", "closed", "done", "completed"].includes(
          String(issue.status || "").toLowerCase()
        )
      )
      .filter((issue) => issue.id !== target.id)
      .map((issue) => ({ ...issue, smartScore: getSemanticScore(targetText, issue) }))
      .filter((issue) => issue.smartScore > 10)
      .sort((a, b) => b.smartScore - a.smartScore)
      .slice(0, 5);

    setResolutionSuggestions(resolved);
  };

  const getKnowledgeBaseIssues = () => {
    const query = knowledgeSearch.trim();
    const resolved = issues.filter((issue) =>
      ["resolved", "closed", "done", "completed"].includes(
        String(issue.status || "").toLowerCase()
      )
    );

    if (!query) return resolved.slice(0, 10);

    return resolved
      .map((issue) => ({ ...issue, smartScore: getSemanticScore(query, issue) }))
      .filter((issue) => issue.smartScore > 0)
      .sort((a, b) => b.smartScore - a.smartScore)
      .slice(0, 10);
  };

  const getSprintHealth = (sprint) => {
    if (!sprint) return null;

    const sprintIssues = issues.filter((issue) =>
      sprintIssueIds.includes(issue.id)
    );
    const total = sprintIssues.length;
    const completed = sprintIssues.filter((issue) =>
      ["resolved", "closed", "done", "completed"].includes(
        String(issue.status || "").toLowerCase()
      )
    ).length;
    const highRisk = sprintIssues.filter((issue) =>
      ["high", "critical"].includes(
        String(issue.priority || "").toLowerCase()
      )
    ).length;
    const unassigned = sprintIssues.filter((issue) => !issue.assigned_to).length;

    if (!total) {
      return { score: 100, label: "No issues", total, completed, highRisk, unassigned };
    }

    const completionScore = (completed / total) * 60;
    const riskPenalty = (highRisk / total) * 25;
    const assignmentPenalty = (unassigned / total) * 15;
    const score = Math.max(0, Math.min(100, Math.round(completionScore + 40 - riskPenalty - assignmentPenalty)));

    let label = "At Risk";
    if (score >= 75) label = "Healthy";
    else if (score >= 50) label = "Needs Attention";

    return { score, label, total, completed, highRisk, unassigned };
  };

  const saveGithubRepository = () => {
    const value = githubRepoUrl.trim().replace(/\/$/, "");
    if (!value) {
      localStorage.removeItem("bugflow_github_repo");
      setGithubRepoUrl("");
      setIntegrationMessage("GitHub repository cleared.");
      return;
    }

    if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+/i.test(value)) {
      setIntegrationMessage("Enter a valid GitHub repository URL.");
      return;
    }

    localStorage.setItem("bugflow_github_repo", value);
    setGithubRepoUrl(value);
    setIntegrationMessage("GitHub repository saved.");
  };

  const getGithubIssueUrl = () => {
    if (!githubRepoUrl || !githubIssueNumber) return "";
    return `${githubRepoUrl}/issues/${githubIssueNumber}`;
  };

  const checkApiStatus = async () => {
    setApiStatus("Checking...");
    try {
      const response = await fetch(`${API_URL}/openapi.json`);
      setApiStatus(response.ok ? "Connected" : `HTTP ${response.status}`);
    } catch (error) {
      console.error("API status error:", error);
      setApiStatus("Offline");
    }
  };

  const copyIntegrationEndpoint = async (endpoint) => {
    try {
      await navigator.clipboard.writeText(`${API_URL}${endpoint}`);
      setIntegrationMessage(`Copied ${endpoint}`);
    } catch (error) {
      console.error("Copy endpoint error:", error);
      setIntegrationMessage("Could not copy endpoint.");
    }
  };

  // =====================================================
  // DASHBOARD COUNTS
  // =====================================================

  const totalProjects =
    projects.length;

  const totalIssues =
    issues.length;

  const openIssues =
    issues.filter(
      (issue) =>
        String(
          issue.status || ""
        ).toLowerCase() === "open"
    ).length;

  const inProgressIssues =
    issues.filter(
      (issue) =>
        String(
          issue.status || ""
        ).toLowerCase() ===
        "in progress"
    ).length;

  const resolvedIssues =
    issues.filter(
      (issue) =>
        String(
          issue.status || ""
        ).toLowerCase() ===
        "resolved"
    ).length;

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (

    <div className="dashboard">

      {/* =====================================================
          PROFILE MENU
      ===================================================== */}

      {/* =====================================================
          PROFILE PANEL
      ===================================================== */}

      {showProfilePanel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={closeAccountPanels}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxSizing: "border-box",
              boxShadow: "0 24px 60px rgba(15,23,42,0.20)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>👤 Profile</h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  View and update your BugFlow profile.
                </p>
              </div>

              <button
                type="button"
                className="small-button"
                onClick={closeAccountPanels}
              >
                ✕ Close
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                }}
              >
                👤
              </div>

              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "17px",
                  }}
                >
                  {profileName || "BugFlow User"}
                </strong>

                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {profileRole || "Developer"}
                </span>
              </div>
            </div>

            <div className="create-form">
              <label>Name</label>

              <input
                className="modal-input"
                type="text"
                value={profileName}
                onChange={(event) =>
                  setProfileName(event.target.value)
                }
                placeholder="Enter your name"
              />

              <label>Email</label>

              <input
                className="modal-input"
                type="email"
                value={profileEmail}
                readOnly
              />

              <label>Role</label>

              <input
                className="modal-input"
                type="text"
                value={profileRole || "Developer"}
                readOnly
              />

              <div
                className="modal-actions"
                style={{
                  justifyContent: "flex-start",
                  marginTop: "18px",
                }}
              >
                <button
                  type="button"
                  className="primary-button"
                  onClick={saveProfile}
                >
                  💾 Save Profile
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAccountPanels}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SETTINGS PANEL
      ===================================================== */}

      {showSettingsPanel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={closeAccountPanels}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxSizing: "border-box",
              boxShadow: "0 24px 60px rgba(15,23,42,0.20)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>⚙️ Settings</h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Manage your BugFlow account settings.
                </p>
              </div>

              <button
                type="button"
                className="small-button"
                onClick={closeAccountPanels}
              >
                ✕ Close
              </button>
            </div>

            <div
              style={{
                padding: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <strong>🔐 Account Security</strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                BugFlow uses your authenticated browser session to access
                protected project, issue, comment, and attachment features.
              </p>
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <strong>📊 Dashboard</strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                Use the existing refresh controls to load the latest
                projects, issues, developers, and activity.
              </p>
            </div>

            <div
              className="modal-actions"
              style={{
                justifyContent: "flex-start",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="primary-button"
                onClick={closeAccountPanels}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            🐞
          </div>

          <div>

            <h2>
              BugFlow
            </h2>

            <span>
              Bug Management
            </span>

          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "projects"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("projects")
            }
          >
            📁 Projects
          </button>

          <button
            className={`nav-item ${
              activePage === "issues"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("issues")
            }
          >
            🐞 Issues
          </button>

          <button
            className={`nav-item ${
              activePage === "sprints"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("sprints")
            }
          >
            🏃 Sprint Planning
          </button>

          <button
            className={`nav-item ${
              activePage === "smart-tools"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("smart-tools")
            }
          >
            🚀 Smart Tools
          </button>

          <button
            className={`nav-item ${
              activePage === "create"
                ? "active"
                : ""
            }`}
            onClick={openCreateIssue}
          >
            ➕ Create Issue
          </button>

          <button
            className={`nav-item ${
              activePage === "ai"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("ai")
            }
          >
            🤖 AI Assistant
          </button>

        </nav>

        <div
          style={{
            marginTop: "14px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#f1f5f9",
            color: "#475569",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          Role: {currentUserRole || "Developer"}
        </div>

        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#0f172a",
            color: "#cbd5e1",
            fontSize: "11px",
            lineHeight: 1.45,
          }}
        >
          {isAdmin && "Full system access"}
          {isManager && "Project & team management"}
          {isDeveloper && "Issue development & status updates"}
          {isTester && "Bug reporting & testing"}
        </div>

        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={logout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className="top-header">

          <div>

            <h1>
              {activePage === "dashboard" &&
                "Dashboard"}

              {activePage === "projects" &&
                "Projects"}

              {activePage === "issues" &&
                "Issues"}

              {activePage === "create" &&
                "Create Issue"}

              {activePage === "sprints" &&
                "Sprint Planning"}

              {activePage === "ai" &&
                "AI Assistant"}
            </h1>

            <p>
              {activePage === "dashboard" &&
                "Welcome back! Here's what's happening with your workspace."}

              {activePage === "projects" &&
                (canManageProjects
                  ? "Create, edit and manage projects in your workspace."
                  : "View projects and their issue context.")}

              {activePage === "issues" &&
                "Track, review and manage reported issues."}

              {activePage === "create" &&
                "Report a bug and create a professional issue report."}

              {activePage === "sprints" &&
                "Plan sprints, set goals, and assign issues to your team."}

              {activePage === "ai" &&
                "Use AI to structure and improve your bug reports."}
            </p>

          </div>

          <button
            type="button"
            onClick={openCreateIssue}
            style={{
              marginLeft: "auto",
              marginRight: "24px",
              padding: "12px 18px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 6px 16px rgba(37, 99, 235, 0.20)",
            }}
          >
            + Report New Issue
          </button>

          <div
            style={{
              position: "relative",
              marginRight: "14px",
            }}
          >
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowProfileMenu(false);
              }}
              style={{
                position: "relative",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#000000",
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              🔔

              {unreadNotificationCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    minWidth: "19px",
                    height: "19px",
                    padding: "0 5px",
                    borderRadius: "999px",
                    background: "#dc2626",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "800",
                    border: "2px solid #ffffff",
                    boxSizing: "border-box",
                  }}
                >
                  {unreadNotificationCount > 9
                    ? "9+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  right: 0,
                  width: "360px",
                  maxWidth: "calc(100vw - 32px)",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "14px",
                  boxShadow: "0 18px 45px rgba(0,0,0,0.16)",
                  zIndex: 1700,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        color: "#000000",
                        fontSize: "16px",
                      }}
                    >
                      🔔 Notifications
                    </strong>

                    <div
                      style={{
                        marginTop: "3px",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      {unreadNotificationCount} unread
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "#000000",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                <div
                  style={{
                    maxHeight: "330px",
                    overflowY: "auto",
                  }}
                >
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "28px 18px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <div style={{ fontSize: "28px" }}>🔕</div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "8px",
                          color: "#000000",
                        }}
                      >
                        No notifications
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          fontSize: "12px",
                        }}
                      >
                        You're all caught up.
                      </span>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isRead =
                        readNotificationIds.includes(
                          notification.id
                        );

                      return (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() =>
                            markNotificationRead(
                              notification.id
                            )
                          }
                          style={{
                            width: "100%",
                            display: "flex",
                            gap: "11px",
                            alignItems: "flex-start",
                            padding: "13px 16px",
                            border: 0,
                            borderBottom:
                              "1px solid #f1f5f9",
                            background: isRead
                              ? "#ffffff"
                              : "#f8fafc",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "19px",
                              flexShrink: 0,
                            }}
                          >
                            {notification.icon}
                          </span>

                          <span style={{ minWidth: 0 }}>
                            <strong
                              style={{
                                display: "block",
                                color: "#000000",
                                fontSize: "13px",
                              }}
                            >
                              {notification.title}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                marginTop: "3px",
                                color: "#334155",
                                fontSize: "12px",
                                lineHeight: "1.4",
                              }}
                            >
                              {notification.message}
                            </span>

                            <span
                              style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#94a3b8",
                                fontSize: "10px",
                              }}
                            >
                              {notification.time}
                            </span>
                          </span>

                          {!isRead && (
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#2563eb",
                                marginLeft: "auto",
                                marginTop: "5px",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div
                    style={{
                      padding: "10px 16px",
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    <button
                      type="button"
                      onClick={clearNotifications}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "#000000",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Clear notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              position: "relative",
            }}
          >
            <button
              type="button"
              className="user-info"
              onClick={() => {
                if (!showProfileMenu) {
                  loadProfileData();
                }

                setShowProfileMenu((current) => !current);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div className="avatar">
                {email
                  ? email.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <strong>
                  {profileName || "BugFlow User"}
                </strong>

                <span>
                  {profileRole || "Developer"}
                </span>
              </div>

              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                ▾
              </span>
            </button>

            {showProfileMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "58px",
                  right: 0,
                  width: "190px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "7px",
                  boxShadow:
                    "0 14px 35px rgba(15,23,42,0.14)",
                  zIndex: 1600,
                }}
              >
                <button
                  type="button"
                  className="nav-item"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    background: "transparent",
                    color: "#000000",
                    fontWeight: "600",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                  onClick={openProfilePanel}
                >
                  👤 Profile
                </button>

                <button
                  type="button"
                  className="nav-item"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    background: "transparent",
                    color: "#000000",
                    fontWeight: "600",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                  onClick={openSettingsPanel}
                >
                  ⚙️ Settings
                </button>

                <button
                  type="button"
                  className="nav-item"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    background: "transparent",
                    color: "#000000",
                    fontWeight: "600",
                    fontSize: "15px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    closeAccountPanels();
                    logout();
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

        </header>

        {/* =================================================
            DASHBOARD PAGE
        ================================================= */}

        {activePage === "sprints" && (
          <section style={{ padding: "28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "22px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>🏃 Sprint Planning</h2>
                <p style={{ margin: "7px 0 0", color: "#64748b" }}>
                  Create sprints and assign existing issues to them.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={openCreateSprint}
              >
                ➕ New Sprint
              </button>
            </div>

            {showSprintForm && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "22px",
                  marginBottom: "22px",
                  boxShadow: "0 8px 25px rgba(15,23,42,0.06)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {editingSprintId ? "Edit Sprint" : "Create Sprint"}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label>Project</label>
                    <select
                      className="modal-input"
                      value={selectedProjectId}
                      onChange={(event) => setSelectedProjectId(event.target.value)}
                    >
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Sprint Name</label>
                    <input
                      className="modal-input"
                      value={sprintName}
                      onChange={(event) => setSprintName(event.target.value)}
                      placeholder="Sprint 1"
                    />
                  </div>

                  <div>
                    <label>Start Date</label>
                    <input
                      className="modal-input"
                      type="date"
                      value={sprintStartDate}
                      onChange={(event) => setSprintStartDate(event.target.value)}
                    />
                  </div>

                  <div>
                    <label>End Date</label>
                    <input
                      className="modal-input"
                      type="date"
                      value={sprintEndDate}
                      onChange={(event) => setSprintEndDate(event.target.value)}
                    />
                  </div>

                  <div>
                    <label>Status</label>
                    <select
                      className="modal-input"
                      value={sprintStatus}
                      onChange={(event) => setSprintStatus(event.target.value)}
                    >
                      <option value="Planned">Planned</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label>Sprint Goal</label>
                  <textarea
                    className="modal-input"
                    value={sprintGoal}
                    onChange={(event) => setSprintGoal(event.target.value)}
                    placeholder="What should this sprint achieve?"
                    rows={3}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="primary-button"
                    onClick={saveSprint}
                    disabled={sprintSaving}
                  >
                    {sprintSaving ? "Saving..." : "💾 Save Sprint"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetSprintForm}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sprintLoading ? (
              <div className="empty-state">Loading sprints...</div>
            ) : sprints.length === 0 ? (
              <div className="empty-state">
                <h3>No sprints yet</h3>
                <p>Create your first sprint to start planning work.</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {sprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      style={{
                        background: "#ffffff",
                        border: String(selectedSprintId) === String(sprint.id)
                          ? "2px solid #2563eb"
                          : "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "18px",
                        boxShadow: "0 6px 20px rgba(15,23,42,0.05)",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSprintSelection(String(sprint.id))}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0 }}>{sprint.name}</h3>
                          <p style={{ margin: "7px 0", color: "#64748b", fontSize: "13px" }}>
                            {getSprintProjectName(sprint.project_id)}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "999px",
                            background: sprint.status === "Completed" ? "#dcfce7" : sprint.status === "Active" ? "#dbeafe" : "#f1f5f9",
                            color: sprint.status === "Completed" ? "#166534" : sprint.status === "Active" ? "#1d4ed8" : "#475569",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {sprint.status}
                        </span>
                      </div>

                      <p style={{ color: "#475569", minHeight: "42px" }}>
                        {sprint.goal || "No sprint goal provided."}
                      </p>

                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        📅 {sprint.start_date} → {sprint.end_date}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "16px",
                        }}
                      >
                        <button
                          type="button"
                          className="small-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditSprint(sprint);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="small-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteSprint(sprint);
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSprintId && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "22px",
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>📋 Sprint Issues</h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: "18px",
                      }}
                    >
                      <select
                        className="modal-input"
                        style={{ flex: "1 1 300px" }}
                        value={sprintAssignIssueId}
                        onChange={(event) => setSprintAssignIssueId(event.target.value)}
                      >
                        <option value="">Select an issue to assign</option>
                        {issues
                          .filter((issue) => !sprintIssueIds.includes(issue.id))
                          .map((issue) => (
                            <option key={issue.id} value={issue.id}>
                              #{issue.id} — {issue.title}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        className="primary-button"
                        onClick={assignIssueToSprint}
                      >
                        ➕ Assign Issue
                      </button>
                    </div>

                    {getSprintIssues().length === 0 ? (
                      <div className="empty-state">
                        No issues assigned to this sprint yet.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "10px" }}>
                        {getSprintIssues().map((issue) => (
                          <div
                            key={issue.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              padding: "14px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <strong>#{issue.id} — {issue.title}</strong>
                              <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                                {issue.status || "Open"} · {issue.priority || "Medium"}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="small-button"
                              onClick={() => removeIssueFromSprint(issue.id)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activePage === "dashboard" && (
          <>
            <section className="stats">

              <div className="stat-card">

                <div>
                  <span>
                    Total Projects
                  </span>

                  <strong>
                    {totalProjects}
                  </strong>
                </div>

                <div className="stat-icon">
                  📁
                </div>

              </div>

              <div className="stat-card">

                <div>
                  <span>
                    Total Issues
                  </span>

                  <strong>
                    {totalIssues}
                  </strong>
                </div>

                <div className="stat-icon">
                  🐞
                </div>

              </div>

              <div className="stat-card">

                <div>
                  <span>
                    Open Issues
                  </span>

                  <strong>
                    {openIssues}
                  </strong>
                </div>

                <div className="stat-icon">
                  🟡
                </div>

              </div>

              <div className="stat-card">

                <div>
                  <span>
                    In Progress
                  </span>

                  <strong>
                    {inProgressIssues}
                  </strong>
                </div>

                <div className="stat-icon">
                  🔵
                </div>

              </div>

              <div className="stat-card">

                <div>
                  <span>
                    Resolved
                  </span>

                  <strong>
                    {resolvedIssues}
                  </strong>
                </div>

                <div className="stat-icon">
                  🟢
                </div>

              </div>


              <div className="stat-card">
                <div>
                  <span>High / Critical</span>
                  <strong>
                    {issues.filter(
                      (issue) =>
                        String(issue.priority || "").toLowerCase() === "high" ||
                        String(issue.priority || "").toLowerCase() === "critical"
                    ).length}
                  </strong>
                </div>

                <div className="stat-icon">
                  🚨
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <span>Unassigned</span>
                  <strong>
                    {issues.filter(
                      (issue) =>
                        !issue.assigned_to &&
                        !issue.developer &&
                        !issue.developer_name
                    ).length}
                  </strong>
                </div>

                <div className="stat-icon">
                  👤
                </div>
              </div>
            </section>

            {/* =================================================
                DASHBOARD ANALYTICS
            ================================================= */}

            {(() => {
              const normalize = (value) => String(value ?? "").trim();

              const statusItems = [
                { label: "Open", value: issues.filter((issue) => normalize(issue.status).toLowerCase() === "open").length },
                { label: "In Progress", value: issues.filter((issue) => normalize(issue.status).toLowerCase() === "in progress").length },
                { label: "Resolved", value: issues.filter((issue) => normalize(issue.status).toLowerCase() === "resolved").length },
                { label: "Closed", value: issues.filter((issue) => normalize(issue.status).toLowerCase() === "closed").length },
              ];

              const priorityItems = [
                { label: "Critical", value: issues.filter((issue) => normalize(issue.priority).toLowerCase() === "critical").length },
                { label: "High", value: issues.filter((issue) => normalize(issue.priority).toLowerCase() === "high").length },
                { label: "Medium", value: issues.filter((issue) => normalize(issue.priority).toLowerCase() === "medium").length },
                { label: "Low", value: issues.filter((issue) => normalize(issue.priority).toLowerCase() === "low").length },
              ];

              const severityItems = [
                { label: "Critical", value: issues.filter((issue) => normalize(issue.severity).toLowerCase() === "critical").length },
                { label: "High", value: issues.filter((issue) => normalize(issue.severity).toLowerCase() === "high").length },
                { label: "Medium", value: issues.filter((issue) => normalize(issue.severity).toLowerCase() === "medium").length },
                { label: "Low", value: issues.filter((issue) => normalize(issue.severity).toLowerCase() === "low").length },
              ];

              const makeDistribution = (field) => {
                const counts = {};
                issues.forEach((issue) => {
                  const value = normalize(issue[field]) || "Not specified";
                  counts[value] = (counts[value] || 0) + 1;
                });
                return Object.entries(counts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([label, value]) => ({ label, value }));
              };

              const categoryItems = makeDistribution("category");
              const moduleItems = makeDistribution("module");

             const developerItems = developerWorkload
  .map((developer) => ({
    label: developer.name || `Developer ${developer.user_id}`,
    value: developer.total || 0,
  }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 8);

              const assignedCount = issues.filter((issue) => issue.assigned_to).length;
              const resolutionRate = totalIssues
                ? Math.round((resolvedIssues / totalIssues) * 100)
                : 0;
              const maxDeveloper = Math.max(1, ...developerItems.map((item) => item.value));
              const maxCategory = Math.max(1, ...categoryItems.map((item) => item.value));
              const maxModule = Math.max(1, ...moduleItems.map((item) => item.value));

              const donutGradient = (items) => {
                const colors = ["#2563eb", "#f59e0b", "#22c55e", "#94a3b8", "#ef4444", "#8b5cf6"];
                const total = items.reduce((sum, item) => sum + item.value, 0);
                if (!total) return "#e2e8f0 0 100%";
                let current = 0;
                const stops = items.map((item, index) => {
                  const next = current + (item.value / total) * 100;
                  const stop = `${colors[index % colors.length]} ${current}% ${next}%`;
                  current = next;
                  return stop;
                });
                return stops.join(", ");
              };

              const ChartCard = ({ title, subtitle, children }) => (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "22px",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>{title}</h3>
                  {subtitle && (
                    <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>{subtitle}</p>
                  )}
                  <div style={{ marginTop: "20px" }}>{children}</div>
                </div>
              );

              const Legend = ({ items }) => {
                const colors = ["#2563eb", "#f59e0b", "#22c55e", "#94a3b8", "#ef4444", "#8b5cf6"];
                return (
                  <div style={{ display: "grid", gap: "9px" }}>
                    {items.map((item, index) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          fontSize: "13px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: colors[index % colors.length],
                              display: "inline-block",
                            }}
                          />
                          {item.label}
                        </span>
                        <strong style={{ color: "#0f172a" }}>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                );
              };

              const BarChart = ({ items, maxValue, emptyText = "No data available" }) => (
                items.length === 0 ? (
                  <p className="empty">{emptyText}</p>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {items.map((item, index) => {
                      const percentage = Math.round((item.value / maxValue) * 100);
                      return (
                        <div key={`${item.label}-${index}`}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", gap: "12px" }}>
                            <span style={{ fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.label}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "13px", flexShrink: 0 }}>{item.value}</span>
                          </div>
                          <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${percentage}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                                borderRadius: "999px",
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              );

              return (
                <section
                  className="panel"
                  style={{
                    marginTop: "22px",
                    marginBottom: "22px",
                  }}
                >
                  <div className="panel-header">
                    <div>
                      <h2>📊 Dashboard Analytics</h2>
                      <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                        A visual overview of bugs, priorities, severity and team workload.
                      </p>
                    </div>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      {totalIssues} total issues
                    </span>
                  </div>

                  {/* KPI CARDS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                      gap: "14px",
                      marginTop: "20px",
                    }}
                  >
                    {[
                      ["Open", openIssues, "🟡"],
                      ["In Progress", inProgressIssues, "🔵"],
                      ["Resolved", resolvedIssues, "🟢"],
                      ["High / Critical", issues.filter((issue) => ["high", "critical"].includes(normalize(issue.priority).toLowerCase())).length, "🚨"],
                      ["Unassigned", issues.filter((issue) => !issue.assigned_to).length, "👤"],
                      ["Resolution Rate", `${resolutionRate}%`, "📈"],
                    ].map(([label, value, icon]) => (
                      <div
                        key={label}
                        style={{
                          padding: "16px",
                          borderRadius: "14px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontSize: "20px" }}>{icon}</div>
                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: "7px" }}>{label}</div>
                        <strong style={{ display: "block", marginTop: "4px", fontSize: "24px", color: "#0f172a" }}>{value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* DONUT / PIE CHARTS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "18px",
                      marginTop: "18px",
                    }}
                  >
                    <ChartCard title="Issue Status" subtitle="Current state of all reported issues.">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
                        <div
                          style={{
                            width: "170px",
                            height: "170px",
                            borderRadius: "50%",
                            background: `conic-gradient(${donutGradient(statusItems)})`,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "104px",
                              height: "104px",
                              borderRadius: "50%",
                              background: "#fff",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(15,23,42,.08)",
                            }}
                          >
                            <strong style={{ fontSize: "27px", color: "#0f172a" }}>{totalIssues}</strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Issues</span>
                          </div>
                        </div>
                        <Legend items={statusItems} />
                      </div>
                    </ChartCard>

                    <ChartCard title="Priority Distribution" subtitle="Where the highest-risk work is concentrated.">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
                        <div
                          style={{
                            width: "170px",
                            height: "170px",
                            borderRadius: "50%",
                            background: `conic-gradient(${donutGradient(priorityItems)})`,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ width: "104px", height: "104px", borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <strong style={{ fontSize: "27px", color: "#0f172a" }}>{totalIssues}</strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Total</span>
                          </div>
                        </div>
                        <Legend items={priorityItems} />
                      </div>
                    </ChartCard>
                  </div>

                  {/* BAR CHARTS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "18px",
                      marginTop: "18px",
                    }}
                  >
                    <ChartCard title="Issues by Category" subtitle="Top defect categories in the workspace.">
                      <BarChart items={categoryItems} maxValue={maxCategory} emptyText="No category data available yet." />
                    </ChartCard>

                    <ChartCard title="Issues by Module" subtitle="Modules receiving the most defect reports.">
                      <BarChart items={moduleItems} maxValue={maxModule} emptyText="No module data available yet." />
                    </ChartCard>

                    <ChartCard title="Developer Workload" subtitle="Assigned issues by developer.">
                      <BarChart items={developerItems} maxValue={maxDeveloper} emptyText="No developers available." />
                    </ChartCard>

                    <ChartCard title="Severity Distribution" subtitle="Defect severity across the workspace.">
                      <BarChart
                        items={severityItems}
                        maxValue={Math.max(1, ...severityItems.map((item) => item.value))}
                        emptyText="Severity data will appear when issues are classified."
                      />
                    </ChartCard>
                  </div>

                  {/* TEAM / WORKSPACE INSIGHTS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "14px",
                      marginTop: "18px",
                    }}
                  >
                    <div style={{ padding: "16px", borderRadius: "14px", background: "#eff6ff", border: "1px solid #dbeafe" }}>
                      <strong style={{ color: "#1d4ed8" }}>📌 Assignment Coverage</strong>
                      <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px", color: "#0f172a" }}>
                        {totalIssues ? Math.round((assignedCount / totalIssues) * 100) : 0}%
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{assignedCount} of {totalIssues} issues assigned</span>
                    </div>

                    <div style={{ padding: "16px", borderRadius: "14px", background: "#fff7ed", border: "1px solid #fed7aa" }}>
                      <strong style={{ color: "#c2410c" }}>🚨 Attention Needed</strong>
                      <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px", color: "#0f172a" }}>
                        {issues.filter((issue) => ["high", "critical"].includes(normalize(issue.priority).toLowerCase())).length}
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>High or critical priority issues</span>
                    </div>

                    <div style={{ padding: "16px", borderRadius: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                      <strong style={{ color: "#15803d" }}>✅ Resolved</strong>
                      <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px", color: "#0f172a" }}>
                        {resolvedIssues}
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Issues successfully resolved</span>
                    </div>

                    <div style={{ padding: "16px", borderRadius: "14px", background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                      <strong style={{ color: "#7e22ce" }}>🏃 Sprint Planning</strong>
                      <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px", color: "#0f172a" }}>
                        {sprints.length}
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Sprints currently available</span>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <section
              className="panel"
              style={{
                marginBottom: "16px",
              }}
            >
              <div className="panel-header">
                <div>
                  <h2>Recent Activity</h2>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#64748b",
                    }}
                  >
                    Latest changes across your issues.
                  </p>
                </div>

                <button
                  type="button"
                  className="small-button"
                  onClick={() => loadRecentDashboardActivity(issues)}
                  disabled={recentActivityLoading}
                >
                  {recentActivityLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {recentActivityLoading ? (
                <p className="empty">Loading recent activity...</p>
              ) : recentActivity.length === 0 ? (
                <p className="empty">No recent activity found.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  {recentActivity.slice(0, 6).map((activity, index) => {
                    const action = activity.action || "Activity";
                    const icon =
                      action === "Issue Created"
                        ? "📝"
                        : action === "Status Changed"
                          ? "🔄"
                          : action === "Developer Assigned"
                            ? "👨‍💻"
                            : action === "Comment Added"
                              ? "💬"
                              : action === "Attachment Uploaded"
                                ? "📎"
                                : action === "Attachment Deleted"
                                  ? "🗑️"
                                  : "📌";

                    return (
                      <div
                        key={`${activity.id || "activity"}-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          minWidth: 0,
                          padding: "9px 10px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "9px",
                          background: "#f8fafc",
                          minHeight: "52px",
                        }}
                      >
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            minWidth: "30px",
                            borderRadius: "50%",
                            background: "#dbeafe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                          }}
                        >
                          {icon}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}
                          >
                            <strong
                              style={{
                                color: "#0f172a",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {action}
                            </strong>

                            {activity.created_at && (
                              <small
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "10px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {new Date(activity.created_at).toLocaleDateString()}
                              </small>
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: "2px",
                              color: "#2563eb",
                              fontSize: "11px",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {activity.issue_title || "Issue"}
                          </div>

                          {activity.details && (
                            <div
                              style={{
                                marginTop: "1px",
                                color: "#64748b",
                                fontSize: "10px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {activity.details}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="dashboard-grid">

              <div className="panel">

                <div className="panel-header">

                  <h2>
                    Recent Issues
                  </h2>

                  <button
                    className="small-button"
                    onClick={
                      loadDashboardData
                    }
                  >
                    Refresh
                  </button>

                </div>

                {loading ? (
                  <p className="empty">
                    Loading issues...
                  </p>
                ) : issues.length === 0 ? (
                  <p className="empty">
                    No issues found.
                  </p>
                ) : (
                  <div className="issue-list">

                    {issues
                      .slice(0, 5)
                      .map((issue) => (

                        <div
                          className="issue-row"
                          key={issue.id}
                        >

                          <div className="issue-content">

                            <strong>
                              {issue.title}
                            </strong>

                            <p>
                              {issue.description}
                            </p>

                          </div>

                          <div className="issue-meta">

                            <span
                              className={`priority ${String(
                                issue.priority ||
                                  "medium"
                              ).toLowerCase()}`}
                            >
                              {issue.priority ||
                                "Medium"}
                            </span>

                            <span>
                              {issue.status ||
                                "Open"}
                            </span>

                          </div>

                        </div>

                      ))}

                  </div>
                )}

                {issues.length > 5 && (
                  <button
                    className="small-button"
                    onClick={() =>
                      navigateTo("issues")
                    }
                    style={{
                      marginTop: "14px",
                    }}
                  >
                    View all issues →
                  </button>
                )}

              </div>

              <div className="panel">

                <div className="panel-header">

                  <h2>
                    Your Projects
                  </h2>

                  <span>
                    {projects.length}
                  </span>

                </div>

                {projects.length === 0 ? (
                  <p className="empty">
                    No projects found.
                  </p>
                ) : (
                  <div className="project-list">

                    {projects
                      .slice(0, 4)
                      .map((project) => (

                        <div
                          className="project-card"
                          key={project.id}
                        >

                          <div className="project-card-icon">
                            📁
                          </div>

                          <div>

                            <h3>
                              {project.project_name}
                            </h3>

                            <p>
                              {project.description}
                            </p>

                            <small>
                              Project ID:{" "}
                              {project.id}
                            </small>

                          </div>

                        </div>

                      ))}

                  </div>
                )}

                {projects.length > 4 && (
                  <button
                    className="small-button"
                    onClick={() =>
                      navigateTo("projects")
                    }
                    style={{
                      marginTop: "14px",
                    }}
                  >
                    View all projects →
                  </button>
                )}

              </div>

            </section>

            <section className="ai-card">

              <div className="ai-icon">
                🤖
              </div>

              <div className="ai-content">

                <h2>
                  AI Bug Report Assistant
                </h2>

                <p>
                  Describe your bug in simple words
                  and let AI help generate a detailed
                  professional bug report.
                </p>

              </div>

              <button
                onClick={() =>
                  navigateTo("ai")
                }
              >
                Open AI Assistant
              </button>

            </section>
          </>
        )}

        {/* =================================================
            PROJECTS PAGE
        ================================================= */}

        {activePage === "projects" && (
          <section className="panel page-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Projects
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                  }}
                >
                  {projects.length} project
                  {projects.length === 1
                    ? ""
                    : "s"} in your workspace
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {canManageProjects && (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={openCreateProject}
                  >
                    + Create Project
                  </button>
                )}

                <button
                  className="small-button"
                  type="button"
                  onClick={loadDashboardData}
                >
                  Refresh
                </button>
              </div>

            </div>

            {loading ? (
              <p className="empty">
                Loading projects...
              </p>
            ) : projects.length === 0 ? (
              <div className="empty-state-card">

                <div
                  style={{
                    fontSize: "42px",
                  }}
                >
                  📁
                </div>

                <h3>
                  No projects yet
                </h3>

                <p>
                  Create a project from your
                  project management workflow
                  to see it here.
                </p>

              </div>
            ) : (
              <div className="project-grid">

                {projects.map((project) => (

                  <div
                    className="project-card"
                    key={project.id}
                  >

                    <div className="project-card-icon">
                      📁
                    </div>

                    <div>

                      <h3>
                        {project.project_name}
                      </h3>

                      <p>
                        {project.description ||
                          "No description provided."}
                      </p>

                      <small>
                        Project ID:{" "}
                        {project.id}
                      </small>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>
        )}

        {/* =================================================
            ISSUES PAGE
        ================================================= */}

        {activePage === "issues" && (
          <section className="panel page-panel">

            <div className="panel-header">

              <div>

                <h2>
                  All Issues
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                  }}
                >
                  {issues.length} issue
                  {issues.length === 1
                    ? ""
                    : "s"} reported in your workspace
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                <button
                  className="small-button"
                  onClick={
                    loadDashboardData
                  }
                >
                  Refresh
                </button>

                <button
                  className="primary-button"
                  onClick={
                    openCreateIssue
                  }
                >
                  + Create Issue
                </button>

              </div>

            </div>

            {loading ? (
              <p className="empty">
                Loading issues...
              </p>
            ) : issues.length === 0 ? (

              <div className="empty-state-card">

                <div
                  style={{
                    fontSize: "42px",
                  }}
                >
                  🐞
                </div>

                <h3>
                  No issues yet
                </h3>

                <p>
                  Report your first bug
                  to start tracking it.
                </p>

                <button
                  className="primary-button"
                  onClick={
                    openCreateIssue
                  }
                >
                  Create First Issue
                </button>

              </div>

            ) : (

              <>
              {/* ISSUE SEARCH & FILTERS */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <input
                  type="text"
                  value={issueSearch}
                  onChange={(e) =>
                    setIssueSearch(e.target.value)
                  }
                  placeholder="🔍 Search issues..."
                  style={{
                    flex: "1 1 280px",
                    minWidth: "220px",
                    padding: "11px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />

                <select
                  value={issuePriorityFilter}
                  onChange={(e) =>
                    setIssuePriorityFilter(e.target.value)
                  }
                  className="issue-status-select"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <select
                  value={issueSort}
                  onChange={(e) =>
                    setIssueSort(e.target.value)
                  }
                  className="issue-status-select"
                  title="Sort issues"
                >
                  <option value="Newest">Newest</option>
                  <option value="Priority">Priority</option>
                  <option value="Status">Status</option>
                  <option value="Title A-Z">Title A-Z</option>
                </select>

                <select
                  value={issueStatusFilter}
                  onChange={(e) =>
                    setIssueStatusFilter(e.target.value)
                  }
                  className="issue-status-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                {(issueSearch ||
                  issuePriorityFilter !== "All" ||
                  issueStatusFilter !== "All" ||
                  issueSort !== "Newest") && (
                  <button
                    type="button"
                    className="small-button"
                    onClick={() => {
                      setIssueSearch("");
                      setIssuePriorityFilter("All");
                      setIssueStatusFilter("All");
                      setIssueSort("Newest");
                    }}
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  type="button"
                  className="small-button"
                  onClick={exportIssuesCSV}
                  title="Download all issues as CSV"
                >
                  ⬇ Export CSV
                </button>
              </div>

              {filteredIssues.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#64748b",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "12px",
                    marginBottom: "18px",
                  }}
                >
                  No issues match your search or filters.
                </div>
              ) : null}

              <div className="full-issue-list">

                {filteredIssues.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "14px", padding: "10px 0" }}>
                      <span style={{ color: "#64748b", fontSize: "13px" }}>
                        Showing {(safeIssuePage - 1) * issuesPerPage + 1}-{Math.min(safeIssuePage * issuesPerPage, filteredIssues.length)} of {filteredIssues.length} issues
                      </span>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button type="button" className="small-button" disabled={safeIssuePage === 1} onClick={() => setIssuePage((page) => Math.max(1, page - 1))}>← Previous</button>
                        <strong style={{ minWidth: "70px", textAlign: "center" }}>Page {safeIssuePage} / {totalIssuePages}</strong>
                        <button type="button" className="small-button" disabled={safeIssuePage === totalIssuePages} onClick={() => setIssuePage((page) => Math.min(totalIssuePages, page + 1))}>Next →</button>
                      </div>
                    </div>
                  )}

                  {paginatedIssues.map((issue) => (

                  <div
                    className="issue-row"
                    key={issue.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >

                    <div
                      className="issue-main-row"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "24px",
                        width: "100%",
                        boxSizing: "border-box",
                        flexWrap: "wrap",
                      }}
                    >

                    <div className="issue-content">

                      <strong>
                        {issue.title}
                      </strong>

                      <p>
                        {issue.description}
                      </p>

                      <small>
                        Issue #{issue.id}

                        {issue.project_id
                          ? ` • Project #${issue.project_id}`
                          : ""}
                      </small>

                    </div>

                    <div className="issue-meta">

                      {/* PRIORITY */}

                      <select
                        className={`issue-status-select priority-select ${String(
                          issue.priority ||
                            "medium"
                        ).toLowerCase()}`}
                        value={
                          issue.priority ||
                          "Medium"
                        }
                        onChange={(e) =>
                          updateIssuePriority(
                            issue.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Low">
                          Low
                        </option>

                        <option value="Medium">
                          Medium
                        </option>

                        <option value="High">
                          High
                        </option>
                      </select>

                      {/* MILESTONE 2 STATUS */}

                      <select
                        className="issue-status-select"
                        value={
                          issue.status ||
                          "Open"
                        }
                        onChange={(e) =>
                          updateIssueStatus(
                            issue.id,
                            e.target.value
                          )
                        }
                        disabled={!canChangeIssueStatus}
                        title={
                          canChangeIssueStatus
                            ? "Change issue status"
                            : "Tester users cannot change issue status"
                        }
                      >

                        <option value="Open">
                          Open
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="In Review">
                          In Review
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>

                        <option value="Closed">
                          Closed
                        </option>

                      </select>

                      {/* DEVELOPER ASSIGNMENT */}

                      <select
                        className="issue-status-select"
                        value={issue.assigned_to ?? ""}
                        onChange={(e) =>
                          updateIssueAssignment(
                            issue.id,
                            e.target.value
                          )
                        }
                        disabled={!canAssignIssues}
                        title={
                          canAssignIssues
                            ? "Assign developer"
                            : "Only Manager or Admin can assign developers"
                        }
                      >
                        <option value="">
                          Unassigned
                        </option>

                        {developers.map(
                          (developer) => (
                            <option
                              key={developer.id}
                              value={developer.id}
                            >
                              {developer.name}
                            </option>
                          )
                        )}
                      </select>



                    {/* ISSUE ACTION BUTTONS */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginLeft: "auto",
                        flexShrink: 0,
                      }}
                    >
                      {canEditIssues && (
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => openEditIssue(issue)}
                        >
                          ✏️ Edit Issue
                        </button>
                      )}

                      {canDeleteIssues && (
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => deleteIssue(issue.id)}
                        >
                          🗑️ Delete
                        </button>
                      )}

                      <button
                        type="button"
                        className="small-button"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        👁 View Details
                      </button>

                      <button
                        type="button"
                        className="small-button"
                        onClick={() => copyIssueId(issue.id)}
                      >
                        📋 Copy ID
                      </button>

                      <button
                        type="button"
                        className="small-button"
                        onClick={() => toggleIssueActivity(issue.id)}
                      >
                        {activityLoading[issue.id]
                          ? "Loading activity..."
                          : expandedActivities[issue.id]
                            ? "▴ Hide Activity"
                            : "▾ View Activity"}
                      </button>
                      <button
                      type="button"
                      className="small-button"
                      onClick={() => toggleIssueAttachments(issue.id)}
                    >
                      {attachmentLoading[issue.id]
                        ? "Loading files..."
                        : expandedAttachments[issue.id]
                          ? "▴ Hide Files"
                          : "📎 Attachments"}
                    </button>

                    <button
                      type="button"
                      className="small-button"
                      onClick={() => toggleIssueComments(issue.id)}
                    >
                      {commentLoading[issue.id]
                        ? "Loading comments..."
                        : expandedComments[issue.id]
                          ? "▴ Hide Comments"
                          : "💬 Comments"}
                    </button>
                                        </div>
                    </div>

                    </div>

                    {/* =====================================================
                        ISSUE ATTACHMENTS CONTENT
                    ===================================================== */}

                    {expandedAttachments[issue.id] && (
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          marginTop: "16px",
                          borderTop: "1px solid #e2e8f0",
                          paddingTop: "14px",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                        id={`attachment-input-${issue.id}`}
                        type="file"
                            onChange={(e) =>
                              setSelectedAttachmentFiles((current) => ({
                                ...current,
                                [issue.id]:
                                  e.target.files?.[0] || null,
                              }))
                            }
                          />

                          <button
                            type="button"
                            className="small-button"
                            onClick={() =>
                              uploadIssueAttachment(issue.id)
                            }
                            disabled={attachmentLoading[issue.id]}
                          >
                            {attachmentLoading[issue.id]
                              ? "Uploading..."
                              : "⬆️ Upload"}
                          </button>

                          <button
                            type="button"
                            className="small-button"
                            onClick={() => {
                              setSelectedAttachmentFiles((current) => ({
                                ...current,
                                [issue.id]: null,
                              }));

                              const input = document.getElementById(
                                `attachment-input-${issue.id}`
                              );

                              if (input) {
                                input.value = "";
                              }

                              setExpandedAttachments((current) => ({
                                ...current,
                                [issue.id]: false,
                              }));
                            }}
                            disabled={attachmentLoading[issue.id]}
                          >
                            ✕ Cancel
                          </button>
                        </div>

                        <div
                          style={{
                            marginTop: "14px",
                          }}
                        >
                          {(issueAttachments[issue.id] || []).length === 0 ? (
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: "13px",
                              }}
                            >
                              No attachments yet.
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  marginBottom: "10px",
                                  color: "#64748b",
                                  fontSize: "13px",
                                }}
                              >
                                {issueAttachments[issue.id].length} attachment(s)
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "10px",
                                }}
                              >
                                {issueAttachments[issue.id].map((attachment) => {
                                  const fileName =
                                    attachment.original_filename ||
                                    attachment.filename ||
                                    attachment.file_name ||
                                    attachment.name ||
                                    `Attachment #${attachment.id}`;

                                  return (
                                    <div
                                      key={attachment.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "12px",
                                        padding: "12px 14px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "10px",
                                        background: "#ffffff",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          minWidth: 0,
                                        }}
                                      >
                                        <span style={{ fontSize: "20px" }}>📄</span>
                                        <span
                                          style={{
                                            color: "#1e293b",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            wordBreak: "break-word",
                                          }}
                                        >
                                          {fileName}
                                        </span>
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "8px",
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <button
                                          type="button"
                                          className="small-button"
                                          onClick={() =>
                                            downloadIssueAttachment(attachment)
                                          }
                                        >
                                          ⬇️ Download
                                        </button>

                                        <button
                                          type="button"
                                          className="small-button"
                                          onClick={() =>
                                            deleteIssueAttachment(issue.id, attachment)
                                          }
                                          disabled={attachmentLoading[issue.id]}
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* =====================================================
                        ISSUE COMMENTS CONTENT
                    ===================================================== */}

                    {expandedComments[issue.id] && (
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          marginTop: "16px",
                          borderTop: "1px solid #e2e8f0",
                          paddingTop: "14px",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginBottom: "12px",
                          }}
                        >
                          <strong
                            style={{
                              color: "#0f172a",
                              fontSize: "15px",
                            }}
                          >
                            💬 Comments
                          </strong>

                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "13px",
                            }}
                          >
                            {(issueComments[issue.id] || []).length} comment(s)
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            marginBottom: "14px",
                          }}
                        >
                          {(issueComments[issue.id] || []).length === 0 ? (
                            <div
                              style={{
                                padding: "12px 14px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                color: "#64748b",
                                fontSize: "13px",
                              }}
                            >
                              No comments yet.
                            </div>
                          ) : (
                            (issueComments[issue.id] || []).map((comment) => {
                              const commenterName =
                                comment.user_name ||
                                comment.author_name ||
                                comment.username ||
                                comment.user?.name ||
                                comment.author?.name ||
                                "BugFlow User";

                              const commentText =
                                comment.content ||
                                comment.comment ||
                                comment.text ||
                                comment.body ||
                                "";

                              return (
                                <div
                                  key={comment.id}
                                  style={{
                                    padding: "12px 14px",
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: "10px",
                                    }}
                                  >
                                    <strong
                                      style={{
                                        color: "#0f172a",
                                        fontSize: "14px",
                                      }}
                                    >
                                      👤 {commenterName}
                                    </strong>

                                    <button
                                      type="button"
                                      className="small-button"
                                      onClick={() =>
                                        deleteIssueComment(issue.id, comment)
                                      }
                                      disabled={commentLoading[issue.id]}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>

                                  <p
                                    style={{
                                      margin: "8px 0 0",
                                      color: "#475569",
                                      fontSize: "14px",
                                      lineHeight: "1.5",
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {commentText}
                                  </p>

                                  {(comment.created_at ||
                                    comment.updated_at) && (
                                    <small
                                      style={{
                                        display: "block",
                                        marginTop: "8px",
                                        color: "#94a3b8",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {comment.created_at ||
                                        comment.updated_at}
                                    </small>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          <textarea
                            value={commentInputs[issue.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((current) => ({
                                ...current,
                                [issue.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            rows={3}
                            style={{
                              flex: 1,
                              minWidth: "240px",
                              resize: "vertical",
                              padding: "11px 12px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "10px",
                              fontFamily: "inherit",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />

                          <button
                            type="button"
                            className="small-button"
                            onClick={() => addIssueComment(issue.id)}
                            disabled={commentLoading[issue.id]}
                          >
                            {commentLoading[issue.id]
                              ? "Adding..."
                              : "💬 Add Comment"}
                          </button>

                          <button
                            type="button"
                            className="small-button"
                            onClick={() =>
                              setCommentInputs((current) => ({
                                ...current,
                                [issue.id]: "",
                              }))
                            }
                            disabled={
                              commentLoading[issue.id] ||
                              !String(commentInputs[issue.id] || "").trim()
                            }
                          >
                            ✕ Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ISSUE ACTIVITY CONTENT */}
                    <div
                      style={{
                        marginTop: "16px",
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: "14px",
                      }}
                    >
                      {expandedActivities[issue.id] && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "14px 16px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                          }}
                        >
                          {(issueActivities[issue.id] || []).length === 0 ? (
                            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                              No activity recorded yet.
                            </p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {(issueActivities[issue.id] || []).map((activity) => (
                                <div
                                  key={activity.id}
                                  style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
                                >
                                  <div
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      minWidth: "30px",
                                      borderRadius: "50%",
                                      background: "#dbeafe",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {activity.action === "Issue Created"
                                      ? "📝"
                                      : activity.action === "Status Changed"
                                        ? "🔄"
                                        : activity.action === "Developer Assigned"
                                          ? "👨‍💻"
                                          : "📌"}
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>
                                      {activity.action}
                                    </strong>

                                    {activity.details && (
                                      <p style={{ margin: "4px 0", color: "#64748b", fontSize: "13px" }}>
                                        {activity.details}
                                      </p>
                                    )}

                                    {activity.created_at && (
                                      <small style={{ color: "#94a3b8", fontSize: "11px" }}>
                                        {new Date(activity.created_at).toLocaleString()}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                ))}

              </div>

              </>
            )}

          </section>
        )}

        {/* =================================================
            CREATE ISSUE PAGE
        ================================================= */}

        {activePage === "create" && (
          <section className="panel page-panel create-page-panel">

            <div className="panel-header">

              <div>

                <h2>
                  {editIssueId ? "Edit Issue" : "Create New Issue"}
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                  }}
                >
                  {editIssueId
                    ? "Update the issue details and save your changes."
                    : "Report a bug or problem with enough detail for your team to act on it."}
                </p>

              </div>

            </div>

            <div className="create-form">

              <label>
                Issue Title
              </label>

              <input
                className="modal-input"
                value={issueTitle}
                onChange={(e) =>
                  setIssueTitle(
                    e.target.value
                  )
                }
                placeholder="Example: Login button not working"
              />

              <label>
                Description
              </label>

              <textarea
                className="modal-textarea"
                value={issueDescription}
                onChange={(e) =>
                  setIssueDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the problem..."
              />

              {duplicateIssues.length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "14px 16px",
                    border: "1px solid #f59e0b",
                    borderRadius: "10px",
                    background: "#fffbeb",
                    color: "#92400e",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <strong>⚠️ Possible duplicate issue</strong>
                    <button
                      type="button"
                      onClick={() => setShowDuplicateWarning(false)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#92400e",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      Hide
                    </button>
                  </div>

                  <p style={{ margin: "6px 0 10px", fontSize: "13px" }}>
                    This report looks similar to an existing issue. Please check before creating a duplicate.
                  </p>

                  {duplicateIssues.map((duplicate) => (
                    <div
                      key={duplicate.id}
                      style={{
                        padding: "8px 10px",
                        marginTop: "6px",
                        background: "#ffffff",
                        borderRadius: "7px",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <strong>Issue #{duplicate.id}</strong> — {duplicate.title}
                      <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                        {Math.round(duplicate.similarity * 100)}% similar
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginTop: "10px",
                  marginBottom: "18px",
                }}
              >

                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Improve the description
                  before submitting
                </span>

                <button
                  type="button"
                  onClick={
                    enhanceIssueDescription
                  }
                  disabled={
                    enhancingDescription ||
                    !issueDescription.trim()
                  }
                  style={{
                    padding: "11px 16px",
                    border:
                      "1px solid #c7d2fe",
                    borderRadius: "9px",
                    background:
                      enhancingDescription ||
                      !issueDescription.trim()
                        ? "#eef2ff"
                        : "#f8faff",
                    color:
                      enhancingDescription ||
                      !issueDescription.trim()
                        ? "#94a3b8"
                        : "#4f46e5",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor:
                      enhancingDescription ||
                      !issueDescription.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {enhancingDescription
                    ? "✨ Enhancing description..."
                    : "✨ Enhance with AI"}
                </button>

              </div>

              {/* =====================================================
                  AI DEFECT CLASSIFICATION
              ===================================================== */}

              <div
                style={{
                  marginTop: "14px",
                  marginBottom: "20px",
                  padding: "16px",
                  border: "1px solid #c7d2fe",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f8faff, #eef2ff)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong style={{ color: "#312e81", fontSize: "15px" }}>
                      🤖 AI Defect Classification
                    </strong>
                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      Analyze the issue and get suggested category, module, type, severity and priority.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={classifyIssueWithAI}
                    disabled={
                      classifyingIssue ||
                      !issueTitle.trim() ||
                      !issueDescription.trim()
                    }
                    style={{
                      padding: "10px 15px",
                      border: "1px solid #6366f1",
                      borderRadius: "9px",
                      background:
                        classifyingIssue ||
                        !issueTitle.trim() ||
                        !issueDescription.trim()
                          ? "#e0e7ff"
                          : "#4f46e5",
                      color:
                        classifyingIssue ||
                        !issueTitle.trim() ||
                        !issueDescription.trim()
                          ? "#94a3b8"
                          : "#ffffff",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor:
                        classifyingIssue ||
                        !issueTitle.trim() ||
                        !issueDescription.trim()
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {classifyingIssue
                      ? "🤖 Analyzing..."
                      : aiClassification
                        ? "🔄 Re-analyze"
                        : "🤖 Analyze with AI"}
                  </button>
                </div>

                {aiClassification && (
                  <div
                    style={{
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: "1px solid #c7d2fe",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {[
                        ["category", "Category"],
                        ["module", "Module"],
                        ["defect_type", "Defect Type"],
                        ["severity", "Severity"],
                        ["priority", "Priority"],
                      ].map(([field, label]) => (
                        <div key={field}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "5px",
                              color: "#475569",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            {label}
                          </label>

                          <input
                            className="modal-input"
                            value={aiClassification[field] || ""}
                            onChange={(e) =>
                              updateAIClassificationField(
                                field,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          color: "#475569",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        AI Reason
                      </label>

                      <textarea
                        className="modal-textarea"
                        rows="2"
                        value={aiClassification.reason || ""}
                        onChange={(e) =>
                          updateAIClassificationField(
                            "reason",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <p
                      style={{
                        margin: "10px 0 0",
                        color: "#475569",
                        fontSize: "12px",
                      }}
                    >
                      ✏️ You can edit the AI suggestions before creating the issue. The final values will be saved to PostgreSQL.
                    </p>
                  </div>
                )}
              </div>

              <div className="form-grid-2">

                <div>

                  <label>
                    Project
                  </label>

                  <select
                    className="modal-input"
                    value={
                      selectedProjectId
                    }
                    onChange={(e) =>
                      setSelectedProjectId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Project
                    </option>

                    {projects.map(
                      (project) => (

                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {project.project_name}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label>
                    Priority
                  </label>

                  <select
                    className="modal-input"
                    value={
                      issuePriority
                    }
                    onChange={(e) =>
                      setIssuePriority(
                        e.target.value
                      )
                    }
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>

                  </select>

                </div>

              </div>

              {/* DEVELOPER ASSIGNMENT */}

              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <label>
                  Assigned To
                </label>

                <select
                  className="modal-input"
                  value={selectedDeveloperId}
                  onChange={(e) =>
                    setSelectedDeveloperId(
                      e.target.value
                    )
                  }
                  disabled={!canAssignIssues}
                  title={
                    canAssignIssues
                      ? "Assign developer"
                      : "Only Manager or Admin can assign developers"
                  }
                >
                  <option value="">
                    Unassigned
                  </option>

                  {developers.map(
                    (developer) => (
                      <option
                        key={developer.id}
                        value={developer.id}
                      >
                        {developer.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                style={{
                  marginTop: "18px",
                }}
              >

                <label>
                  Status
                </label>

                <select
                  className="modal-input"
                  value={
                    issueStatus
                  }
                  onChange={(e) =>
                    setIssueStatus(
                      e.target.value
                    )
                  }
                >

                  <option value="Open">
                    Open
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="In Review">
                    In Review
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                  <option value="Closed">
                    Closed
                  </option>

                </select>

              </div>

              <div
                className="modal-actions"
                style={{
                  justifyContent:
                    "flex-start",
                  marginTop: "24px",
                }}
              >

                <button
                  className="secondary-button"
                  onClick={() => {
                    if (editIssueId) {
                      setEditIssueId(null);
                      setIssueTitle("");
                      setIssueDescription("");
                      setIssuePriority("Medium");
                      setIssueStatus("Open");
                      setSelectedProjectId("");
                      setSelectedDeveloperId("");
                      setAiClassification(null);
                      setActivePage("issues");
                    } else {
                      navigateTo("dashboard");
                    }
                  }}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={editIssueId ? handleUpdateIssue : handleCreateIssue}
                >
                  {editIssueId ? "Save Changes" : "Create Issue"}
                </button>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            AI ASSISTANT PAGE
        ================================================= */}

        {/* =================================================
            SMART BUGFLOW TOOLS PAGE
            Added without changing existing pages/features.
        ================================================= */}

        {activePage === "smart-tools" && (
          <section className="panel page-panel" style={{ marginBottom: "24px" }}>
            <div className="panel-header">
              <div>
                <h2 style={{ margin: 0 }}>🚀 Smart BugFlow Tools</h2>
                <p>
  AI-powered tools for faster defect investigation, risk prediction,
  resolution analysis and development support.
</p>
              </div>
            </div>

            {/* 1. SEMANTIC DEFECT SEARCH */}
            <div style={{ marginTop: "20px", padding: "18px", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
              <h3 style={{ marginTop: 0 }}>🔎 1. Semantic Defect Search</h3>
              <p style={{ color: "#64748b" }}>Search issues by related words and meaning instead of requiring an exact title match.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  value={semanticSearch}
                  onChange={(e) => setSemanticSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runSemanticDefectSearch(); }}
                  placeholder="Example: login button not responding"
                  style={{ flex: 1, minWidth: "260px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "9px" }}
                />
                <button className="primary-button" onClick={runSemanticDefectSearch}>Search Defects</button>
              </div>
              {semanticResults.length > 0 && (
                <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
                  {semanticResults.map((issue) => (
                    <div key={issue.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <strong>#{issue.id} {issue.title}</strong>
                      <span style={{ float: "right", fontWeight: 700, color: "#2563eb" }}>{issue.smartScore}% match</span>
                      <p style={{ margin: "6px 0 0", color: "#64748b" }}>{issue.description || "No description"}</p>
                    </div>
                  ))}
                </div>
              )}
              {semanticSearch.trim() && semanticResults.length === 0 && (
                <p style={{ marginBottom: 0, color: "#64748b" }}>No related issues found.</p>
              )}
            </div>

            {/* 2. RESOLUTION ASSISTANCE */}
            <div style={{ marginTop: "18px", padding: "18px", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
              <h3 style={{ marginTop: 0 }}>🛠️ 2. Resolution Assistance</h3>
              <p style={{ color: "#64748b" }}>Find previously resolved issues that can guide the current investigation.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <select
                  value={resolutionIssueId}
                  onChange={(e) => { setResolutionIssueId(e.target.value); getResolutionSuggestions(e.target.value); }}
                  style={{ flex: 1, minWidth: "260px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "9px" }}
                >
                  <option value="">Select an issue to investigate</option>
                  {issues.map((issue) => <option key={issue.id} value={issue.id}>#{issue.id} - {issue.title}</option>)}
                </select>
                <button className="primary-button" onClick={() => getResolutionSuggestions(resolutionIssueId)}>Find Resolutions</button>
              </div>
              {resolutionSuggestions.length > 0 && (
                <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
                  {resolutionSuggestions.map((issue) => (
                    <div key={issue.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "10px" }}>
                      <strong>#{issue.id} {issue.title}</strong>
                      <span style={{ marginLeft: "10px", color: "#16a34a", fontWeight: 700 }}>{issue.smartScore}% similar</span>
                      <p style={{ margin: "6px 0 0", color: "#475569" }}>{issue.description || "Resolved issue has no description."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 3. AI DEFECT RISK RADAR */}
<div
  style={{
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  }}
>
  <h3 style={{ marginTop: 0 }}>
    🎯 3. AI Defect Risk Radar
  </h3>

  <p style={{ color: "#64748b" }}>
    Analyze the risk level of a selected defect.
  </p>

  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    <select
      value={resolutionIssueId}
      onChange={(e) => {
        setResolutionIssueId(e.target.value);
        setRiskRadarResult(null);
      }}
      style={{
        flex: 1,
        minWidth: "260px",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
      }}
    >
      <option value="">Select an issue</option>

      {issues.map((issue) => (
        <option key={issue.id} value={issue.id}>
          #{issue.id} - {issue.title}
        </option>
      ))}
    </select>

    <button
      className="primary-button"
      onClick={async () => {
        const issue = issues.find(
          (item) =>
            String(item.id) ===
            String(resolutionIssueId)
        );

        if (!issue) {
          alert("Please select an issue.");
          return;
        }

        try {
          const token =
            sessionStorage.getItem("token");

          const response = await fetch(
            `${API_URL}/ai/risk-radar`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                title: issue.title || "",
                description: issue.description || "",
                severity: issue.severity || "Medium",
                priority: issue.priority || "Medium",
                status: issue.status || "Open",
                issue_age_days: 0,
                reopened_count: 0,
                assigned: Boolean(issue.assigned_to),
                role:currentUserRole || "Developer",
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.detail || "Risk analysis failed."
            );
          }

          setRiskRadarResult(data);
        } catch (error) {
          console.error("Risk Radar error:", error);
          alert(error.message);
        }
      }}
    >
      Analyze Risk
    </button>
  </div>

  {riskRadarResult && (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4>Risk Analysis Result</h4>

      <p>
        <strong>Risk Level:</strong>{" "}
        {riskRadarResult.risk_level}
      </p>

      <p>
        <strong>Risk Score:</strong>{" "}
        {riskRadarResult.risk_score}/100
      </p>

      <p>
        <strong>Risk Factors:</strong>
      </p>

      <ul>
        {(riskRadarResult.risk_factors || []).map(
          (factor, index) => (
            <li key={index}>{factor}</li>
          )
        )}
      </ul>

      <p>
        <strong>Recommendation:</strong>{" "}
        {riskRadarResult.recommendation}
      </p>

      <p>
        <strong>Role Focus:</strong>{" "}
        {riskRadarResult.role_focus}
      </p>
    </div>
  )}
    {/*4. AI BUG FIX IMPACT PREDICTOR */}
  <div
    style={{
      marginTop: "20px",
      paddingTop: "18px",
      borderTop: "1px solid #e2e8f0",
    }}
  >
    <h3 style={{ marginTop: 0 }}>
      🔧4. AI Bug Fix Impact Predictor
    </h3>

    <p style={{ color: "#64748b" }}>
      Predict the impact and regression risk of a proposed fix.
    </p>

    <textarea
      id="fix-description"
      placeholder="Describe the proposed fix..."
      style={{
        width: "100%",
        minHeight: "80px",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        resize: "vertical",
      }}
    />

    <button
      className="primary-button"
      style={{ marginTop: "10px" }}
      onClick={async () => {
        const issue = issues.find(
          (item) =>
            String(item.id) ===
            String(resolutionIssueId)
        );

        if (!issue) {
          alert("Please select an issue first.");
          return;
        }

        const fixDescription =
          document.getElementById("fix-description")?.value || "";

        try {
          const token = sessionStorage.getItem("token");

          const response = await fetch(
            `${API_URL}/ai/fix-impact`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                title: issue.title || "",
                description: issue.description || "",
                module: issue.module || "Unknown",
                category: issue.category || "Other",
                severity: issue.severity || "Medium",
                priority: issue.priority || "Medium",
                fix_description: fixDescription,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.detail || "Fix impact prediction failed."
            );
          }

          setFixImpactResult(data);
        } catch (error) {
          console.error("Fix Impact error:", error);
          alert(
            error.message ||
              "Unable to predict fix impact."
          );
        }
      }}
    >
      Predict Fix Impact
    </button>

    {fixImpactResult && (
      <div
        style={{
          marginTop: "14px",
          padding: "16px",
          background: "#f8fafc",
          borderRadius: "12px",
        }}
      >
        <h4 style={{ marginTop: 0 }}>
          Fix Impact Prediction
        </h4>

        <p>
          <strong>Impact Level:</strong>{" "}
          {fixImpactResult.impact_level}
        </p>

        <p>
          <strong>Impact Score:</strong>{" "}
          {fixImpactResult.impact_score}/100
        </p>

        <p>
          <strong>Regression Risk:</strong>{" "}
          {fixImpactResult.regression_risk}
        </p>

        <p>
          <strong>Affected Areas:</strong>
        </p>

        <ul>
          {(fixImpactResult.affected_areas || []).map(
            (area, index) => (
              <li key={index}>{area}</li>
            )
          )}
        </ul>

        <p>
          <strong>Testing Recommendations:</strong>
        </p>

        <ul>
          {(fixImpactResult.testing_recommendations || []).map(
            (test, index) => (
              <li key={index}>{test}</li>
            )
          )}
        </ul>

        <p>
          <strong>Recommendation:</strong>{" "}
          {fixImpactResult.recommendation}
        </p>

        <p>
          <strong>Reasoning:</strong>{" "}
          {fixImpactResult.reasoning}
        </p>
      </div>
    )}
  </div>
</div>
{/* 5. HISTORICAL RESOLUTION INTELLIGENCE */}
<div
  style={{
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  }}
>
  <h3 style={{ marginTop: 0 }}>
    🧠 5. Historical Resolution Intelligence
  </h3>

  <p style={{ color: "#64748b" }}>
    Find similar resolved defects and reuse previous root-cause
    and resolution knowledge.
  </p>

  <select
    value={resolutionIssueId}
    onChange={(e) => setResolutionIssueId(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      boxSizing: "border-box",
    }}
  >
    <option value="">Select an issue</option>

    {issues.map((issue) => (
      <option key={issue.id} value={issue.id}>
        #{issue.id} — {issue.title}
      </option>
    ))}
  </select>

  <button
    type="button"
    className="primary-button"
    style={{ marginTop: "10px" }}
    onClick={() =>
      analyzeHistoricalResolution(resolutionIssueId)
    }
  >
    Analyze History
  </button>

  {historicalResult && (
    <div
      style={{
        marginTop: "14px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4 style={{ marginTop: 0 }}>
        Historical Analysis
      </h4>

      <p>
        <strong>Root Cause:</strong>{" "}
        {historicalResult.root_cause || "Not identified"}
      </p>

      <p>
        <strong>Previous Resolution:</strong>{" "}
        {historicalResult.previous_resolution ||
          "No previous resolution found"}
      </p>

      <p>
        <strong>Investigation Guidance:</strong>{" "}
        {historicalResult.investigation_guidance ||
          "No guidance available"}
      </p>

      <p>
        <strong>Related Historical Defects:</strong>
      </p>

      <ul>
        {(historicalResult.matches || []).map(
          (match, index) => (
            <li key={index}>
              #{match.id} — {match.title || "Historical issue"}
            </li>
          )
        )}
      </ul>
    </div>
  )}
</div>

{/* 6. EXPLAINABLE EVIDENCE EXPLORER */}
<div
  style={{
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  }}
>
  <h3 style={{ marginTop: 0 }}>
    🔎 6. Explainable RAG / Evidence Explorer
  </h3>

  <p style={{ color: "#64748b" }}>
    Ask a question and understand the evidence behind the AI answer.
  </p>

  <input
    value={evidenceQuestion}
    onChange={(e) => setEvidenceQuestion(e.target.value)}
    placeholder="Ask a question about the evidence..."
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      boxSizing: "border-box",
    }}
  />

  <textarea
    value={evidenceText}
    onChange={(e) => setEvidenceText(e.target.value)}
    placeholder="Enter evidence, one item per line..."
    rows={5}
    style={{
      width: "100%",
      marginTop: "10px",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      boxSizing: "border-box",
      resize: "vertical",
    }}
  />

  <button
    type="button"
    className="primary-button"
    style={{ marginTop: "10px" }}
    onClick={exploreEvidence}
  >
    Explain Evidence
  </button>

  {evidenceResult && (
    <div
      style={{
        marginTop: "14px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4 style={{ marginTop: 0 }}>
        Evidence Analysis
      </h4>

      <p>
        <strong>Answer:</strong>{" "}
        {evidenceResult.answer || "No answer generated"}
      </p>

      <p>
        <strong>Confidence:</strong>{" "}
        {evidenceResult.confidence || "Unknown"}
      </p>

      <p>
        <strong>Evidence Used:</strong>
      </p>

      <ul>
        {(evidenceResult.evidence_used || []).map(
          (item, index) => (
            <li key={index}>{item}</li>
          )
        )}
      </ul>

      <p>
        <strong>Explanation:</strong>{" "}
        {evidenceResult.explanation ||
          "No explanation available"}
      </p>
    </div>
  )}
</div>

{/* 7. AI-POWERED ISSUE INVESTIGATION */}
<div
  style={{
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  }}
>
  <h3 style={{ marginTop: 0 }}>
    🕵️ 7. AI-Powered Issue Investigation
  </h3>

  <p style={{ color: "#64748b" }}>
    Analyze an issue, identify possible root causes, and get
    investigation guidance.
  </p>

  <select
    value={investigationIssueId}
    onChange={(e) =>
      setInvestigationIssueId(e.target.value)
    }
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      boxSizing: "border-box",
    }}
  >
    <option value="">Select an issue</option>

    {issues.map((issue) => (
      <option key={issue.id} value={issue.id}>
        #{issue.id} — {issue.title}
      </option>
    ))}
  </select>

  <button
    type="button"
    className="primary-button"
    style={{ marginTop: "10px" }}
    onClick={() =>
      investigateIssue(investigationIssueId)
    }
  >
    Investigate Issue
  </button>

  {investigationResult && (
    <div
      style={{
        marginTop: "14px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4 style={{ marginTop: 0 }}>
        Investigation Result
      </h4>

      <p>
        <strong>Problem Summary:</strong>{" "}
        {investigationResult.problem_summary ||
          "Not available"}
      </p>

      <p>
        <strong>Possible Root Causes:</strong>
      </p>

      <ul>
        {(investigationResult.possible_root_causes || []).map(
          (cause, index) => (
            <li key={index}>{cause}</li>
          )
        )}
      </ul>

      <p>
        <strong>Investigation Steps:</strong>
      </p>

      <ol>
        {(investigationResult.investigation_steps || []).map(
          (step, index) => (
            <li key={index}>{step}</li>
          )
        )}
      </ol>

      <p>
        <strong>Historical Insight:</strong>{" "}
        {investigationResult.historical_insight ||
          "No historical insight available"}
      </p>

      <p>
        <strong>Recommended Action:</strong>{" "}
        {investigationResult.recommended_action ||
          "No recommendation available"}
      </p>

      <p>
        <strong>Confidence:</strong>{" "}
        {investigationResult.confidence || "Unknown"}
      </p>
    </div>
  )}
</div>
{/* 8. AI GITHUB CODE REVIEW */}
<div
  style={{
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  }}
>
  <h3 style={{ marginTop: 0 }}>
    🐙8. AI GitHub Code Review
  </h3>

  <p style={{ color: "#64748b" }}>
    Analyze a GitHub pull request against a
    BugFlow issue and receive AI code review
    and fix suggestions.
  </p>

  <div
    style={{
      display: "grid",
      gap: "10px",
    }}
  >
    <select
      value={resolutionIssueId}
      onChange={(e) => {
        setResolutionIssueId(e.target.value);
        setCodeReviewResult(null);
      }}
      style={{
        width: "100%",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
      }}
    >
      <option value="">
        Select BugFlow issue
      </option>

      {issues.map((issue) => (
        <option
          key={issue.id}
          value={issue.id}
        >
          #{issue.id} - {issue.title}
        </option>
      ))}
    </select>

    <input
      value={codeReviewPrNumber}
      onChange={(e) =>
        setCodeReviewPrNumber(e.target.value)
      }
      placeholder="GitHub Pull Request #"
      type="number"
      min="1"
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
      }}
    />

    <button
      className="primary-button"
      onClick={runGitHubCodeReview}
    >
      🔍 Review Pull Request
    </button>
  </div>

  {codeReviewResult && (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4 style={{ marginTop: 0 }}>
        AI Code Review
      </h4>

      <p>
        <strong>Risk Level:</strong>{" "}
        {codeReviewResult.risk_level}
      </p>

      <p>
        <strong>Summary:</strong>{" "}
        {codeReviewResult.summary}
      </p>

      <h4>Findings</h4>

      {(
        codeReviewResult.findings || []
      ).map((finding, index) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            padding: "12px",
            background: "#ffffff",
            borderRadius: "8px",
          }}
        >
          <strong>
            {finding.severity} —{" "}
            {finding.file}
          </strong>

          <p style={{ margin: "5px 0" }}>
            {finding.issue}
          </p>

          <small>
            {finding.reason}
          </small>
        </div>
      ))}

      <h4>Suggested Fixes</h4>

      {(
        codeReviewResult.suggested_fixes || []
      ).map((fix, index) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            padding: "12px",
            background: "#ffffff",
            borderRadius: "8px",
          }}
        >
          <strong>{fix.file}</strong>

          <p>{fix.suggestion}</p>

          {fix.code && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "8px",
                overflowX: "auto",
              }}
            >
              {fix.code}
            </pre>
          )}
        </div>
      ))}

      <h4>Testing Recommendations</h4>

      <ul>
        {(
          codeReviewResult.testing_recommendations ||
          []
        ).map((test, index) => (
          <li key={index}>{test}</li>
        ))}
      </ul>
    </div>
  )}
</div>
            {/* 9. HISTORICAL RESOLUTION KNOWLEDGE BASE */}
            <div style={{ marginTop: "18px", padding: "18px", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
              <h3 style={{ marginTop: 0 }}>📚 9. Historical Resolution Knowledge Base</h3>
              <p style={{ color: "#64748b" }}>Browse resolved defects and reuse previous investigation knowledge.</p>
              <input
                value={knowledgeSearch}
                onChange={(e) => setKnowledgeSearch(e.target.value)}
                placeholder="Search resolved issues..."
                style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "9px" }}
              />
              <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
                {getKnowledgeBaseIssues().map((issue) => (
                  <div key={issue.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "10px" }}>
                    <strong>#{issue.id} {issue.title}</strong>
                    {issue.smartScore !== undefined && <span style={{ marginLeft: "10px", color: "#2563eb", fontWeight: 700 }}>{issue.smartScore}% match</span>}
                    <p style={{ margin: "6px 0 0", color: "#475569" }}>{issue.description || "No resolution details stored."}</p>
                    <small style={{ color: "#64748b" }}>Status: {issue.status || "Resolved"} · Priority: {issue.priority || "Unknown"}</small>
                  </div>
                ))}
                {getKnowledgeBaseIssues().length === 0 && <p style={{ color: "#64748b" }}>No resolved issues available yet.</p>}
              </div>
            </div>

            {/* 4. SPRINT HEALTH */}
            <div style={{ marginTop: "18px", padding: "18px", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
              <h3 style={{ marginTop: 0 }}>❤️ Sprint Health Score</h3>
              <p style={{ color: "#64748b" }}>Measure completion, high-risk work and unassigned issues in the selected sprint.</p>
              <select
                value={selectedSprintId}
                onChange={(e) => handleSprintSelection(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "9px" }}
              >
                <option value="">Select sprint</option>
                {sprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name}</option>)}
              </select>
              {selectedSprintId && (() => {
                const selectedSprint = sprints.find((sprint) => String(sprint.id) === String(selectedSprintId));
                const health = getSprintHealth(selectedSprint);
                if (!health) return null;
                return (
                  <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                    {[
                      ["Health Score", `${health.score}/100`],
                      ["Health", health.label],
                      ["Total Issues", health.total],
                      ["Completed", health.completed],
                      ["High Risk", health.highRisk],
                      ["Unassigned", health.unassigned],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px" }}>
                        <small style={{ color: "#64748b" }}>{label}</small>
                        <strong style={{ display: "block", marginTop: "5px", fontSize: "20px" }}>{value}</strong>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            {/* 10. PREDICTIVE SPRINT ANALYTICS */}
<div
  style={{
    marginTop: "18px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  }}
>
  <h3 style={{ marginTop: 0 }}>
    🔮10. Predictive Sprint Analytics
  </h3>

  <p style={{ color: "#64748b" }}>
    Use sprint progress, workload, priority and
    historical information to predict sprint risk.
  </p>

  <button
    className="primary-button"
    onClick={runPredictiveSprintAnalytics}
    disabled={!selectedSprintId}
  >
    🔮 Predict Sprint Health
  </button>

  {predictiveSprintResult && (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4 style={{ marginTop: 0 }}>
        Sprint Prediction
      </h4>

      <p>
        <strong>Health Score:</strong>{" "}
        {predictiveSprintResult.health_score}/100
      </p>

      <p>
        <strong>Risk Level:</strong>{" "}
        {predictiveSprintResult.risk_level}
      </p>

      <p>
        <strong>Velocity:</strong>{" "}
        {predictiveSprintResult.velocity_assessment}
      </p>

      <p>
        <strong>Completion Forecast:</strong>{" "}
        {predictiveSprintResult.completion_forecast}
      </p>

      <p>
        <strong>Prediction:</strong>{" "}
        {predictiveSprintResult.prediction}
      </p>

      <h4>Risk Factors</h4>

      <ul>
        {(
          predictiveSprintResult.risk_factors || []
        ).map((factor, index) => (
          <li key={index}>{factor}</li>
        ))}
      </ul>

      <h4>Recommendations</h4>

      <ul>
        {(
          predictiveSprintResult.recommendations || []
        ).map((recommendation, index) => (
          <li key={index}>
            {recommendation}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

            {/*11.GITHUB INTEGRATION */} 
            <div style={{ marginTop: "18px", padding: "18px", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
              <h3 style={{ marginTop: 0 }}>🐙11.GitHub Integration</h3>
              <p style={{ color: "#64748b" }}>Connect a repository and quickly open the matching GitHub issue.</p>
              <div style={{ display: "grid", gap: "10px" }}>
                <input value={githubRepoUrl} onChange={(e) => setGithubRepoUrl(e.target.value)} placeholder="https://github.com/owner/repository" style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "9px" }} />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="primary-button" onClick={saveGithubRepository}>Save Repository</button>
                  <input value={githubIssueNumber} onChange={(e) => setGithubIssueNumber(e.target.value)} placeholder="GitHub issue #" style={{ flex: 1, minWidth: "150px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "9px" }} />
                  {getGithubIssueUrl() && <a className="secondary-button" href={getGithubIssueUrl()} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>Open GitHub Issue</a>}
                </div>
                {integrationMessage && <small style={{ color: "#475569" }}>{integrationMessage}</small>}
              </div>
            </div>

            {/*12.API / INTEGRATIONS */}
            <div style={{ marginTop: "18px", padding: "18px", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
              <h3 style={{ marginTop: 0 }}>🔌12.API & Integrations</h3>
              <p style={{ color: "#64748b" }}>Check the BugFlow API and copy useful integration endpoints.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button className="primary-button" onClick={checkApiStatus}>Check API Status</button>
                <strong>API: {apiStatus}</strong>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
                {["/issues", "/projects", "/sprints", "/openapi.json"].map((endpoint) => (
                  <button key={endpoint} className="small-button" onClick={() => copyIntegrationEndpoint(endpoint)}>Copy {endpoint}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {activePage === "ai" && (
          <section className="panel page-panel ai-page-panel">

            <div className="panel-header">

              <div>

                <h2>
                  🤖 AI Bug Assistant
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                  }}
                >
                  Describe the problem naturally.
                  AI will structure it into a
                  professional bug report.
                </p>

              </div>

            </div>

            <textarea
              className="ai-modal-textarea"
              value={aiText}
              onChange={(e) =>
                setAiText(
                  e.target.value
                )
              }
              placeholder="Example: I click login but nothing happens even when I enter the correct password..."
              style={{
                minHeight: "180px",
                marginTop: "18px",
              }}
            />

            <button
              className="primary-button ai-generate-button"
              onClick={
                generateAIReport
              }
              style={{
                marginTop: "14px",
              }}
            >
              ✨ Generate Bug Report
            </button>

            {aiResult && (
              <div
                className="ai-result"
                style={{
                  marginTop: "24px",
                }}
              >

                <div className="result-item">

                  <label>
                    TITLE
                  </label>

                  <h3>
                    {aiResult.title}
                  </h3>

                </div>

                <div className="result-item">

                  <label>
                    DESCRIPTION
                  </label>

                  <p>
                    {aiResult.description}
                  </p>

                </div>

                <div className="result-item">

                  <label>
                    PRIORITY
                  </label>

                  <span className="priority high">
                    {aiResult.priority}
                  </span>

                </div>

                <div className="result-item">

                  <label>
                    STEPS TO REPRODUCE
                  </label>

                  <ol>

                    {aiResult.steps.map(
                      (step, index) => (
                        <li key={index}>
                          {step}
                        </li>
                      )
                    )}

                  </ol>

                </div>

                <div className="result-item">

                  <label>
                    EXPECTED RESULT
                  </label>

                  <p>
                    {aiResult.expected}
                  </p>

                </div>

                <div className="result-item">

                  <label>
                    ACTUAL RESULT
                  </label>

                  <p>
                    {aiResult.actual}
                  </p>

                </div>

                <button
                  className="primary-button"
                  onClick={
                    useAIResult
                  }
                  style={{
                    width: "100%",
                    marginTop: "15px",
                  }}
                >
                  Use This Report → Create Issue
                </button>

              </div>
            )}

          </section>
        )}
      </main>

      {selectedIssue && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={() => setSelectedIssue(null)}
        >
          <div
            style={{ width: "100%", maxWidth: "650px", maxHeight: "80vh", overflowY: "auto", background: "#ffffff", borderRadius: "16px", padding: "24px", boxSizing: "border-box", boxShadow: "0 24px 60px rgba(15,23,42,0.2)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedIssue.title || "Untitled Issue"}</h2>
                <p style={{ margin: "7px 0 0", color: "#64748b" }}>Issue #{selectedIssue.id}</p>
              </div>
              <button type="button" className="small-button" onClick={() => setSelectedIssue(null)}>✕ Close</button>
            </div>
            <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
              <div><strong>Description</strong><p style={{ color: "#475569", lineHeight: 1.6 }}>{selectedIssue.description || "No description provided."}</p></div>
              <div><strong>Status</strong><p>{selectedIssue.status || "Open"}</p></div>
              <div><strong>Priority</strong><p>{selectedIssue.priority || "Medium"}</p></div>
              <div><strong>Project</strong><p>{selectedIssue.project_id ? `Project #${selectedIssue.project_id}` : "Not assigned"}</p></div>
              <div><strong>Developer</strong><p>{selectedIssue.developer_name || selectedIssue.assigned_to || "Unassigned"}</p></div>
                          {/* =====================================================
                TIME TRACKING
            ===================================================== */}

            <div
              style={{
                marginTop: "8px",
                padding: "18px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                background: "#f8fafc",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  color: "#0f172a",
                }}
              >
                ⏱️ Time Tracking
              </h3>

              <div
                style={{
                  marginBottom: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                Total Logged:{" "}
                <span style={{ color: "#2563eb" }}>
                  {issueTimeTotals[selectedIssue.id] || 0} hours
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Hours"
                  value={timeLogHours}
                  onChange={(event) =>
                    setTimeLogHours(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />

                <textarea
                  placeholder="What did you work on?"
                  value={timeLogDescription}
                  onChange={(event) =>
                    setTimeLogDescription(
                      event.target.value
                    )
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />

                <button
                  type="button"
                  className="primary-button"
                  disabled={timeLogSaving}
                  onClick={() =>
                    addTimeLog(selectedIssue.id)
                  }
                >
                  {timeLogSaving
                    ? "Saving..."
                    : "⏱️ Log Time"}
                </button>
              </div>

              <div style={{ marginTop: "18px" }}>
                <strong>Time Log History</strong>

                {timeLogLoading[selectedIssue.id] ? (
                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    Loading time logs...
                  </p>
                ) : !issueTimeLogs[selectedIssue.id] ||
                  issueTimeLogs[selectedIssue.id].length === 0 ? (
                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    No time logged yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    {issueTimeLogs[selectedIssue.id].map(
                      (log) => (
                        <div
                          key={log.id}
                          style={{
                            padding: "12px",
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <strong>
                              {log.hours} hour
                              {log.hours !== 1
                                ? "s"
                                : ""}
                            </strong>

                            <button
                              type="button"
                              className="small-button"
                              onClick={() =>
                                deleteTimeLog(
                                  log.id,
                                  selectedIssue.id
                                )
                              }
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          <p
                            style={{
                              margin:
                                "6px 0 0",
                              color: "#475569",
                            }}
                          >
                            {log.description ||
                              "No description provided."}
                          </p>

                          <small
                            style={{
                              color: "#94a3b8",
                            }}
                          >
                            User #{log.user_id}
                            {log.created_at
                              ? ` • ${new Date(
                                  log.created_at
                                ).toLocaleString()}`
                              : ""}
                          </small>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
              </div>
<div style={{ marginTop: "18px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            </div>
            <div style={{ marginTop: "18px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button type="button" className="primary-button" onClick={() => copyIssueId(selectedIssue.id)}>📋 Copy Issue ID</button>
              <button type="button" className="secondary-button" onClick={() => setSelectedIssue(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;