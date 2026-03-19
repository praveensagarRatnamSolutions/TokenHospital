import api from "@/services/api";



export const registerAdmin = async (data: any) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};