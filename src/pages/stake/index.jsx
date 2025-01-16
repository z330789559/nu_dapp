import {Button, Cell, Image, Input, NavBar, Notify, Toast} from "@nutui/nutui-react";
import {ArrowLeft, Copy} from "@nutui/icons-react";
import React, {useEffect, useState} from "react";
import { useLocation } from 'react-router-dom';
import {useNavigate} from "react-router-dom";
import {useAccount, useNetwork} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import Web3 from "web3";
import {createStake, fetchTokenList} from "../../api/api.js";
import {numberToFixed} from "../../utils/common.js";
import btcLargeIcon from "../../assets/icons/btc_large.png";
import nuBtcIcon from "../../assets/icons/nubt.png";
import styles from './index.module.css'

export default function RechargePage() {
  const navigate = useNavigate();
  const {chain} = useNetwork()
  const {openConnectModal} = useConnectModal()
  const [loading, setLoading] = useState(false);
  const {address} = useAccount();
  const [amount, setAmount] = useState('0')
  const [btcToken, setBtcToken] = useState({})
  const [nubtToken, setNuBtcToken] = useState({})
  const location=useLocation();
  const {state}=location;
  const balance = state ? state.balance : 0;
  useEffect(() => {
    getTokenList()
  }, [])


  const getTokenList = async () => {
    const res = await fetchTokenList();
    const btc = res.find(item => item.id === 2)
    const nubt = res.find(item => item.id === 1)
    setBtcToken(btc)
    setNuBtcToken(nubt)
  }

const requestStake = async () => {
  if (!chain || !address) {
    openConnectModal();
    return
  }
  if (parseFloat(amount) <= 1000) {
    Notify.danger('质押金额不能小于1000')
    return;
  }
  setLoading(true)
  try{
  const res = await createStake(address.toLowerCase(), amount)
      if (res&& res.id>0) {
        Notify.success('质押成功')
        navigate(-1)
       }
    }catch(e){
      Notify.danger(e.message)
    }finally{
      setLoading(false)
    }

}
const navigateTo=()=>{
  navigate('/redeem')
}

  return (
    <div>
      <NavBar fixed back={<ArrowLeft/>} titleAlign='left' onBackClick={() => navigate(-1)}>
        <span>质押</span>
      </NavBar>
      <div className={styles.container}></div>
      <Cell.Group>
        <Cell>
          <div className={styles.fullColumn}>
          <div>质押:当前余额{balance} BT2N</div>
            <div className={styles.row}>
              <Image src={nuBtcIcon} width='50px'/>
              <div>
                <Input placeholder="请输入金额" type='digit' onChange={setAmount}/>
                <div>≈ ${numberToFixed(amount / nubtToken.usdPrice, 2)}</div>
              </div>
            </div>
          </div>
        </Cell>
  
      </Cell.Group>
      {/* <Cell>
        <div className={styles.fullRow}>
          <div className={styles.title}>费用预估</div>
          <div className={styles.column}>
            <div className={styles.value}>0.00BTC</div>
            <div className={styles.value2}>≈ $0.0</div>
          </div>
        </div>
      </Cell> */}
      <Button block style={{height: '44px', background: '#131313', marginTop: '40px'}} type="primary"
              loading={loading} onClick={requestStake}>确定</Button>
                 <Button block style={{height: '44px', background: '#131313', marginTop: '10px'}} type="primary"
              loading={loading} onClick={navigateTo}>赎回</Button>   
              <Cell>
        <div className={styles.fullColumn}>
          <div>不同等级的账户 日息不同：</div>
                <div>V0（0.5%）</div>
                <div>V1（0.55%）</div>
                <div> V2（0.6%）</div>  
                <div> V3（0.65%）</div>
                <div> V4（0.7%）</div>
                <div>V5（0.75%）</div>
                <div>收益计算公式（产出代币为BTC）：</div>
<div>质押BT2N数量 * BT2N地板价 * 收益率</div>
<div>玩家质押BT2N铭文后，需要至少3天才可赎回</div>
<div>赎回的铭文可以继续质押或者进行二级市场买卖</div>
</div>
              </Cell>
    </div>
  )
}