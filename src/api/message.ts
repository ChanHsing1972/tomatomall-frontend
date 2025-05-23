import {axios} from "../utils/request";
import {MESSAGE_MODULE} from "./_prefix";

// 发送私信
export const sendMessage = (receiverId: number, content: string) => {
    return axios
        .post(`${MESSAGE_MODULE}`, null, {
            params: {
                receiverId,
                content,
            },
        })
        .then((res) => res.data);
};

// 获取与特定用户的对话
export const getConversation = (userId: number) => {
    return axios
        .get(`${MESSAGE_MODULE}/conversation/${userId}`)
        .then((res) => res.data);
};

// 获取最近聊天列表
export const getRecentChats = () => {
    return axios.get(`${MESSAGE_MODULE}/recent`).then((res) => res.data);
};

// 标记消息为已读
export const markAsRead = (messageId: number) => {
    return axios
        .post(`${MESSAGE_MODULE}/${messageId}/read`)
        .then((res) => res.data);
};

// 获取未读消息数
export const getUnreadCount = () => {
    return axios.get(`${MESSAGE_MODULE}/unread/count`).then((res) => res.data);
};

// 删除消息
export const clearChat = (otherUserId: number) => {
    return axios
        .delete(`${MESSAGE_MODULE}`, {
            params: {
                otherUserId,
            },
        })
        .then((res) => res.data);
};
