import React, { useState, useEffect } from "react";
import client from "../api/client.jsx";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editSection, setEditSection] = useState("");
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Fetch user profile on mount
  async function fetchUser() {
    try {
      const res = await client.get("/api/users/me", { withCredentials: true });
      setUser(res.data.user);
      setForm({
        firstName: res.data.user.firstName || "",
        lastName: res.data.user.lastName || "",
        email: res.data.user.email || "",
        phonenumber: res.data.user.phonenumber || "",
        bio: res.data.user.bio || "",
        country: res.data.user.country || "",
        city: res.data.user.city || "",
        postalCode: res.data.user.postalCode || "",
        taxId: res.data.user.taxId || "",
        language: res.data.user.language || "",
        currency: res.data.user.currency || "",
        dateFormat: res.data.user.dateFormat || "",
        timezone: res.data.user.timezone || "",
      });
    } catch {
      setError("Failed to load profile.");
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle save
  const handleSave = async (section) => {
    setError("");
    setSuccess("");
    try {
      await client.put("/api/users/me", form, { withCredentials: true });
      setSuccess("Profile updated!");
      setEditSection("");
      // Optionally refetch user
      await fetchUser();
    } catch {
      setError("Failed to update profile.");
    }
  };

  // Handle password change
  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("All password fields are required.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    try {
      await client.post(
        "/api/users/change-password",
        {
          oldPassword: pwForm.oldPassword,
          newPassword: pwForm.newPassword,
        },
        { withCredentials: true }
      );
      setPwSuccess("Password updated successfully!");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(
        err?.response?.data?.message ||
          "Failed to update password. Please check your old password."
      );
    }
  };

  if (!user) {
    return <div className="text-gray-700 text-center mt-10">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your app's settings</p>

      <div className="bg-white rounded-2xl p-8 shadow mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col items-center md:items-start">
            <img
              src={user.profilepicture || "/default-avatar.png"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 mb-4"
            />
            <div className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-gray-500">{user.bio || "No bio"}</div>
            <div className="text-gray-500">
              {user.city || "City"}, {user.country || "Country"}
            </div>
          </div>
          {/* Editable Sections */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  Personal Information
                </span>
                <button
                  className="text-green-600 flex items-center gap-1"
                  onClick={() =>
                    setEditSection(editSection === "personal" ? "" : "personal")
                  }
                >
                  EDIT <span className="text-xl">✎</span>
                </button>
              </div>
              {editSection === "personal" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Last Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    name="phonenumber"
                    value={form.phonenumber}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Bio"
                  />
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg mt-2"
                    onClick={() => handleSave("personal")}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="text-gray-600 space-y-1">
                  <div>
                    First Name: <span className="text-gray-900">{user.firstName}</span>
                  </div>
                  <div>
                    Last Name: <span className="text-gray-900">{user.lastName}</span>
                  </div>
                  <div>
                    Email Address: <span className="text-gray-900">{user.email}</span>
                  </div>
                  <div>
                    Phone Number: <span className="text-gray-900">{user.phonenumber}</span>
                  </div>
                  <div>
                    Bio: <span className="text-gray-900">{user.bio || "-"}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">Address</span>
                <button
                  className="text-green-600 flex items-center gap-1"
                  onClick={() =>
                    setEditSection(editSection === "address" ? "" : "address")
                  }
                >
                  EDIT <span className="text-xl">✎</span>
                </button>
              </div>
              {editSection === "address" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Country"
                  />
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="City/State"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Postal Code"
                  />
                  <input
                    type="text"
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Tax ID"
                  />
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg mt-2"
                    onClick={() => handleSave("address")}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="text-gray-600 space-y-1">
                  <div>
                    Country: <span className="text-gray-900">{user.country || "-"}</span>
                  </div>
                  <div>
                    City/State: <span className="text-gray-900">{user.city || "-"}</span>
                  </div>
                  <div>
                    Postal Code: <span className="text-gray-900">{user.postalCode || "-"}</span>
                  </div>
                  <div>
                    Tax ID: <span className="text-gray-900">{user.taxId || "-"}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Account Preferences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  Account Preferences
                </span>
                <button
                  className="text-green-600 flex items-center gap-1"
                  onClick={() =>
                    setEditSection(editSection === "prefs" ? "" : "prefs")
                  }
                >
                  EDIT <span className="text-xl">✎</span>
                </button>
              </div>
              {editSection === "prefs" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="language"
                    value={form.language || ""}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Language"
                  />
                  <input
                    type="text"
                    name="currency"
                    value={form.currency || ""}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Currency"
                  />
                  <input
                    type="text"
                    name="dateFormat"
                    value={form.dateFormat || ""}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Date Format"
                  />
                  <input
                    type="text"
                    name="timezone"
                    value={form.timezone || ""}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-100 text-gray-900 mb-1 border border-gray-300"
                    placeholder="Timezone"
                  />
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg mt-2"
                    onClick={() => handleSave("prefs")}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="text-gray-600 space-y-1">
                  <div>
                    Language: <span className="text-gray-900">{user.language || "English"}</span>
                  </div>
                  <div>
                    Currency: <span className="text-gray-900">{user.currency || "USD"}</span>
                  </div>
                  <div>
                    Date and Time Format: <span className="text-gray-900">{user.dateFormat || "D/M/Y"}</span>
                  </div>
                  <div>
                    Timezone: <span className="text-gray-900">{user.timezone || "UTC+0"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Success/Error messages */}
        {success && <div className="text-green-600 mt-4">{success}</div>}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>

      {/* Two-factor Authentication - Coming Soon */}
      <div className="bg-white rounded-2xl p-8 shadow mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-factor Authentication</h2>
        <div className="text-gray-600 mb-2">
          <span className="italic text-yellow-500">Coming soon: Secure your account with SMS or Email authentication.</span>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-8 shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePwSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="password"
              name="oldPassword"
              value={pwForm.oldPassword}
              onChange={handlePwChange}
              placeholder="Old Password"
              className="flex-1 p-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300"
              autoComplete="current-password"
            />
            <input
              type="password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              placeholder="New Password"
              className="flex-1 p-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300"
              autoComplete="new-password"
            />
            <input
              type="password"
              name="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
              placeholder="Confirm New Password"
              className="flex-1 p-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Change Password
          </button>
        </form>
        {pwSuccess && <div className="text-green-600 mt-4">{pwSuccess}</div>}
        {pwError && <div className="text-red-500 mt-4">{pwError}</div>}
      </div>
    </div>
  );
}