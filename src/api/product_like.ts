import {axios} from "../utils/request";
import {PRODUCTLIKE_MODULE} from "./_prefix";

export type LikeInfo ={productId:string,username:string};

export const addLike = (productId: string) => {
    return axios
        .post(`${PRODUCTLIKE_MODULE}/like`, { productId }, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};

export const cancelLike = (productId: string) => {
    return axios
        .post(`${PRODUCTLIKE_MODULE}/unlike`, { productId }, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};
export const getLikeCount=(productId:string)=>{
    return axios
        .get(`${PRODUCTLIKE_MODULE}/count`, {
            params: {productId},
        })
        .then((res) => {
            return res;
        });
}

//获得用户所有收藏书籍
export const getLikeList = () => {
    return axios
        .get(`${PRODUCTLIKE_MODULE}/list`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}` // 添加认证头
            }
        })
        .then((res) => {
            return res;
        });
};

