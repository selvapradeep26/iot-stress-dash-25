// src/lib/api.ts

const AUTH_API_URL = "http://localhost:5000/api/auth"; // auth backend
const THINKSPEAK_API_URL = "http://localhost:5000/thinkSpeak"; // ThingSpeak backend
const USER_API_URL = "http://localhost:5000/api/users"; // ✅ added for user operations

// ----------------------
// Interfaces
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

// ----------------------
// ThingSpeak API
// ----------------------
export interface GSRFeed {
  created_at: string;
  field1: string; // raw GSR value from ThingSpeak
  stressLevel?: string; // optional computed stress label for UI
}

export const fetchThingSpeakData = async (): Promise<GSRFeed[]> => {
  const res = await fetch(THINKSPEAK_API_URL);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch ThingSpeak data");
  }

  return res.json();
};

// ----------------------
// User Info API
// ----------------------
export interface UserProfile {
  id: string; // ✅ added
  username: string;
  email: string;
  occupation: string;
  lastLogin: string;
}

export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const res = await fetch(`${USER_API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch user profile");
  }

  return res.json();
};

// ✅ (Optional) Update Occupation Helper
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
    const error = await res.json();
    throw new Error(error.message || "Failed to update occupation");
  }

  return res.json();
};
