
const project = 'NUBT';
export function getCurrentAddress() {
    return localStorage.getItem(`${project}CurrentAddress`) || '';
}

export function setCurrentAddress(address) {
    return localStorage.setItem(`${project}CurrentAddress`, address);
}

export function getLoginResult(address) {
    return localStorage.getItem(`${project}LoginResult${address}`) || '{}';
}

export function setLoginResult(value, address) {
    return localStorage.setItem(`${project}LoginResult${address}`, value);
}

export function removeAllLoginResult() {
    Object.entries(localStorage).map(
      x => x[0]).filter(
      x => x.startsWith(`${project}LoginResult`)
    ).map(
      x => localStorage.removeItem(x)
)
}
export function getCurrentAccessToken(address) {
    address=address||"";
    const loginResult = JSON.parse(getLoginResult(address.toLocaleLowerCase()));
    return loginResult.accessToken;
}