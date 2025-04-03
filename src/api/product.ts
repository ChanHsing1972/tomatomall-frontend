import { axios } from "../utils/request"; // 确保已经创建了 request.ts 文件并配置了 axios 实例
import { PRODUCT_MODULE } from "./_prefix"; // 假设您已经定义了产品模块的基础路径

// 商品信息类型定义
type CreateProductInfo = {
  id: string;
  title: string;
  price: string;
  rate: number;
  description: string;
  cover: string;
  detail: string;
  specifications: Spec[];
};
type UpdateProductInfo = {
  id: string;
  title: string;
  description: string;
  price: string;
  rate: number;
  cover: string;
  detail: string;
  specifications: Spec[];
};

type Spec = {
  id: string;
  item: string;
  value: string;
  productId: string;
};

// 创建商品
export const createProduct = (createProductInfo: CreateProductInfo) => {
  console.log(createProductInfo);
  return axios
    .post(`${PRODUCT_MODULE}`, createProductInfo, {
      headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
  });
};

// 删除商品
export const deleteProduct = (id: string) => {
  return axios.delete(`${PRODUCT_MODULE}/${id}`);
};

// 更新库存
export const updateStockpile = (id: string, amount: number) => {
  return axios
    .post(`${PRODUCT_MODULE}/stockpile/${id}?amount=${amount}`, null, {
      headers: { "Content-Type": "application/json" },
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
