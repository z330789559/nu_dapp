import React, {useEffect, useState} from "react";
import {ConnectButton} from '@rainbow-me/rainbowkit';
import {walletAutograph} from "../../utils/walletUtils";
import {
  getCurrentAddress, getLoginResult, setCurrentAddress,
  setLoginResult
} from "../../utils/storageUtils";
import {refreshToken, userLogin} from "../../api/api.js";
import {Button} from "@nutui/nutui-react";
import {Wallet} from "@nutui/icons-react";
import {useAtom} from "helux";
import {loginAtom} from "../../hooks/index.jsx";

export const loginAction = async function () {
 
  const address = getCurrentAddress();
  const signStr = `Welcome to Scorpio!\n\nClick to sign in and accept the Scorpio Terms of Service \n\nYour authentication status will reset after 1 days.\n\nWallet address:\n${address}`;
  const signResult = await walletAutograph(signStr);
  if (signResult && address) {
    const result = await userLogin(address, signResult);
    setLoginResult(JSON.stringify(result), address)
  }
}

export const refreshTokenAction = async function () {
  const address = getCurrentAddress();
  if (!address) return;

  const loginResult = JSON.parse(getLoginResult(address));
  // if(!loginResult||!loginResult.refreshToken) {
  //   return 
  // }
  const result = await refreshToken(loginResult.refreshToken);
  setLoginResult(JSON.stringify(result), address)
}

const AppWalletConnectButton = () => {
  const [address, setAddress] = useState(null);
  const [login, setLogin] = useAtom(loginAtom);

  useEffect( () => {
    if (!address) return;
    if (address.toLowerCase() !== getCurrentAddress()) {
      setCurrentAddress(address.toLowerCase());
    }

    const loginResult = getLoginResult(address.toLowerCase())
    if (loginResult && loginResult!="{}") return
    loginAction().then(() => {
      setLogin(true)
    })
  }, [address])

  return (<div style={{display: 'flex', justifyContent: 'flex-end', padding: 0,}}>
    <ConnectButton.Custom>
      {({account, chain, openAccountModal, openChainModal, openConnectModal, mounted,}) => {
        return (<div
          {...(!mounted && {
            'aria-hidden': true, 'style': {
              opacity: 0, pointerEvents: 'none', userSelect: 'none',
            },
          })}
        >
          {(() => {
            if (!mounted || !account || !chain) {
              return (
                <Button
                  fill="outline"
                  onClick={openConnectModal}
                  icon={<Wallet width="20"/>}
                />
              );
            }

            if (chain.unsupported) {
              return (
                <div style={{display: 'flex'}}>
                  <Button xs={'true'} variant="red" style={{textTransform: 'none', minWidth: '120px'}}
                          onClick={openChainModal}>
                    {"链接错误"}
                  </Button>
                </div>
              );
            }
            setAddress(account.address);
            return (<div style={{display: 'flex'}}>
              <div className={'network_btn'}>
                <Button onClick={openChainModal} icon={chain.hasIcon && (
                  <div>
                    {chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        width={15}
                        height={15}
                      />
                    )}
                  </div>
                )}>
                  {chain.id === 97 ? 'BscTest' : chain.name}
                </Button>
              </div>

              <div style={{marginLeft: '5px'}}>
                <Button onClick={openAccountModal}>
                  {account.displayName}
                </Button>
              </div>
            </div>);
          })()}
        </div>);
      }}
    </ConnectButton.Custom>
  </div>);
}
export default AppWalletConnectButton;