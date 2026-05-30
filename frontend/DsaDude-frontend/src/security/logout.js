import { clearAuthToken }
from "../utils/api";

export default function logout(navigate, setUser) {
  try {
    // remove token
    clearAuthToken();

    // clear context
    setUser(null);

    // redirect
    navigate("/");

  } catch (e) {
    console.error(
      "Logout error:",
      e
    );
  }
}