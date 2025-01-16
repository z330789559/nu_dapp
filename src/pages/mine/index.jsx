import React, {useEffect, useRef, useState} from "react";
import {useAccount} from "wagmi";
import {
  bindInvitationCode,
  fetchTeamList,
  fetchTokenList,
  getInvitationList,
  getUserBalance,
  getUserDetail,
  getDirectInvite,
  bindBrcAddress,
  getMyStake
} from "../../api/api.js";
import {Button, Cell, Dialog, Grid, Image, Input, NavBar, Row, Toast} from "@nutui/nutui-react";
import nubtIcon from "../../assets/icons/nubt.png";
import btcIcon from "../../assets/icons/btc.png";
import btcLargeIcon from "../../assets/icons/btc_large.png";
import levelIcon from "../../assets/icons/level.png";
import styles from "./index.module.css";
import {ArrowDown, ArrowUp, CurrencyDollarSimple} from "@phosphor-icons/react";
import BottomAppBar from "../../components/tabbar/index.jsx";
import {getAddress, getCurrencyFormat, numberPercentage} from "../../utils/common.js";
import {Copy,Disk} from "@nutui/icons-react";
import AppWalletConnectButton from "../../components/connectButton/index.jsx";
import SelectTokens  from "../../components/selectTokens/index.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import copy from "copy-to-clipboard";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useAtom} from "helux";
import {loginAtom} from "../../hooks/index.jsx";

export default function MinePage() {


  const navigate = useNavigate();
  const {search} = useLocation();
const {address} = useAccount();
const [balance, setBalance] = useState({})
const [invitedData, setInvitedData] = useState({
    directNum: 0,
    address: ""
})
  const [tokenList, setTokenList] = useState([])
  const [userInfo, setUserInfo] = useState({})
  const [inviterUrl, setInviterUrl] = useState('')
  const [inviterNum, setInviterNum] = useState(0) // 我的团队人数
  const [inviterNubtNum, setInviterNubtNum] = useState(0) // 我的团队NUBT数量
const [inviterList, setInviterListList] = useState([]) // 我的邀请列表
  const [brcAddress, setBrcAddress] = useState('')
  // 绑定逻辑
  const [showBindInviterDialog, setShowBindInviterDialog] = useState(false)
  const [showTokenSelectDialog, setShowTokenSelectDialog] = useState(false)
  const [inviterCode, setInviterCode] = useState("")

  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
const listRef = useRef(null);
  const [hasMore, setHasMore] = useState(true)
  const [isBind, setIsBind] = useState(false)
  const [closeProductDialog, setCloseProductDialog] = useState(false)
const {openConnectModal} = useConnectModal()
  const [login, setLogin] = useAtom(loginAtom);

  useEffect(() => {
    getBalance()
    getTokenList()
    fetchUserDetail()
    getUserTeamList()
    setPage(1)
    getUserInvitationList()
    getDirectInviteInit()
  }, [address, login])

  const getTokenList = async () => {
    const res = await fetchTokenList();
    setTokenList(res)
  }

  const fetchUserDetail = async () => {
    if (!address) {
      openConnectModal()
      return
    }
    const res = await getUserDetail(address.toLowerCase())
    setUserInfo(res)

    setBrcAddress(res.brcAddress)
    const location = window.location;
    setInviterUrl(location.origin + "/#/mine?inviter=" + res.invitationCode)
    setIsBind(res.parentId !== 0)

    const params = new URLSearchParams(search);
    const inviter = params.get('inviter');
    if (inviter && res.parentId === 0 && res.invitationCode !== inviter) {
      setInviterCode(inviter)
      setShowBindInviterDialog(true)
    }
  }

  const getDirectInviteInit = async () => {
    if (!address) {
      openConnectModal()
      return
    }
    const result = await getDirectInvite(address.toLowerCase())
    if (result) {
      setInvitedData(result)
    }
  }

  async function getBalance() {
    if (!address) {
      openConnectModal()
      return
    }

    const result = await getUserBalance(address.toLowerCase())
    setBalance(result)
  }

  /// 获取当前用户网体
  const getUserTeamList = async () => {
    if (!address) {
      openConnectModal()
      return
    }

    const res = await fetchTeamList(address.toLowerCase())
    if (Array.isArray(res)) {
      const nubtTotal = res.reduce((total, item) => {
        return total + parseFloat(item.balance)
      }, 0)
      setInviterNubtNum(nubtTotal)
      setInviterNum(res.length)
    }
  }
  const onCloseProduct=async ()=>{
    if(!brcAddress){
      setCloseProductDialog(false)
      Toast.show('请输入BRC接收地址')
      return
    }
    setCloseProductDialog(false)
    await bindBrcAddress(address,brcAddress)
    await fetchUserDetail()
  }
  /// 获取我的邀请列表
  const getUserInvitationList = async () => {
    if (!address) {
      openConnectModal()
      return
    }

    const res = await getInvitationList(address.toLowerCase(), page)
    const array = res.list

    setHasMore(array.length >= 20)

    if (page === 1) {
      setInviterListList(array)
    } else {
      setInviterListList(inviterList.concat(array))
    }
    setIsLoading(false)
  }

  const copyInviterUrl = () => {
    copy(inviterUrl);
    Toast.show('复制成功');
  }

  const onBind = async () => {
    try {
      if (!inviterCode) {
        Toast.show('请输入邀请码')
        return
      }
      await bindInvitationCode(address.toLowerCase(), inviterCode)
      setShowBindInviterDialog(false)
    } catch (e) {
      Toast.show(e.message)
    }
  }

  const loadMore = async () => {
    if (!hasMore) return
    setPage(page + 1)
    await getUserInvitationList()
  }
  const pasteAddress= async ()=>{
    const bitcoinAddressRegex = /^(1|3|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[0-9A-Za-z]{25,39})$/;
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
  const handleScroll = async () => {
    const node = listRef.current;
    if (node.scrollHeight - node.scrollTop < node.clientHeight + 10 && !isLoading) {
      await loadMore()
    }
  }
  const popBindBrcAddress = async () => {
       setShowTokenSelectDialog(false)
       setCloseProductDialog(true)
  }
  const selectToken = async (item) => {
    if(item.id===2){
      navigate('/withdraw', {state: {token: item.title}})
      return
    }
    if(!brcAddress){
      popBindBrcAddress()
      return 
    }
    if(isBind){
      navigate('/withdraw', {state: {token: item.title}})
    }else{
      setShowBindInviterDialog(true)  
    }


  }
  const getUsdtValue=(value,id)=>{
    let item=tokenList.find(item=>item.id===id)
    if(!item){
      return 0
    }
    return getCurrencyFormat(value*item.marketCap,2)
  }



  return (
    <div>
      <NavBar fixed titleAlign='left' right={<AppWalletConnectButton/>}>
        <span>我的资产</span>
      </NavBar>
      <div className={styles.container} ref={listRef} onScroll={async () => handleScroll()}>
        <Cell.Group>
          <Cell
            align="center"
            divider={false}
            title={
              <Row type='flex' align='center'>
                <CurrencyDollarSimple size={32}/>
                <div className={styles.balance}>
                  {getCurrencyFormat(balance.balance, 2)}
                </div>
              </Row>
            }
            extra={
              <Row type='flex' align='center' justify='end' style={{width: '100%'}}>
                <Image src={levelIcon} height='26px'/>
                <div className={styles.balance}>
                  {userInfo.level}
                </div>
              </Row>
            }
          />
          <Cell>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                <Button style={{width: '40px', height: '40px'}} onClick={() => {
                  if (isBind) {
                    setShowTokenSelectDialog(true)
                    // navigate('/withdraw')
                  } else {
                    setShowBindInviterDialog(true)
                  }
                }}><ArrowUp size={26}/></Button>
                <div className={styles.value3}>发送</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                <Button style={{width: '40px', height: '40px'}} onClick={() => {
                  if (isBind) {
                    navigate('/recharge')
                  } else {
                    setShowBindInviterDialog(true)
                  }
                }}><ArrowDown size={26}/></Button>
                <div className={styles.value3}>接收</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                <Button style={{width: '40px', height: '40px'}} onClick={() => {
                  if (isBind) {
                    navigate('/stake', {state: {balance: balance.nubtBalance}})
                  } else {
                    setShowBindInviterDialog(true)
                  }
                }}><ArrowDown size={26}/></Button>
                <div className={styles.value3}>质押</div>
              </div>
            </div>
          </Cell>
          <Cell>
            <Grid columns={2} style={{width: '100%'}} gap={3}>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>今日手续费分红</span>
                  </div>
                  <div className={styles.value}>
                    <Image src={btcIcon} width="20px"/>
                    <div>{balance.todayIncomeGas}</div>
                  </div>
                </div>
              </Grid.Item>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>总手续费分红</span>
                  </div>
                  <div className={styles.value}>
                    <Image src={btcIcon} width="20px"/>
                    <div>{balance.totalIncomeGas}</div>
                  </div>
                </div>
              </Grid.Item>
            </Grid>
          </Cell>
          <div className={styles.list}>
            {tokenList.map((item) => (
              <Cell align="center" key={item.id}>
                <Row type='flex' justify='space-between'>
                  <div style={{display: 'flex', flexDirection: 'row', gap: '10px', flex: 1}}>
                    <Image src={item.id === 2 ? btcLargeIcon : nubtIcon} width="40px" height='40px'/>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                      <div>{item.name}</div>
                      <div>
                        ${getCurrencyFormat(item.marketCap || 0.00, 4)}
                        {item.changeRate > 0 ?
                          <span
                            className={styles.amount_item_value_rate_up}> {numberPercentage(item.changeRate)}%</span> :
                          <span
                            className={styles.amount_item_value_rate_down}> {numberPercentage(item.changeRate)}%</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div style={{flex: 1}}>
                    {
                      item.id === 2 ?
                        <div className={styles.amount_item_value}>{getCurrencyFormat(balance.btcBalance || 0.0, 6)}</div> :
                        <div className={styles.amount_item_value}>{getCurrencyFormat(balance.nubtBalance || 0.0, 0)}</div>
                    }
                    {
                      item.id === 2 ?
                        <div className={styles.amount_item_value2}>${getCurrencyFormat(balance.btcBalanceValue || 0.0, 4)}</div> :
                        <div className={styles.amount_item_value2}>${getCurrencyFormat(balance.nubtBalanceValue || 0.0, 4)}</div>
                    }
                  </div>
                </Row>
              </Cell>
            ))}
          </div>
        </Cell.Group>

        {/*直推*/}
        <Cell.Group>
          <Cell align="center" divider={false} title={
            <div>
              <div className={styles.title}>我的推广地址</div>
              <span>{inviterUrl}</span>
              <Button type="default" fill="none" size='small' onClick={copyInviterUrl}>
                <Copy/>
              </Button>
            </div>}
          />
             <Cell>
            <Grid columns={2} style={{width: '100%'}} gap={3}>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>我的质押</span>
                    <Image src={nubtIcon} width="20px" />
                  </div>
                  <div className={styles.value}>
                  <span>{getCurrencyFormat(balance.stakeAmount,2)}</span>
                  <span style={{fontSize:"small"}}>${getUsdtValue(balance.stakeAmount,1)}</span>
                  
                  </div>
                </div>
              </Grid.Item>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>质押收益 </span>
                    <Image src={btcIcon} width="20px" />
                  </div>
                  <div className={styles.value}>
                  <span> {getCurrencyFormat(balance.stakeReward, 6)}</span> 
                  <span style={{fontSize:"small"}}>${getUsdtValue(balance.stakeReward,2)}</span>

                  </div>
                </div>
              </Grid.Item>
            </Grid>
          </Cell>
          <Cell>
            <Grid columns={2} style={{width: '100%'}} gap={3}>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>网体用户数量</span>
                  </div>
                  <div className={styles.value}>{inviterNum}</div>
                </div>
              </Grid.Item>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>网体BT2N持有量</span>
                  </div>
                  <div className={styles.value}>{getCurrencyFormat(inviterNubtNum, 0)}</div>
                </div>
              </Grid.Item>
            </Grid>
          </Cell>
          <Cell>
            <Grid columns={2} style={{width: '100%'}} gap={3}>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>直推数量</span>
                  </div>
                  <div className={styles.value}>{invitedData.directNum}</div>
                </div>
              </Grid.Item>
              <Grid.Item>
                <div className={styles.gridInfo}>
                  <div className={styles.title}>
                    <span>上级地址</span>
                  </div>
                  <div className={styles.value}>{getAddress(invitedData.address||"----")} </div>
                </div>
              </Grid.Item>
            </Grid>
          </Cell>
        </Cell.Group>
        <Cell.Group>
          <Cell
            align="center"
            divider={false}
            title={<span>我的邀请列表</span>}
          />
          <div className={styles.list}>
            {inviterList.map((item) => (
              <Cell align="center" key={item.id}>
                <div style={{width: '100%', display: 'flex', gap: '10px', flexDirection: 'column'}}>
                  <div className={styles.value2}>{getAddress(item.address)}</div>
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <div className={styles.title}>网体用户数量</div>
                    <div className={styles.value}>{item.teamMemberNum || 0}</div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <div className={styles.title}>个人BT2N持有量</div>
                    <div className={styles.value}>{item.balance || 0}</div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <div className={styles.title}>网体BT2N持有量</div>
                    <div className={styles.value}>{item.teamBalance || 0}</div>
                  </div>
                </div>
              </Cell>
            ))}
          </div>
        </Cell.Group>
      </div>
      <Dialog
        style={{background: '#000',fontSize:"30px"}}
        className={styles.actionClass}
        title="铭文地址"
        visible={closeProductDialog}
        onConfirm={onCloseProduct}
        onCancel={() => setCloseProductDialog(false)}>
         <div className={styles.receiveAddress}>
        <Input placeholder="WEB3钱包BRC-20地址"  value={brcAddress} onChange={setBrcAddress}/>
        <Button type="default" fill="none" size='small' onClick={pasteAddress}>
              <Disk  width="30px" height="30px"  />
              </Button>
       </div>
      </Dialog>
      <Dialog style={{background: 'black'}} title="绑定邀请人" visible={showBindInviterDialog} confirmText='绑定' onConfirm={onBind}
              onCancel={() => setShowBindInviterDialog(false)}>
        <Input style={{borderRadius: '5px'}} placeholder="请输入邀请码" defaultValue={inviterCode} onChange={(e) => setInviterCode(e)}/>
      </Dialog>
      <BottomAppBar/>
      <SelectTokens visible={showTokenSelectDialog} onClose={() => setShowTokenSelectDialog(false)} onchange={selectToken } />
    </div>
  )
}