import {axios} from "../utils/request";
import {COUPON_MODULE} from "./_prefix";

// 优惠券VO
export interface CouponVO {
    id?: number;
    name: string;
    type: string; // DISCOUNT(折扣), FIXED(满减), DIRECT(直减)
    value: number; // 折扣值或金额
    minimumSpend: number; // 最低消费金额
    startDate: string;
    endDate: string;
    isActive: boolean;
    maxQuantity?: number; // 最大发放数量
    description: string;
}

// 用户优惠券VO
export interface UserCouponVO {
    id: number;
    userId?: number;
    orderId?: number;
    name: string; // 优惠券名称
    coupon: CouponVO;
    receiveTime: string;
    useTime?: string;
    status: string; // UNUSED(未使用), USED(已使用), EXPIRED(已过期)
    type: string; // DISCOUNT(折扣), FIXED(满减), DIRECT(直减)
    value: number; // 折扣值或金额
    minimumSpend: number; // 最低消费金额
    description: string; // 优惠券描述
    endDate: string; // 优惠券结束时间
}

// 获取当前可领取的优惠券
export const getActiveCoupons = () => {
    return axios.get(`${COUPON_MODULE}`).then((res) => res.data);
};

// 用户领取优惠券
export const claimCoupon = (couponId: number) => {
    return axios
        .post(`${COUPON_MODULE}/${couponId}/claim`)
        .then((res) => res.data);
};

// 获取用户的优惠券
export const getUserCoupons = (status?: string) => {
    const params = status ? {status} : {};
    return axios.get(`${COUPON_MODULE}/user`, {params}).then((res) => res.data);
};

// 管理员接口 - 创建优惠券
export const createCoupon = (couponVO: CouponVO) => {
    return axios.post(`${COUPON_MODULE}/admin`, couponVO).then((res) => res.data);
};

// 管理员接口 - 更新优惠券
export const updateCoupon = (id: number | string, couponVO: CouponVO) => {
    return axios
        .put(`${COUPON_MODULE}/admin/${id}`, couponVO)
        .then((res) => res.data);
};

// 管理员接口 - 获取所有优惠券
export const getAllCoupons = () => {
    return axios.get(`${COUPON_MODULE}/admin`).then((res) => res.data);
};

// 应用优惠券到订单
export const applyCouponToOrder = (orderId: number, userCouponId: number) => {
    return axios
        .post(`/api/orders/${orderId}/coupons/${userCouponId}`)
        .then((res) => res.data);
};

// 从订单移除优惠券
export const removeCouponFromOrder = (orderId: number) => {
    return axios.delete(`/api/orders/${orderId}/coupons`).then((res) => res.data);
};
