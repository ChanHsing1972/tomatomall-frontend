import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// 创建一个 MockAdapter 实例
const mock = new MockAdapter(axios);

// 模拟用户列表数据
let users = [
  {
    id: 1,
    name: "测试用户",
    username:"test_admin",
    avatar:"test_avatar",
    telephone: "18888888888",
    password: "1",
    email:"test_email",
    location: "测试地址",
    createTime: "2025-02-26T12:00:00.000Z",
    role: "MANAGER",
  },
];

// 模拟登录请求
mock.onPost("/api/accounts/login").reply((config) => {
  const body = JSON.parse(config.data);
  const user = users.find((user) => user.username === body.username);
  if (user && user.password === body.password) {
    return [200, { code: "000", msg: "登录成功", result: { ...user, token: "mock-token" } }];
  } else if (user && user.password !== body.password) {
    return [200, { code: "404", msg: "密码错误", result: null }];
  } else {
    return [200, { code: "404", msg: "用户未找到", result: null }];
  }
});

// 模拟返回用户信息请求
mock.onGet("/api/accounts").reply(200, {
  code: "000",
  result: users[0], // 返回第一个用户的信息
});

// // 模拟注册请求
// mock.onPost("/api/accounts/register").reply((config) => {
//   const body = JSON.parse(config.data);
//   const newUser = {
//     id: users.length + 1,
//     name: body.name,
//     phone: body.phone,
//     password: body.password,
//     storeId: 1,
//     storeName: "",
//     address: body.address,
//     createTime: new Date().toISOString(),
//     role: body.role,
//   };
//   users.push(newUser);
//   return [200, { code: "000", msg: "注册成功", result: newUser }];
// });