import service from "../configs/request.js";
import {getCurrentAccessToken} from "../utils/storageUtils.js";


export async function unStakeRequest(account,id) {
    const token = getCurrentAccessToken(account);
    return new Promise((resolve, reject) => {
        service({
            url: '/pay/wallet-stake/unstake/'+id,
            method: 'PUT',
            headers: {'Authorization': 'Bearer ' + token},
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}


export async function  fetchStakeList(account,page) {
    const token = getCurrentAccessToken(account);
    return new Promise((resolve, reject) => {
        service({
            url: '/pay/wallet-stake/page',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
            params: {pageNo: page, pageSize: 20}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export async function getMyStake(account) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/pay/wallet-stake/get',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
            params: {}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export async function getRewardPool() {
    return new Promise((resolve, reject) => {
        service({
            url: '/pay/wallet-transaction/reward-summary',
            method: 'get',
            params: {}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}
export async function bindBrcAddress(account, address) {
    const token = getCurrentAccessToken(account);
    return new Promise((resolve, reject) => {
        service({
            url: '/member/user/bind-brc-address',
            method: 'post',
            headers: {'Authorization': 'Bearer ' + token},
            data: {'brcAddress': address}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export async function getDirectInvite(address) {
    const token = getCurrentAccessToken(address);
    return new Promise((resolve, reject) => {
        service({
            url: '/member/user/get-direct-invite',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
            params: {}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}


/// 获取铭文列表
export async function fetchProductList(tokenId, page) {
    return new Promise((resolve, reject) => {
        service({
            url: '/product/item/page',
            method: 'get',
            params: {token_id: tokenId, pageSize: 20, pageNo: page}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 获取币种列表
export async function fetchTokenList() {
    return new Promise((resolve, reject) => {
        service({
            url: '/product/token/list',
            method: 'get',
            params: {}
        }).then(response => {
            resolve(response)
    }).catch(error => {
            reject(error)
        })
    })
}

/// web3登录
export async function userLogin(address, signature) {
    return new Promise((resolve, reject) => {
        service({
            url: '/member/auth/web3-login',
            method: 'post',
            data: {'address': address, 'signature': signature}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export async function refreshToken(token) {
    return new Promise((resolve, reject) => {
        service({
            url: '/member/auth/refresh-token',
            method: 'post',
            params: {'refreshToken': token}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

//// 获取用户余额信息
export async function getUserBalance(account) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/pay/wallet/get',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
            data: {}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 购买铭文
export async function orderCreate(account, items, remark) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/trade/order/create',
            method: 'post',
            headers: {'Authorization': 'Bearer ' + token},
            data: {items: items, remark: remark}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 获取我的订单列表
export async function fetchUserOrderList(account, page) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/trade/order/item/page',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
            params: {pageNo: page, pageSize: 20}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 获取用户信息
export async function getUserDetail(account) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/member/user/get',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 获取我的邀请列表
export async function getInvitationList(account, pageNo) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/member/user/get-invitation',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
        params: {pageNo: pageNo || 1, pageSize: 20}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 获取网体列表
export async function fetchTeamList(account) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/member/user/get-team',
            method: 'get',
            headers: {'Authorization': 'Bearer ' + token},
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 绑定邀请码
export async function bindInvitationCode(account, code) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/member/user/bind',
            method: 'put',
            headers: {'Authorization': 'Bearer ' + token},
            data: {invitationCode: code}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export async function createStake(account,amount) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/pay/wallet-stake/create',
            method: 'post',
            headers: {'Authorization': 'Bearer ' + token},
            data: {price: amount,userType: 1}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 充值订单创建
export async function createPay(account, amount) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/pay/wallet-recharge/create',
            method: 'post',
            headers: {'Authorization': 'Bearer ' + token},
            data: {payPrice: amount}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 申请提现
export async function createWithdraw(account, amount,tokenType,address) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/pay/wallet-withdraw/create',
            method: 'post',
            headers: {'Authorization': 'Bearer ' + token},
            data: {price: amount, tokenType: tokenType, address: account,brcAddress:address}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 上架铭文
export async function createShelve(account, price, count) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/shelve/order/create',
            method: 'post',
            headers: {'Authorization': 'Bearer ' + token},
            data: {price: price, quantity: count}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

/// 下架铭文
export async function closeShelve(account, id) {
    return new Promise((resolve, reject) => {
        const token = getCurrentAccessToken(account);
        service({
            url: '/shelve/order/close',
            method: 'put',
            headers: {'Authorization': 'Bearer ' + token},
            params: {id: id}
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}