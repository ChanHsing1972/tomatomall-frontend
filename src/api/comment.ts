import { axios } from "../utils/request";
import { COMMENT_MODULE } from "./_prefix";

type addCommentInfo = {
    productId: string;
    userId: string;
    content: string;
    parentId: string;
};

export const addComment = (addCommentInfo: addCommentInfo) => {
    console.log(addCommentInfo);
    return axios.post(`${COMMENT_MODULE}`, addCommentInfo);
};

export const getAllCommentsByProductId = (productId: string) => {
    return axios.get(`${COMMENT_MODULE}/${productId}`);
};

export const getAllCommentsByUserId = (userId: string) => {
    return axios.get(`${COMMENT_MODULE}/${userId}`);
};

type likeInfo = {
    commentId: string;
    isLike: boolean;
    userId: string;
};

export const likeOrDislike = (likeInfo: likeInfo) => {
    return axios.post(`${COMMENT_MODULE}/like`, likeInfo)
        .then(res => {
            if (res.data.code === '200') {
                console.log(res.data.msg);
                return res.data.data;
            } else {
                console.error('操作失败:', res.data.msg);
                throw new Error(res.data.msg);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
            throw error;
        });
};

export const deleteComment = (commentId: string) => {
    console.log(commentId);
    return axios.delete(`${COMMENT_MODULE}/${commentId}`);
};