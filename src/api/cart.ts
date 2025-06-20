import {axios} from "../utils/request";
import {CART_MODULE} from "./_prefix";

type ShippingAddress = {
    name: string;
    telephone: string;
    postalCode: string;
    address: string;
};

export type OrderInfo = {
    cartItemIds: string[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
};

type AddToCartInfo = {
    productId: string;
    quantity: number;
}

// 添加商品到购物车
export const addToCart = async (addToCartInfo: AddToCartInfo) => {
    return axios
        .post(
            `${CART_MODULE}`,
            addToCartInfo,
            {
                headers: {"Content-Type": "application/json"},
            }
        )
        .then((res) => {
            return res;
        });
};

// 从购物车删除商品
export const removeFromCart = async (cartItemId: string) => {
    return axios.delete(`${CART_MODULE}/${cartItemId}`).then((res) => {
        return res;
    });
};

// 更新购物车商品数量
export const updateCartItem = async (cartItemId: string, quantity: number) => {
    return axios
        .patch(
            `${CART_MODULE}/${cartItemId}`,
            {quantity},
            {
                headers: {"Content-Type": "application/json"},
            }
        )
        .then((res) => {
            return res;
        });
};

// 获取购物车列表
export const getCartList = async () => {
    return axios.get(`${CART_MODULE}`).then(res => res.data);

};

// 结算购物车
export const checkoutCart = async (orderInfo: OrderInfo) => {
    return axios
        .post(`${CART_MODULE}/checkout`, orderInfo, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};