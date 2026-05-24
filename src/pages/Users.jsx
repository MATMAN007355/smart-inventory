import React, { useState, useEffect } from "react";
import {
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import apiClient from "../api/client"; // Base client configured to inject session authorization automatically

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // Added separate transactional loader state
  const [error, setError] = useState(null);

  // Modal & Form Controller State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pull existing cluster database documents
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/auth/admin/users");
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else {
        throw new Error(
          "Unexpected data architecture returned from cluster API.",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to sync users log records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // 1. CREATE USER INTERACTION TRANSACTION
  // ==========================================
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (isCreating) return; // Prevention layer protecting network payload flooding

    try {
      setIsCreating(true);
      const response = await apiClient.post(
        "/auth/admin/create-user",
        newUserForm,
      );
      if (response.data && response.data.success) {
        // Prepend fresh record to array listing dynamically
        setUsers([response.data.data, ...users]);

        // Reset state wrappers
        setIsAddModalOpen(false);
        setNewUserForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          role: "user",
        });
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error occurred during profile initialization transaction.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // ==========================================
  // 2. TOGGLE USER SUSPENSION OPERATION
  // ==========================================
    const handleToggleSuspension = async (
      userId,
      userRole,
      currentSuspensionState,
    ) => {
      if (userRole === "admin") {
        alert("Action Denied: Cannot suspend admin accounts.");
        return;
      }

      const actionText = currentSuspensionState ? "UNSUSPEND" : "SUSPEND";
      if (
        window.confirm(
          `Are you sure you want to ${actionText} this user profile session?`,
        )
      ) {
        try {
          const response = await apiClient.patch(
            `/admin/suspend/${userId}`,
          );

          console.log(response.data);

          if (response.data && response.data.success) {
            setUsers(
              users.map((u) =>
                u._id === userId
                  ? { ...u, is_suspended: response.data.is_suspended }
                  : u,
              ),
            );
          }
        } catch (err) {
          alert(
            err.response?.data?.message ||
              "Error executing modification operation payload updates.",
          );
        }
      }
    };

  // Pagination processing loops
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  if (loading)
    return (
      <div style={styles.centerNotice}>
        Syncing users registry state vectors...
      </div>
    );
  if (error) return <div style={styles.errorNotice}>System Error: {error}</div>;

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        {/* Module Area Header Control panel layout element */}
        <div style={styles.dashboardHeader}>
          <h2 style={styles.title}>System User Management</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={styles.createUserBtn}
          >
            <FiUserPlus size={16} style={{ marginRight: "6px" }} /> Add New User
          </button>
        </div>

        {/* Primary Records Grid Matrix View */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.thNum}>S/N</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>Account System Role</th>
                <th style={styles.th}>Status Badge</th>
                <th style={styles.thCentered}>Access Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user, index) => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.tdNum}>{indexOfFirstItem + index + 1}</td>
                    <td style={styles.td}>
                      <strong>
                        {user.first_name} {user.last_name}
                      </strong>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          user.role === "admin"
                            ? styles.roleAdmin
                            : styles.roleUser
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={
                          user.is_suspended
                            ? styles.badgeSuspended
                            : styles.badgeActive
                        }
                      >
                        {user.is_suspended ? "Suspended" : "Active Account"}
                      </span>
                    </td>
                    <td style={styles.tdCentered}>
                      {user.role === "admin" ? (
                        <span style={styles.lockMessage}>Admin Immutable</span>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleSuspension(
                              user._id,
                              user.role,
                              user.is_suspended,
                            )
                          }
                          style={{
                            ...styles.actionBtn,
                            ...(user.is_suspended
                              ? styles.unsuspendBtnStyle
                              : styles.suspendBtnStyle),
                          }}
                          title={
                            user.is_suspended
                              ? "Grant System Access"
                              : "Block Access Session"
                          }
                        >
                          {user.is_suspended ? (
                            <>
                              <FiUserCheck
                                size={14}
                                style={{ marginRight: "4px" }}
                              />{" "}
                              Unsuspend
                            </>
                          ) : (
                            <>
                              <FiUserX
                                size={14}
                                style={{ marginRight: "4px" }}
                              />{" "}
                              Suspend
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.noData}>
                    No user log matches structural database state matrices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Sub-layer navigation block widget controls */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={styles.pageBtn}
            >
              <FiChevronLeft size={18} />
            </button>
            <span style={styles.pageInfo}>
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={styles.pageBtn}
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ==========================================
            INLINE MODAL CREATION ACCOUNT POPUP
           ========================================== */}
        {isAddModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3>Initialize New System Profile</h3>
                <button
                  onClick={() => !isCreating && setIsAddModalOpen(false)}
                  style={styles.closeIconBtn}
                  disabled={isCreating}
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} style={styles.formGrid}>
                <div style={styles.flexFormRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>First Name</label>
                    <input
                      type="text"
                      value={newUserForm.first_name}
                      onChange={(e) =>
                        setNewUserForm({
                          ...newUserForm,
                          first_name: e.target.value,
                        })
                      }
                      style={styles.inputField}
                      disabled={isCreating}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Last Name</label>
                    <input
                      type="text"
                      value={newUserForm.last_name}
                      onChange={(e) =>
                        setNewUserForm({
                          ...newUserForm,
                          last_name: e.target.value,
                        })
                      }
                      style={styles.inputField}
                      disabled={isCreating}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.label}>
                    Electronic Mail Address (Unique ID)
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, email: e.target.value })
                    }
                    style={styles.inputField}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Security Verification Password String
                  </label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                      })
                    }
                    style={styles.inputField}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Access Authorization Rank Role
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, role: e.target.value })
                    }
                    style={styles.selectField}
                    disabled={isCreating}
                  >
                    <option value="user">User Status (Standard Tier)</option>
                    <option value="manager">
                      Manager Access (Intermediate Tier)
                    </option>
                    <option value="admin">
                      Administrator Profile (Full Authority)
                    </option>
                  </select>
                </div>

                <div style={styles.formActionFooter}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={styles.cancelFormBtn}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.saveFormBtn,
                      ...(isCreating ? styles.disabledFormBtn : {}),
                    }}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <span>Creating Profile...</span>
                    ) : (
                      <>
                        <FiCheck size={16} style={{ marginRight: "4px" }} />{" "}
                        Create Identity
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// CSS-in-JS style structures tuned for dark slate system theme
const styles = {
  pageBackground: {
    backgroundColor: "#1e293b",
    minHeight: "100vh",
    width: "100%",
  },
  container: {
    padding: "32px 24px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "24px", fontWeight: "600", color: "#f8fafc", margin: 0 },
  createUserBtn: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#38bdf8",
    border: "none",
    color: "#0f172a",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  tableWrapper: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    overflow: "hidden",
    border: "0.5px solid #334155",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { backgroundColor: "#1e293b", borderBottom: "2px solid #334155" },
  th: {
    padding: "16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  thNum: {
    padding: "16px 16px 16px 24px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    width: "60px",
  },
  thCentered: {
    padding: "16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
  },
  tr: { borderBottom: "1px solid #334155", backgroundColor: "#0f172a" },
  td: { padding: "16px", fontSize: "14px", color: "#cbd5e1" },
  tdNum: {
    padding: "16px 16px 16px 24px",
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
  tdCentered: { padding: "16px", textAlign: "center" },
  roleAdmin: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    color: "#c084fc",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  roleUser: {
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    color: "#94a3b8",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  badgeActive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  badgeSuspended: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  lockMessage: { fontSize: "13px", color: "#64748b", fontStyle: "italic" },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  suspendBtnStyle: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
  },
  unsuspendBtnStyle: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "20px",
    gap: "12px",
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "8px",
    cursor: "pointer",
  },
  pageInfo: { fontSize: "14px", color: "#94a3b8" },
  centerNotice: {
    padding: "80px 24px",
    textAlign: "center",
    color: "#94a3b8",
    backgroundColor: "#1e293b",
    minHeight: "100vh",
  },
  errorNotice: {
    padding: "80px 24px",
    textAlign: "center",
    color: "#f87171",
    backgroundColor: "#1e293b",
    minHeight: "100vh",
  },
  noData: { padding: "32px", textAlign: "center", color: "#94a3b8" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "520px",
    padding: "24px",
    color: "#cbd5e1",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #334155",
    paddingBottom: "14px",
    marginBottom: "20px",
  },
  closeIconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
  },
  formGrid: { display: "flex", flexDirection: "column", gap: "16px" },
  flexFormRow: { display: "flex", gap: "16px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  inputField: {
    width: "100%",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  selectField: {
    width: "100%",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  formActionFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
    borderTop: "1px solid #334155",
    paddingTop: "16px",
  },
  cancelFormBtn: {
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  saveFormBtn: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#38bdf8",
    border: "none",
    color: "#0f172a",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  disabledFormBtn: { opacity: "0.6", cursor: "not-allowed" }, // Added disabled state rules
};

export default Users;
