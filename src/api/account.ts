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
    avatar?: string,//头像链接
}

//更新昵称，密码，地址,邮箱，头像
type UpdateInfo = {
    name?: string,
    password?: string,
    location?: string,
    email?: string,
    avatar?: string,
}

// 如果有“Vue: This may be converted to an async function”警告，可以不管
// 用户登录
export const accountLogin = (loginInfo: LoginInfo) => {
    const params = new URLSearchParams();
    params.append("username", loginInfo.username);
    params.append("password", loginInfo.password);
    return axios.post(`${ACCOUNT_MODULE}/login`, params); // 默认是 FormData
};

// 用户注册
export const accountRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`${ACCOUNT_MODULE}`, registerInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取用户信息
export const accountInfo = (username: string) => {
    return axios.get(`${ACCOUNT_MODULE}/${username}`)
        .then(res => {
            return res;
    })
}

// 更新用户信息
export const accountInfoUpdate = (updateInfo: UpdateInfo) => {
    return axios.put(`${ACCOUNT_MODULE}`, updateInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}
