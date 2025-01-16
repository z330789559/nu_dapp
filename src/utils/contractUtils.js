import {ethers} from "ethers";


export function getSignMessage(url) {
  const providerNew = new ethers.providers.Web3Provider(window.ethereum, 'any');
  const signer = providerNew.getSigner();
  return signer.signMessage(url);
}