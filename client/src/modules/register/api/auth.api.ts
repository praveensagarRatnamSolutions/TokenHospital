import api from "@/services/api";



export const registerAdmin = async (data: any) => {
  const res = await api.post("/auth/admin-signup", data);
  return res.data;
};