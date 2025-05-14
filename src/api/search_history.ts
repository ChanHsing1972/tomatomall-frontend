import {axios} from "../utils/request";
import {SEARCH_HISTORY_MODULE} from "./_prefix";

export type SearchHistory = {
    id: number;
    query: string;
    createdAt?: string;
};

// 获取搜索历史
export const getSearchHistory = async () => {
    return axios.get(`${SEARCH_HISTORY_MODULE}`).then((res) => {
        return res
    });
};

// 保存搜索历史
export const saveSearchHistory = async (query: string) => {
    return axios.post(`${SEARCH_HISTORY_MODULE}`, {query}).then((res) => {
        return res
    });
};

// 清空搜索历史
export const clearSearchHistory = async () => {
    return axios.delete(`${SEARCH_HISTORY_MODULE}`).then((res) => {
        return res
    });
};