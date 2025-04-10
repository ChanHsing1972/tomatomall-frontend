import { axios } from "../utils/request";
import { ORDER_MODULE } from "./_prefix";

// 订单支付
export const orderPay = (orderId: number) => {
    return axios
        .post(`${ORDER_MODULE}/${orderId}/pay`, null, {
            headers: { "Content-Type": "application/json" },
        })
        .then((res) => {
            return res;
        });
};

// 处理支付宝回调
export const handleAlipayNotify = (notifyData: any) => {
    return axios
        .post(`${ORDER_MODULE}/notify`, notifyData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((res) => {
            return res;
        });
};

// 获取订单详情
export const getOrderDetail = (orderId: string) => {
    return axios.get(`${ORDER_MODULE}/${orderId}`).then((res) => {
        return res;
    });
};

// 更新订单状态
export const updateOrderStatus = (orderId: string, status: string) => {
    return axios
        .put(
            `${ORDER_MODULE}/${orderId}/status`,
            { status },
            {
                headers: { "Content-Type": "application/json" },
            }
        )
        .then((res) => {
            return res;
        });
};