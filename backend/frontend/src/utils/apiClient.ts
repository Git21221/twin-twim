import { useNavigate } from "react-router-dom"

// apiClient.ts
const apiClient = async (url: string, options: RequestInit = {}) => {
  const navigate = useNavigate(); // This should ideally be used inside a component or hook
  console.log("Calling API with URL:", url); // Debugging line
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}${url}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401 || response.status === 403) {
      navigate("/login");
      throw new Error("Unauthorized");
    }

    console.log("API response:", response); // Debugging line
    return response; // Return the response for further processing
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Rethrow the error for handling in thunks
  }
};


export default apiClient;