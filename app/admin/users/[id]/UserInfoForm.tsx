"use client";

import { useState } from "react";
import {
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
} from "../actions";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isDisabled: boolean;
}

interface UserInfoFormProps {
  user: User;
  currentUserId: string;
}

const ROLE_OPTIONS = [
  { value: "USER", label: "User", description: "Basic user access" },
  { value: "VENDOR", label: "Vendor", description: "Can manage own products" },
  {
    value: "MODERATOR",
    label: "Moderator",
    description: "Can moderate content",
  },
  { value: "ADMIN", label: "Admin", description: "Full system access" },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Complete system control",
  },
];

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
    description: "User can access the system",
  },
  {
    value: "disabled",
    label: "Disabled",
    description: "User cannot access the system",
  },
];

export default function UserInfoForm({
  user,
  currentUserId,
}: UserInfoFormProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedStatus, setSelectedStatus] = useState(
    user.isDisabled ? "disabled" : "active"
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSelf = user.id === currentUserId;

  const getRoleLabel = (role: string) => {
    const roleOption = ROLE_OPTIONS.find((r) => r.value === role);
    return roleOption ? roleOption.label : role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "MODERATOR":
        return "bg-green-100 text-green-800";
      case "VENDOR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  async function handleRoleChange() {
    if (selectedRole === user.role) {
      setShowChangeRoleModal(false);
      return;
    }

    setIsLoading("role");
    setError(null);
    setSuccess(null);

    try {
      await updateUserRole(user.id, selectedRole);
      setSuccess("User role updated successfully");
      setShowChangeRoleModal(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      setSelectedRole(user.role); // Reset selection
    } finally {
      setIsLoading(null);
    }
  }

  async function handleStatusChange() {
    const newDisabledStatus = selectedStatus === "disabled";
    if (newDisabledStatus === user.isDisabled) {
      setShowChangeStatusModal(false);
      return;
    }

    setIsLoading("status");
    setError(null);
    setSuccess(null);

    try {
      await updateUserStatus(user.id, selectedStatus === "active");
      setSuccess("User status updated successfully");
      setShowChangeStatusModal(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      setSelectedStatus(user.isDisabled ? "disabled" : "active"); // Reset selection
    } finally {
      setIsLoading(null);
    }
  }

  async function handlePasswordReset() {
    setIsLoading("reset");
    setError(null);
    setSuccess(null);

    try {
      const newPassword = await resetUserPassword(user.id);
      alert(
        `Password has been reset to: ${newPassword}\n\nPlease share this with the user securely.`
      );
      setShowResetModal(false);
      setSuccess("Password reset successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div
      className="rounded-lg shadow-sm p-6"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
      }}
    >
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        User Management
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Current Role */}
        <div>
          <label
            className="text-sm font-medium block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Current Role
          </label>
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 text-sm rounded-full ${getRoleColor(
                user.role
              )}`}
            >
              {getRoleLabel(user.role)}
            </span>
            <button
              onClick={() => setShowChangeRoleModal(true)}
              disabled={
                isLoading !== null ||
                (isSelf &&
                  (user.role === "ADMIN" || user.role === "SUPER_ADMIN"))
              }
              className="px-3 py-1 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
                opacity:
                  isSelf &&
                  (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
                    ? 0.5
                    : 1,
              }}
              title={
                isSelf && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
                  ? "Cannot change your own admin role"
                  : ""
              }
            >
              Change Role
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div>
          <label
            className="text-sm font-medium block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Account Status
          </label>
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                user.isDisabled
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {user.isDisabled ? "Disabled" : "Active"}
            </span>
            <button
              onClick={() => setShowChangeStatusModal(true)}
              disabled={isLoading !== null || isSelf}
              className="px-3 py-1 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
                opacity: isSelf ? 0.5 : 1,
              }}
              title={isSelf ? "Cannot change your own status" : ""}
            >
              Change Status
            </button>
          </div>
        </div>

        {/* Actions */}
        <div
          className="pt-4 border-t"
          style={{ borderColor: "var(--card-border)" }}
        >
          <label
            className="text-sm font-medium block mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Actions
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setShowResetModal(true)}
              disabled={isLoading !== null}
              className="w-full px-3 py-2 text-sm rounded-lg transition-colors bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              {isLoading === "reset" ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Change Role Modal */}
      {showChangeRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Change User Role
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Select a new role for {user.name || user.email}:
            </p>

            <div className="space-y-2 mb-6">
              {ROLE_OPTIONS.map((role) => (
                <label
                  key={role.value}
                  className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-opacity-50"
                  style={{
                    borderColor:
                      selectedRole === role.value
                        ? "var(--primary)"
                        : "var(--card-border)",
                    backgroundColor:
                      selectedRole === role.value
                        ? "var(--primary-light)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div
                      className="font-medium text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {role.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {role.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowChangeRoleModal(false);
                  setSelectedRole(user.role);
                }}
                className="px-4 py-2 text-sm rounded-lg border"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={isLoading === "role" || selectedRole === user.role}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading === "role" ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showChangeStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Change Account Status
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Select a new status for {user.name || user.email}:
            </p>

            <div className="space-y-2 mb-6">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-opacity-50"
                  style={{
                    borderColor:
                      selectedStatus === status.value
                        ? "var(--primary)"
                        : "var(--card-border)",
                    backgroundColor:
                      selectedStatus === status.value
                        ? "var(--primary-light)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div
                      className="font-medium text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {status.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {status.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowChangeStatusModal(false);
                  setSelectedStatus(user.isDisabled ? "disabled" : "active");
                }}
                className="px-4 py-2 text-sm rounded-lg border"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={
                  isLoading === "status" ||
                  (selectedStatus === "disabled") === user.isDisabled
                }
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading === "status" ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Reset User Password
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Are you sure you want to reset the password for{" "}
              {user.name || user.email}? They will need to use the new password
              to log in.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-sm rounded-lg border"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={isLoading === "reset"}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading === "reset" ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
