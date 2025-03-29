import {axios} from '../utils/request'
import {ACCOUNT_MODULE} from './_prefix'

type LoginInfo = {
    username: string,
    password: string
}

type RegisterInfo = {
    username: string,//用户名
    telephone: string,//手机号
    password: string,//密码
    name: string,//昵称
    location: string,//地址
    role: string,//身份
    email?: string,//邮箱
    avator?: string,//头像链接
}
//更新昵称，密码，地址,邮箱，头像
type UpdateInfo = {
    name?: string,
    password?: string,
    location?: string,
    email?: string,
    avator?: string,
}

// 如果有“Vue: This may be converted to an async function”警告，可以不管
// 用户登录
export const accountLogin = (loginInfo: LoginInfo) => {
    return axios.post(`${ACCOUNT_MODULE}/login`, loginInfo, {
        headers: { 'Content-Type': 'application/json' },
    }).then(res => {
        return res;
    });
};

// 用户注册
export const accountRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`${ACCOUNT_MODULE}/register`, registerInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取用户信息
export const accountInfo = () => {
    return axios.get(`${ACCOUNT_MODULE}`)
        .then(res => {
            return res
        })
}

// 更新用户信息
export const accountInfoUpdate = (updateInfo: UpdateInfo) => {
    return axios.post(`${ACCOUNT_MODULE}`, updateInfo, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}
