import {axios} from "../utils/request";
import {PRODUCT_MODULE} from "./_prefix";

// 商品信息类型定义
export type CreateProductInfo = {
    title: string;
    price: string;
    rate: number;
    description: string;
    cover: string;
    detail: string;
    freeReading?: boolean;
    specifications: Spec[];
};
export type UpdateProductInfo = {
    title: string;
    description: string;
    price: string;
    rate: number;
    cover: string;
    detail: string;
    freeReading?: boolean;
    specifications: Spec[];
};

export type Spec = {
    id: string;
    item: string;
    value: string;
    productId: string;
};

export type UpdateStockpileInfo = {
    amount: number;
    operation?: "set" | "add";
};

// 创建商品
export const createProduct = (createProductInfo: CreateProductInfo) => {
    return axios
        .post(`${PRODUCT_MODULE}`, createProductInfo, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};

// 获取商品列表
export const getProductList = () => {
    return axios.get(`${PRODUCT_MODULE}`).then((res) => {
        return res;
    });
};

// 获取商品详情
export const getProductDetail = (id: string) => {
    return axios.get(`${PRODUCT_MODULE}/${id}`).then((res) => {
        return res;
    });
};

// 更新商品
export const updateProduct = (updateProductInfo: UpdateProductInfo) => {
    return axios.put(`${PRODUCT_MODULE}`, updateProductInfo, {
        headers: {"Content-Type": "application/json"},
    });
};

// 删除商品
export const deleteProduct = (id: string) => {
    return axios.delete(`${PRODUCT_MODULE}/${id}`);
};

// 更新库存
export const updateStockpile = (id: string, amount: number, operation: "set" | "add" = "set") => {
    const u: UpdateStockpileInfo = {
        amount: amount,
        operation,
    };
    return axios
        .patch(`${PRODUCT_MODULE}/stockpile/${id}`, u, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};

// 获取库存
export const getStockpile = (id: string) => {
    return axios.get(`${PRODUCT_MODULE}/stockpile/${id}`).then((res) => {
        return res;
    });
};

// 根据关键词搜索产品
export const searchProductsByKeyword = (keyword: string) => {
    return axios
        .get(`${PRODUCT_MODULE}/search`, {
            params: {keyword},
        })
        .then((res) => {
            return res;
        });
};
