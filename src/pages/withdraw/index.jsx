import {Button, Cell, Image, Input, NavBar, Notify, Toast,Dialog} from "@nutui/nutui-react";
import {ArrowLeft, Copy,Add,Disk} from "@nutui/icons-react";
import React, {useEffect, useState} from "react";
import {useNavigate,useLocation} from "react-router-dom";
import {useAccount, useNetwork} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import Web3 from "web3";
import {createWithdraw, fetchTokenList, getUserBalance,getUserDetail,bindBrcAddress} from "../../api/api.js";
import {numberToFixed} from "../../utils/common.js";
import btcLargeIcon from "../../assets/icons/btc_large.png";
import nuBtcIcon from "../../assets/icons/nubt.png";
import walletIcon from "../../assets/icons/wallet.png";
import styles from './index.module.css'
import copy from "copy-to-clipboard";
import { init } from "helux";


export default function WithdrawPage() {
  const navigate = useNavigate();
  const {chain} = useNetwork()
  const {openConnectModal} = useConnectModal()
  const [loading, setLoading] = useState(false);
  const {address} = useAccount();
  const [amount, setAmount] = useState('0')
  const [balance, setBalance] = useState({})
  const [brcAddress, setBrcAddress] = useState('')
  const [btcToken, setBtcToken] = useState({})
   const [nubtToken, setNuBtcToken] = useState({})
  const [gasFee, setGasFee] = useState(0.0);
  const location = useLocation();
  const { token } = location.state;
    const [icon, setIcon] = useState(token=="BTC"?btcLargeIcon:nuBtcIcon)
   const [userInfo, setUserInfo] = useState({})


   

  async function getBalance() {
    if (!address) return
    const result = await getUserBalance(address.toLowerCase())
    setBalance(result)
  }

  const getTokenList = async () => {
    const res = await fetchTokenList();
    const btc = res.find(item => item.id === 2)
    setBtcToken(btc)
    setNuBtcToken(res.find(item => item.id === 1))
  }
  const fetchUserDetail = async () => {
    if (!address) {
      openConnectModal()
      return
    }
    const res = await getUserDetail(address.toLowerCase())
    setUserInfo(res)
  }


  

  useEffect(() => {
    getBalance()
    getTokenList()
    fetchUserDetail()
  }, [address])
  useEffect(() => {

    if(icon===btcLargeIcon){
      setGasFee(amount * 0.1)
    }else{
      setGasFee(100)
    }

  }
    , [amount,icon])


  const renderBrcAddress = () => {
    if (icon === btcLargeIcon) {
      return (<Cell>
        <div className={styles.fullColumn}>
        </div>
      </Cell>)
    } else{
      return (<Cell>
        <div className={styles.fullColumn}>
          <div className={styles.title}>BRC接收地址:</div>
         <Input  placeholder="请输入BRC接收地址" value={userInfo.brcAddress}  disabled />
        </div>
      </Cell>)
    }
  }
  const getBtcPrice = () => {
    if(icon === btcLargeIcon){
      return numberToFixed(gasFee * 1, 8)
    }
    return numberToFixed(gasFee * 1 * btcToken.usdPrice, 8)
  }
  const requestWithdraw = async () => {
    try {
      
      const  usdPrice=icon === btcLargeIcon?btcToken.usdPrice:nubtToken.usdPrice
      if(parseFloat(amount/usdPrice) - 3000> 0){
        Toast.show('单次充值上限3000USDT')
        return
      }
      const tokenType = icon === btcLargeIcon ? 2 : 1
      if (!chain || !address) {
        openConnectModal();
        return
      }
      if (chain && chain.unsupported) {
        Toast.show('链接错误');
        return;
      }
      if (parseFloat(amount) > parseFloat(tokenType==2?balance.btcBalance:balance.nubtBalance)) {
        Toast.show('余额不足')
        return;
      }

      if (parseFloat(amount) <= 0) {
        Toast.show('金额不能为0')
        return;
      }

      setLoading(true)
      const res = await createWithdraw(address.toLowerCase(), amount, tokenType, userInfo.brcAddress)
      if (res.data ) {
        if(tokenType==2){
        const web3 = new Web3(window.ethereum);
        await web3.eth.sendTransaction(res.data)
        }
        setLoading(false)
        Notify.success('提现成功!')
      }
      navigate(-1)
    } catch (e) {
      setLoading(false)
      Notify.danger(e.message)
    }
  }

  const copyAddress = () => {
    copy(address)
    Toast.show('复制成功');
  }
  const getUsdtFee = () => {
   if(icon === btcLargeIcon){
      return numberToFixed(gasFee * 1 * btcToken.marketCap, 2)
    }else{
      return gasFee
    }
  }
  const showAmount = () => {
    const  usdPrice=icon === btcLargeIcon?btcToken.usdPrice:nubtToken.usdPrice
    return numberToFixed(amount * 1 / usdPrice, 2)
  }

  const pasteAddress= async ()=>{

   const copyText= await navigator.clipboard.readText()
    if(bitcoinAddressRegex.test(copyText)){
      setBrcAddress(copyText)
      setUserInfo({...userInfo,brcAddress:copyText})
      // setCloseProductDialog(false)
      // changeToken()

    }else{
      Toast.show('地址格式不正确')
    }
  }

  return (
    <div>
   
      <NavBar fixed back={<ArrowLeft/>} titleAlign='left' onBackClick={() => navigate(-1)}>
        <span>发送</span>
      </NavBar>
      <div className={styles.container}></div>
      <Cell.Group>
        <Cell>
          <div className={styles.fullColumn}>
            <div>发送:{icon === btcLargeIcon?<span style={{color:"red"}}>(单次提取上限3000USDT,费用为10%)</span>:''}</div>
            <div className={styles.row}>
              <Image src={icon} width='50px'/>
              <div>
                <Input placeholder="请输入金额" type='digit' onChange={setAmount}/>
                <div>≈ ${showAmount()}</div>
              </div>
              <div>
                {/* <Button  style={{
                  textWrap:'nowrap',
                  marginTop: 8,
                    marginBottom: 8,
                    marginLeft: 2,
                    marginRight: 2,
          '--nutui-button-default-border-color': '#f7931a',
          '--nutui-button-default-color': '#fff',
          '--nutui-button-default-background-color': '#f7931a',
        }} size="large"  onClick={() => changeToken()}>切换代币</Button> */}
              </div>
            </div>
          </div>
        </Cell>
        <Cell>
          <div className={styles.fullColumn}>
            至
            <div className={styles.row}>
              <Image src={walletIcon} width='50px'/>
              <div className={styles.value2}>{address}</div>
              <Button type="default" fill="none" size='small' onClick={copyAddress}>
                <Copy/>
              </Button>
            </div>
          </div>
        </Cell>

        {renderBrcAddress()}
      </Cell.Group>
      <Cell>
        <div className={styles.fullRow}>
          <div className={styles.title}>费用预估</div>
          <div className={styles.column}>
            <div className={styles.value}>{getBtcPrice()}BTC</div>
            <div className={styles.value2}>≈ ${getUsdtFee()}</div>
          </div>
        </div>
      </Cell>
      <Button block style={{height: '44px', background: '#131313', marginTop: '40px'}} type="primary" 
              loading={loading} onClick={requestWithdraw}>确定</Button>
    </div>
  )
}