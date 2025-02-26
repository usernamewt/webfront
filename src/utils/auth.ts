import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token:any) {
  return Cookies.set(TokenKey, `Bearer ${token}`)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}