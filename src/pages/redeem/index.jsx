import {useNavigate} from "react-router-dom";
import {useAccount, useNetwork} from "wagmi";
import {useEffect, useRef, useState} from "react";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {ArrowLeft, Copy} from "@nutui/icons-react";
import {bindInvitationCode, unStakeRequest, fetchTokenList, getUserDetail,fetchStakeList} from "../../api/api.js";
import {getCurrencyFormat, numberToFixed} from "../../utils/common.js";
import BottomAppBar from "../../components/tabbar/index.jsx";
import {Button, Cell, Col, Dialog, Loading, Image, Input, NavBar, Row, Toast} from "@nutui/nutui-react";
import nubtIcon from '../../assets/icons/nubt.png'
import nuBtcIcon from "../../assets/icons/nubt.png";
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
  const [btcToken, setBtcToken] = useState(null)
  const [nubtToken, setNuBtcToken] = useState({})
  const [hasMore, setHasMore] = useState(true)
  const [isBind, setIsBind] = useState(false)
  const [showBindInviterDialog, setShowBindInviterDialog] = useState(false)
  const [inviterCode, setInviterCode] = useState('')


  const getTokenList = async () => {
    const res = await fetchTokenList();
    if (Array.isArray(res) && res.length > 0) {
      setBtcToken(res.filter(item => item.id === 2)[0])
      setNuBtcToken(res.filter(item => item.id === 1)[0])
    }
  }
  useEffect(() => {
    getTokenList()
  }, []);


  const getMoreStakeList = async () => {
    if (!hasMore) return
    setPage(page + 1)
    await getStakeList()
  }

  useEffect(() => {
    getTokenList()
    fetchUserDetail()
    getStakeList()
  }, [address])


  const getStakeList = async () => {
setIsLoading(true)
    const res = await fetchStakeList(address,page)

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


  const fetchUserDetail = async () => {
    if (!address) {
      openConnectModal()
      return
    }
    const res = await getUserDetail(address.toLowerCase())
    setIsBind(res.parentId !== 0)
  }



  const handleScroll = async () => {
    const node = listRef.current;
    if (node.scrollHeight - node.scrollTop < node.clientHeight + 120 && !isLoading) {
      await getMoreStakeList()
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
  const renderAction = (status,id) => {
    if (status === 1) {
      return <div className={styles.action}>未开始</div>
    }
    if (status === 2) {
      return <Button style={{
        '--nutui-button-default-border-color': 'transparent',
        '--nutui-button-default-color': '#000',
        '--nutui-button-default-background-color': '#fff',
      }} onClick={() => {
        if (isBind) {
          handleUnStake(id)
          return
        }
        setShowBindInviterDialog(true)
      }}>
        {"赎回"}
      </Button>
    }
    if (status === 3) {
      return <div className={styles.action}>结束</div>
    }
  }
  const handleUnStake = async (id) => {
    if (!address) {
      openConnectModal();
      return
    }
    setIsLoading(true)
    try{
      const res= await unStakeRequest(address,id)

      if(res && res==true){
        Toast.show('赎回成功')
        await getStakeList()
      }else{
         Toast.show('赎回失败')
      }
    }catch(e){
      Toast.show(e.message)
      setIsLoading(false)
    }

  }
  const getUsdtPrice = (price) => {

    const usdtPrice =nubtToken? nubtToken.usdPrice:0
    return numberToFixed(price / usdtPrice, 6)
  }

  return (
    <div>
      <div className={styles.container} ref={listRef} onScroll={async () => handleScroll()}>
        <Cell.Group>
        <NavBar fixed back={<ArrowLeft/>} titleAlign='left' onBackClick={() => navigate(-1)}>
        <span>质押: <span style={{color:"red",fontSize:"small"}}>质押之后72小时之内才能赎回)</span></span>
      </NavBar>
      {isLoading? <Loading/>:
          <div className={styles.list}>
            {list.map((item, idx) => (
              <Cell align="center" key={item.id}>
                <Col span="24">
                  <Row type="flex" justify="space-between">
                    <Row gutter="10" type="flex" justify="space-between">
                      <Image src={item.thumb} width='40px'/>
                      <Col>
                        <div className={styles.value}>{item.payPrice}</div>
                        <div className={styles.title}>总质押</div>
                      </Col>
                      {renderAction(item.stakeStatus,item.id)}
                    </Row>

                  </Row>
                  <Row type="flex" justify="space-between">
                    <div className={styles.marketTokenInfo}>
                      <div className={styles.title}>质押奖励</div>
                      <div className={styles.value}>
                        {item.icon && <Image src={item.icon} width="15px"/>}
                        <div className={styles.value}>${getCurrencyFormat(item.refundBonusPrice || '0.00', 8)}</div>
                      </div>
                      <span>开始:<br/>{item.payTime}</span>
                    </div>
                    <div className={styles.marketTokenInfo}>
                      <div className={styles.title}>可赎回</div>
                      <div className={styles.value}>
                        <Image src={btcIcon} width="18px"/>
                        <div className={styles.value}>{getCurrencyFormat(item.refundTotalPrice || '0.00', 6)}</div>
                      </div>
                      <span>${getUsdtPrice(item.refundTotalPrice)}</span>
                    </div>
                  </Row>
                </Col>
              </Cell>
            ))}
          </div>
      }
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