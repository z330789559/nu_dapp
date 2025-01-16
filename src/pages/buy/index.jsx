import {useAccount, useNetwork} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import React, {useState} from "react";
import {Button, Cell, Image, NavBar, Notify, Toast} from "@nutui/nutui-react";
import {orderCreate} from "../../api/api.js";
import {useLocation, useNavigate} from "react-router-dom";
import {numberToFixed} from "../../utils/common.js";
import BigNumber from "bignumber.js";
import {ArrowLeft} from "@nutui/icons-react";
import styles from './index.module.css'

export default function BuyPage() {
  const location = useLocation()
  const navigate = useNavigate();
  const [product] = useState(location.state.product)
  const [token] = useState(location.state.token)
  const {chain} = useNetwork()
  const {address} = useAccount()
  const {openConnectModal} = useConnectModal()
  const [loading, setLoading] = useState(false);

  const confirmBuy = async () => {
    try {
      if (!chain || !address) {
        openConnectModal();
        return
      }
      if (chain && chain.unsupported) {
        Toast.show('链接错误');
        return;
      }

      setLoading(true)
      await orderCreate(address.toLowerCase(), [{itemId: product.id, quantity: 1}], '')
      setLoading(false)
      Notify.success('购买成功')
      navigate(-1)
    } catch (e) {
      setLoading(false)
      Notify.danger(e.message)
    }
  }

  const makeGasFee = () => {
    const result = numberToFixed(new BigNumber(token.buyGasFee).multipliedBy(product.usdtTotalPrice), 2)
    if (result > 50) {
      return 50.00
    }
    return result
  }

  return (
    <>
      <NavBar fixed back={<ArrowLeft/>} titleAlign='left' onBackClick={() => navigate(-1)}>
        <span>确认购买</span>
      </NavBar>
      <div className={styles.container}>
        <Cell>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Image src={product.thumb} width='50px'/>
            <div style={{marginLeft: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div className={styles.value}>{product.stock}</div>
              <div className={styles.title}>{product.name}</div>
            </div>
          </div>
        </Cell>
        <Cell.Group>
          <Cell>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px', width: '100%'}}>
              <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className={styles.title}>价格</div>
                <div className={styles.value}>{product.totalPrice})
                </div>
              </div>
              <div style={{display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'center'}}>
                <div className={styles.value2}>${numberToFixed(product.usdtTotalPrice, 2)}</div>
              </div>
            </div>
          </Cell>
          <Cell>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px', width: '100%'}}>
              <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className={styles.title}>Gas费</div>
                <div className={styles.value}>${makeGasFee()}</div>
              </div>
              <div style={{display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'center'}}>
                <div className={styles.title}>$50封顶</div>
              </div>
            </div>
          </Cell>
        </Cell.Group>
        <Button block style={{height: '44px', background: '#131313', marginTop: '40px'}} type="primary"
                loading={loading} onClick={confirmBuy}>立即购买</Button>
      </div>
    </>
  );
}