import { axios } from "../utils/request";
import { ORDER_MODULE } from "./_prefix";

// 类型定义
export type OrderStatus = "PENDING" | "TRADE_SUCCESS" | "CANCELLED";

export type ShippingAddress = {
    name: string;
    telephone: string;
    postalCode: string;
    address: string;
};

export type OrderItem = {
    productId: string;
    productName: string;
    quantity: number;
    price: string;
    imageUrl?: string;
};

// 对应 OrderVO
export type OrderVO = {
    cartItemIds?: string[];  // 仅用于创建订单时使用
    orderId: string;         // 订单ID
    userId: string;          // 用户ID
    totalAmount: string;     // 订单总金额
    paymentMethod?: string;  // 支付方式
    createTime: string;      // 创建时间
    status: OrderStatus;     // 订单状态
    shippingAddress: ShippingAddress; // 收货地址
    orderItems: string[];    // 订单商品项ID列表
};

// 对应后端 ResultVO 包装
export type ResultVO<T> = {
    code: number;
    message: string;
    data: T;
};

// 支付响应类型
export type PaymentResponse = {
    paymentForm: any;       // 支付表单HTML或数据
    orderId: number;        // 订单ID
    totalAmount: string;    // 支付金额
    paymentMethod: string;  // 支付方式
    paymentUrl?: string;    // 可选支付URL（如果有直接跳转链接）
};

/**
 * 获取当前用户所有订单
 * 对应后端：@GetMapping()
 * @returns 包装在ResultVO中的订单列表
 */
export const getOrders = (): Promise<ResultVO<OrderVO[]>> => {
    return axios.get(`${ORDER_MODULE}`)
        .then(res => res.data);
};

/**
 * 生成订单支付
 * 对应后端：@PostMapping("/{orderId}/pay")
 * @param orderId 订单ID（后端接收Integer）
 * @returns 包装在ResultVO中的支付响应
 */
export const payOrder = (orderId: number): Promise<ResultVO<PaymentResponse>> => {
    return axios.post(`${ORDER_MODULE}/${orderId}/pay`)
        .then(res => res.data);
};

/**
 * 处理支付宝异步通知
 * 对应后端：@PostMapping("/notify")
 * @param params 支付宝回调参数
 */
export const handleAlipayNotify = (params: Record<string, string>): Promise<void> => {
    return axios.post(`${ORDER_MODULE}/notify`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
};

/**
 * 创建订单
 * 注意：根据您的Controller可能需要添加
 * @param orderData 订单数据
 */
export const createOrder = (orderData: Partial<OrderVO>): Promise<ResultVO<OrderVO>> => {
    return axios.post(`${ORDER_MODULE}`, orderData)
        .then(res => res.data);
};