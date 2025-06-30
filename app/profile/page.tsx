"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (session?.user) {
      // Use functional update to avoid dependency on formData
      setFormData((prevData) => ({
        ...prevData,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]); // No need to include formData now

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Validate passwords match if provided
      if (
        formData.newPassword &&
        formData.newPassword !== formData.confirmPassword
      ) {
        setMessage({ text: "New passwords do not match", type: "error" });
        setIsLoading(false);
        return;
      }

      const result = await updateProfile(formData);

      if (result.success) {
        setMessage({ text: "Profile updated successfully", type: "success" });
        // Update the session to reflect changes
        update();
      } else {
        setMessage({
          text: result.message || "Failed to update profile",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
      <h1 className="text-3xl font-bold mb-6 themed-span-primary">
        Your Profile
      </h1>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="themed-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="themed-input"
          />
        </div>

        <div>
          <label htmlFor="email" className="themed-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="themed-input"
          />
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 themed-span-primary">
            Change Password
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Leave blank if you don&apos;t want to change your password
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="themed-label">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="themed-input"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="themed-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="themed-input"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="themed-label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="themed-input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="form-button w-full py-3 flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="themed-spinner themed-spinner-sm mr-2"></div>
              <span>Updating...</span>
            </>
          ) : (
            "Update Profile"
          )}
        </button>
      </form>
    </div>
  );
}
