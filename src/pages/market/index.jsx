import {useNavigate} from "react-router-dom";
import {useAccount, useNetwork} from "wagmi";
import {useEffect, useRef, useState} from "react";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {bindInvitationCode, fetchProductList, fetchTokenList, getUserDetail,getRewardPool} from "../../api/api.js";
import {getCurrencyFormat, numberToFixed} from "../../utils/common.js";
import BottomAppBar from "../../components/tabbar/index.jsx";
import AppWalletConnectButton from "../../components/connectButton/index.jsx";
import {Button, Cell, Col, Dialog, Grid, Image, Input, NavBar, Row, Toast,Progress} from "@nutui/nutui-react";
import logo from '../../assets/images/logo.png'
import nubtIcon from '../../assets/icons/nubt.png'
import btcIcon from '../../assets/icons/btc.png'
import styles from './index.module.css'

export default function MarketPage() {
  const navigate = useNavigate();
  const {address} = useAccount()
  const {chain} = useNetwork()
  const [list, setList] = useState([])
  const [infos, setInfos] = useState([])
  const {openConnectModal} = useConnectModal()
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const listRef = useRef(null);
  const [nubtToken, setNubtToken] = useState(null)
  const [btcToken, setBtcToken] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [isBind, setIsBind] = useState(false)
  const [showBindInviterDialog, setShowBindInviterDialog] = useState(false)
  const [inviterCode, setInviterCode] = useState('')
  const [rewardPool, setRewardPool] = useState({})


  const getTokenList = async () => {
    const res = await fetchTokenList();
    if (Array.isArray(res) && res.length > 0) {
      setNubtToken(res.filter(item => item.id === 1)[0])
      setBtcToken(res.filter(item => item.id === 2)[0])
    }
  }
const process= ()=>{
 const rate =rewardPool.todayAmount/20000 * 100 
  return rate <1?1:rate
}
  const getProductList = async () => {
    setIsLoading(true)
    if (!nubtToken) return

    const res = await fetchProductList(nubtToken.id, page)
    const array = res.list

    array.forEach(item => {
      item.thumb = nubtIcon
    })
    setHasMore(array.length >= 20)
    if (page === 1) {
      setList(array)
    } else {
      setList(list.concat(array))
    }
    setIsLoading(false)
  }

  const getMoreProductList = async () => {
    if (!hasMore) return
    setPage(page + 1)
    await getProductList()
  }
  useEffect(() => {
    getTokenList()
    fetchUserDetail()
    getRewardPoolData()
  }, [address])

  useEffect(() => {
    if (nubtToken && btcToken) {
      const currentPrice = getCurrencyFormat(nubtToken.marketCap * 210000000 * btcToken.usdPrice, 2)
      const infos = [
        {'title': '24小时交易额', 'value': getCurrencyFormat(nubtToken.volume24h, 4), 'icon': btcIcon, 'unit': ''},
        {'title': '交易额', 'value': getCurrencyFormat(nubtToken.volume, 4), 'icon': btcIcon, 'unit': ''},
        {'title': '市值', 'value': currentPrice, 'icon': btcIcon, 'unit': ''},
        {'title': '持有人', 'value': nubtToken.holders/*info.holders*/, 'unit': nubtToken.tradeCount+' 笔交易'},
        {'title': '地板价', 'value': '$' + getCurrencyFormat(nubtToken.marketCap, 6), 'unit': ''},
      ]
      setInfos(infos)
    }
    setPage(1)
    getProductList()
  }, [nubtToken, btcToken])
const getRewardPoolData = async () => {
    const res = await getRewardPool()
    console.log(res)
    setRewardPool(res)
  }
  const fetchUserDetail = async () => {
    if (!address) {
      openConnectModal()
      return
    }
    const res = await getUserDetail(address.toLowerCase())
    setIsBind(res.parentId !== 0)
  }

  const handleMint = (item) => {
    if (!address) {
      openConnectModal();
      return
    }
    if (chain && chain.unsupported) {
      Toast.show('当前网络不支持');
      return;
    }
    navigate(`/buy`, {state: {product: item, token: nubtToken}})
  }

  const handleScroll = async () => {
    const node = listRef.current;
    if (node.scrollHeight - node.scrollTop < node.clientHeight + 120 && !isLoading) {
      await getMoreProductList()
    }
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

  return (
    <div>
      <NavBar fixed right={<AppWalletConnectButton/>} back={<Image src={logo} width='100px'/>}/>
      <div className={styles.container} ref={listRef} onScroll={async () => handleScroll()}>
        <Cell.Group>
          <Cell
            align="center"
            divider={false}
            title={
              <Image src={nubtIcon} width={'50px'}/>
            }
            extra={
              <Button style={{
                '--nutui-button-default-border-color': 'transparent',
                '--nutui-button-default-color': '#000',
                '--nutui-button-default-background-color': '#fff',
              }} onClick={() => {
                if (isBind) {
                  navigate('/post')
                  return
                }
                setShowBindInviterDialog(true)
              }}>上架铭文</Button>}
          />
          <Cell>
            <Grid columns={2} style={{width: '100%'}} gap={3}>
              {infos.map((item, idx) => (
                  <Grid.Item key={idx}>
                    <div className={styles.marketTokenInfo}>
                      <div className={styles.title}>
                        <span>{item.title}</span>
                      </div>
                      <div className={styles.value}>
                        {item.icon && <Image src={item.icon} width="20px"/>}
                        <div>{item.value}</div>
                      </div>
                      <span>{item.unit}</span>
                    </div>
                  </Grid.Item>
                )
              )}
            </Grid>
          </Cell>
            <div className={styles.reward}>
              
            <div className={styles.reward_show}>
 
            <div>{getCurrencyFormat(rewardPool.todayAmount,0)}/{rewardPool.upLimit}(USDT)</div>
        <Progress
          percent={process()}
          color="linear-gradient(270deg, rgb(220 180 119) 0%, rgb(255 168 0) 32.8156%, rgb(255 168 0) 100%)"
          animated
        />
        </div>
        <div>奖金池</div>

            </div>
          <div className={styles.list}>
            {list.map((item, idx) => (
              <Cell align="center" key={item.id}>
                <Col span="24">
                  <Row type="flex" justify="space-between">
                    <Row gutter="10" type="flex" justify="space-between">
                      <Image src={item.thumb} width='40px'/>
                      <Col>
                        <div className={styles.value}>{item.stock}</div>
                        <div className={styles.title}>#{item.name}</div>
                      </Col>
                    </Row>
                    <Button style={{
                      '--nutui-button-default-border-color': 'transparent',
                      '--nutui-button-default-color': '#000',
                      '--nutui-button-default-background-color': '#fff',
                    }} onClick={() => {
                      if (isBind) {
                        handleMint(item)
                        return
                      }
                      setShowBindInviterDialog(true)
                    }}>
                      {"购买"}
                    </Button>
                  </Row>
                  <Row type="flex" justify="space-between">
                    <div className={styles.marketTokenInfo}>
                      <div className={styles.title}>单价</div>
                      <div className={styles.value}>
                        {item.icon && <Image src={item.icon} width="15px"/>}
                        <div className={styles.value}>${getCurrencyFormat(item.price || '0.00', 8)}</div>
                      </div>
                    </div>
                    <div className={styles.marketTokenInfo}>
                      <div className={styles.title}>总价</div>
                      <div className={styles.value}>
                        <Image src={btcIcon} width="18px"/>
                        <div className={styles.value}>{getCurrencyFormat(item.totalPrice || '0.00', 6)}</div>
                      </div>
                      <span>${getCurrencyFormat(item.usdtTotalPrice, 4)}</span>
                    </div>
                  </Row>
                </Col>
              </Cell>
            ))}
          </div>
        </Cell.Group>
      </div>
      <Dialog style={{background: 'black'}} title="绑定邀请人" visible={showBindInviterDialog} confirmText='绑定' onConfirm={onBind}
              onCancel={() => setShowBindInviterDialog(false)}>
        <Input style={{borderRadius: '5px'}} placeholder="请输入邀请码" onChange={(e) => setInviterCode(e)}/>
      </Dialog>
      <BottomAppBar/>
    </div>
  );
}