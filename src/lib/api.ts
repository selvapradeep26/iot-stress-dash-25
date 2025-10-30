// src/lib/api.ts

// ----------------------
// 🌐 Base URLs (Render backend + Netlify frontend ready)
// ----------------------
const BASE_URL = "https://stressnet-backend-1.onrender.com";

const AUTH_API_URL = `${BASE_URL}/api/auth`;
const THINKSPEAK_API_URL = `${BASE_URL}/thinkSpeak`;
const USER_API_URL = `${BASE_URL}/api/users`;

// ----------------------
// 🧩 Interfaces
// ----------------------
export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GSRFeed {
  created_at: string;
  field1: string | number;
  heartRate?: number;
  stressLevel?: string;
}

// ----------------------
// ⚙️ ThingSpeak API
// ----------------------

// ✅ Get live ThingSpeak data (real-time)
export const fetchThingSpeakData = async (): Promise<GSRFeed[]> => {
  const res = await fetch(THINKSPEAK_API_URL);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch ThingSpeak data");
  }
  return res.json();
};

// ✅ Get user's saved historical data
export const fetchUserThingSpeakData = async (userId: string): Promise<GSRFeed[]> => {
  const res = await fetch(`${THINKSPEAK_API_URL}/user?userId=${userId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch user data");
  }
  return res.json();
};

// ✅ Save current reading to user's history
export const saveThingSpeakReading = async (
  userId: string,
  gsr: number,
  heartRate: number,
  token: string
): Promise<any> => {
  const res = await fetch(`${THINKSPEAK_API_URL}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, gsr, heartRate }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to save reading");
  }
  return res.json();
};

// ----------------------
// 👤 User Info API
// ----------------------
export interface UserProfile {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  occupation?: string;
  lastLogin: string;
}

// ✅ Get logged-in user's profile
export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const res = await fetch(`${USER_API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch user profile");
  }

  const data = await res.json();
  return { ...data, id: data.id || data._id };
};

// ✅ Update user's occupation
export const updateUserOccupation = async (
  id: string,
  occupation: string
): Promise<UserProfile> => {
  const res = await fetch(`${USER_API_URL}/updateOccupation/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ occupation }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update occupation");
  }

  const data = await res.json();
  return { ...data, id: data.id || data._id };
};
