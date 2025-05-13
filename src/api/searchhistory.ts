import { axios } from "../utils/request";

export type SearchHistory = {
    query: string;
    createdAt?: string;
};

// 获取搜索历史
export const getSearchHistory = async () => {
    return axios.get("/api/search-history").then((res) => res.data);
};

// 保存搜索历史
export const saveSearchHistory = async (query: string) => {
    return axios.post("/api/search-history", { query });
};

// 清空搜索历史
export const clearSearchHistory = async () => {
    return axios.delete("/api/search-history");
};