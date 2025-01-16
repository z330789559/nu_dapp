import {Button, Cell, Image, Input, NavBar, Notify, Toast} from "@nutui/nutui-react";
import {ArrowLeft, Copy} from "@nutui/icons-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAccount, useNetwork} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import Web3 from "web3";
import {createPay, fetchTokenList} from "../../api/api.js";
import {numberToFixed} from "../../utils/common.js";
import btcLargeIcon from "../../assets/icons/btc_large.png";
import walletIcon from "../../assets/icons/wallet.png";
import styles from './index.module.css'
import copy from "copy-to-clipboard";

export default function RechargePage() {
  const navigate = useNavigate();
  const {chain} = useNetwork()
  const {openConnectModal} = useConnectModal()
  const [loading, setLoading] = useState(false);
  const {address} = useAccount();
  const [amount, setAmount] = useState('0')
  const [btcToken, setBtcToken] = useState({})

  useEffect(() => {
    getTokenList()
  }, [])


  const getTokenList = async () => {
    const res = await fetchTokenList();
    const btc = res.find(item => item.id === 2)
    setBtcToken(btc)
  }

  const requestRecharge = async () => {
    try {
      if (!chain || !address) {
        openConnectModal();
        return
      }
      if((amount/ btcToken.usdPrice) > 3000 ){
        Toast.show('单次充值上限3000USDT')
        return;
      }
      if (chain && chain.unsupported) {
        Toast.show('链接错误');
        return;
      }

      if (parseFloat(amount) <= 0) {
        Toast.show('金额不能为0')
        return;
      }
    
      setLoading(true)
      const res = await createPay(address.toLowerCase(), amount)
      if (res.data) {
        const web3 = new Web3(window.ethereum);
        await web3.eth.sendTransaction(res.data)
        Notify.success('充值成功')
      } else if (res.otherData) {
        const web3 = new Web3(window.ethereum);
        await web3.eth.sendTransaction(res.otherData)
        const txRes = await createPay(address.toLowerCase(), amount)
        if (txRes.data) {
          await web3.eth.sendTransaction(txRes.data)
          Notify.success('充值成功')
        }else{
          Notify.danger('充值失败')
        }
      }
      setLoading(false)
      navigate(-1)
    } catch (e) {
      setLoading(false)
      Notify.danger(e.message)
    }
  }

  const copyAddress = () => {
    copy(address);
    Toast.show('复制成功');
  }

  return (
    <div>
      <NavBar fixed back={<ArrowLeft/>} titleAlign='left' onBackClick={() => navigate(-1)}>
        <span>接收</span>
      </NavBar>
      <div className={styles.container}></div>
      <Cell.Group>
        <Cell>
          <div className={styles.fullColumn}>
          <div>接收:<span style={{color:"red"}}>(单次提取上限3000USDT)</span></div>
            <div className={styles.row}>
              <Image src={btcLargeIcon} width='50px'/>
              <div>
                <Input placeholder="请输入金额" type='digit' onChange={setAmount}/>
                <div>≈ ${numberToFixed(amount / btcToken.usdPrice, 2)}</div>
              </div>
            </div>
          </div>
        </Cell>
        <Cell>
          <div className={styles.fullColumn}>
            从
            <div className={styles.row}>
              <Image src={walletIcon} width='50px'/>
              <div className={styles.value2}>{address}</div>
              <Button type="default" fill="none" size='small' onClick={copyAddress}>
                <Copy/>
              </Button>
            </div>
          </div>
        </Cell>
      </Cell.Group>
      <Cell>
        <div className={styles.fullRow}>
          <div className={styles.title}>费用预估</div>
          <div className={styles.column}>
            <div className={styles.value}>0.00BTC</div>
            <div className={styles.value2}>≈ $0.0</div>
          </div>
        </div>
      </Cell>
      <Button block style={{height: '44px', background: '#131313', marginTop: '40px'}} type="primary"
              loading={loading} onClick={requestRecharge}>确定</Button>
    </div>
  )
}