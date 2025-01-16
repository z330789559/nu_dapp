import {getSignMessage} from './contractUtils';


/**
 * @param signStr
 * @return signResult string
 */
export async function walletAutograph(signStr) {
    if (!window.ethereum) return;
    return getSignMessage(signStr)
}