import { api } from "./api";

export const get_admin_users = async () => {
  return await api.get("/admin/users");
};