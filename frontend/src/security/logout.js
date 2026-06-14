import { signout } from "../utils/auth-apis";

export default function logout(navigate, setUser) {
  try {
    // remove token
    signout();
    
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
