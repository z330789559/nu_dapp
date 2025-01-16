import {Button, Cell, Image, Input, NavBar, Notify, Toast} from "@nutui/nutui-react";
import {ArrowLeft} from "@nutui/icons-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAccount, useNetwork} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {createShelve, fetchTokenList,getUserBalance} from "../../api/api.js";
import {numberToFixed} from "../../utils/common.js";
import nubtIcon from "../../assets/icons/nubt.png";
import styles from './index.module.css'
import BigNumber from "bignumber.js";

export default function PostProductPage() {
  const navigate = useNavigate();
  const {chain} = useNetwork()
  const {openConnectModal} = useConnectModal()
  const [loading, setLoading] = useState(false);
  const {address} = useAccount();
  const [price, setPrice] = useState('0')
  const [count, setCount] = useState('0')
  const [btcToken, setBtcToken] = useState({})
  const [nubtToken, setNuBtcToken] = useState({})
  const [wallet, setWallet] = useState({})

  const [totalBtcPrice, setTotalBtcPrice] = useState(0.00);
  const [totalUsdPrice, setTotalUsdPrice] = useState(0.00);
  const [gasFee, setGasFee] = useState(0.0);

  useEffect(() => {
    getTokenList()
    fetchUserBalance();
  }, [])


  const fetchUserBalance = async () => {
    if (!address) return
    const result = await getUserBalance(address.toLowerCase())
    setWallet(result)
  }
  const getTokenList = async () => {
    const res = await fetchTokenList();
    const btc = res.find(item => item.id === 2)
    setBtcToken(btc)
    setNuBtcToken(res.find(item => item.id === 1))
  }

  const onCreateShelve = async () => {
    try {
      if (!chain || !address) {
        openConnectModal();
        return
      }
      if (chain && chain.unsupported) {
        Toast.show('链接错误');
        return;
      }
      if (parseFloat(count) <= 0 || parseFloat(price) <= 0) {
        Toast.show('数量或价格不能为0')
        return;
      }
      setLoading(true)
      await createShelve(address.toLowerCase(), price, count)
      setLoading(false)
      Notify.success('铭文上架成功')
      navigate(-1)
    } catch (e) {
      setLoading(false)
      Notify.danger(e.message)
    }
  }

  useEffect(() => {
    const resultBtc = numberToFixed(new BigNumber(price).multipliedBy(new BigNumber(count)).multipliedBy(new BigNumber(btcToken.usdPrice)), 8)
    setTotalBtcPrice(resultBtc === null ? 0.00 : resultBtc)
    const resultUsd = numberToFixed(new BigNumber(price ?? 0).multipliedBy(new BigNumber(count ?? 0)), 8)
    setTotalUsdPrice(resultUsd === null ? 0.00 : resultUsd)
    const resultGas = numberToFixed(resultUsd * (btcToken.sellGasFee ?? 0), 2)
    if (resultGas > 100) {
      setGasFee(100.00)
    } else {
      setGasFee(resultGas)
    }

  }, [price, count, btcToken])

  return (
    <div>
      <NavBar fixed back={<ArrowLeft/>} titleAlign='left' onBackClick={() => navigate(-1)}>
        <span>上架铭文</span>
      </NavBar>
      <div className={styles.container}></div>
      <Cell.Group>
        <Cell>
  
          <div className={styles.fullColumn}>
          <div className={styles.fullRow}>
          <div className={styles.column}>
            商品预览
            </div>
            <div className={styles.column}>
            <div className={styles.value2}>地板价: ${nubtToken.marketCap}</div>
            </div>

            </div>
            <div className={styles.row}>  
              <Image src={nubtIcon} width='50px'/>
              <div className={styles.column}>
                <div className={styles.value}>数量：{count}</div>
                <div className={styles.value}>总价：{totalBtcPrice}</div>
                <div>≈ ${totalUsdPrice}</div>
              </div>
            </div>
          </div>

        </Cell>
        <Cell>
          <div className={styles.fullColumn}>
            <Input placeholder="设置价格" type='digit' onChange={(e) => setPrice(e === null ? '0.00': e)}/>
            <div>
              {wallet && wallet.btcBalance && wallet.btcBalance > 0 && <div>余额：{wallet.btcBalance} BTC, {wallet.nubtBalance} NT2N </div>}
            </div>
            <Input placeholder="输入上架的BT2N数量" type='digit' onChange={(e) => setCount(e === null ? '0.00': e)}/>
          </div>
        </Cell>
      </Cell.Group>
      <Cell>
        <div className={styles.fullRow}>
          <div className={styles.title}>Gas费</div>
          <div className={styles.column}>
            <div className={styles.value}>${gasFee}</div>
            <div className={styles.value2}>$100封顶</div>
          </div>
        </div>
      </Cell>
      <Button block style={{height: '44px', background: '#131313', marginTop: '40px'}} type="primary"
              loading={loading} onClick={onCreateShelve}>确定</Button>
    </div>
  )
}