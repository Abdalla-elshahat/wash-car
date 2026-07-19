import Cookies from "js-cookie";
export const  Domain = "http://localhost:3000";
export const token=Cookies.get("token") || "";