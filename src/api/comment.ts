import {axios} from "../utils/request";
import {COMMENT_MODULE} from "./_prefix";

type AddCommentInfo = {
    productId: string;
    username: string;
    content: string;
    parentId?: string;
};

type LikeInfo = {
    commentId: string;
    username: string;
    isLike: boolean;
};

/**
 * 添加评论
 * @param addCommentInfo 评论信息
 */
export const addComment = (addCommentInfo: AddCommentInfo) => {
    return axios.post(`${COMMENT_MODULE}`, addCommentInfo)
        .then(res => res.data);
};

/**
 * 根据商品ID获取评论
 * @param productId 商品ID
 */
export const getAllCommentsByProductId = (productId: string) => {
    return axios.get(`${COMMENT_MODULE}`, {
        params: {productId}
    }).then(res => res.data);
};

/**
 * 点赞或取消点赞评论
 * @param likeInfo 点赞信息
 */
export const likeOrDislike = (likeInfo: LikeInfo) => {
    return axios.post(`${COMMENT_MODULE}/like`, null, {
        params: {
            commentId: likeInfo.commentId,
            username: likeInfo.username,
            isLike: likeInfo.isLike
        }
    }).then(res => res.data);
};

/**
 * 删除评论
 * @param commentId 评论ID
 */
export const deleteComment = (commentId: string) => {
    return axios.delete(`${COMMENT_MODULE}/${commentId}`)
        .then(res => res.data);
};

/**
 * 检查用户是否点赞了评论
 * @param commentId 评论ID
 * @param username 用户名
 */
export const isLikeComment = (commentId: string, username: string) => {
    return axios.get(`${COMMENT_MODULE}/islike`, {
        params: {commentId, username}
    }).then(res => res.data);
};