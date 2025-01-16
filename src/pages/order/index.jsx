import {useAccount} from "wagmi";
import React, {useEffect, useRef, useState} from "react";
import {closeShelve, fetchUserOrderList} from "../../api/api.js";
import BottomAppBar from "../../components/tabbar/index.jsx";
import {Button, Cell, Dialog, Image, NavBar, Notify, Row, Tag} from "@nutui/nutui-react";
import nubtIcon from '../../assets/icons/nubt.png'
import btcIcon from '../../assets/icons/btc.png'

import styles from "./index.module.css";
import {getCurrencyFormat, getDayjsYYYYMDHMS} from "../../utils/common.js";
import AppWalletConnectButton from "../../components/connectButton/index.jsx";
import {useConnectModal} from "@rainbow-me/rainbowkit";

export default function OrderPage() {
  const {address} = useAccount()

  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const listRef = useRef(null);
  const [hasMore, setHasMore] = useState(true)
  const [closeProductDialog, setCloseProductDialog] = useState(false)
  const [handleItem, setHandleItem] = useState(null)
  const {openConnectModal} = useConnectModal()

  useEffect(() => {
    setPage(1)
    fetchUserOrders()
  }, [address])

  /// 获取当前用户的NFT
  const fetchUserOrders = async () => {
    try {
      if (!address) {
        openConnectModal()
        return
      }

      setIsLoading(true)
      const res = await fetchUserOrderList(address.toLowerCase(), page)
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
    } catch (e) {
      setIsLoading(false)
      Notify.danger(e.message)
    }
  }

  const loadMore = async () => {
    if (!hasMore) return
    setPage(page + 1)
    await fetchUserOrders()
  }

  const handleScroll = async () => {
    const node = listRef.current;
    if (node.scrollHeight - node.scrollTop < node.clientHeight + 10 && !isLoading) {
      await loadMore()
    }
  }

  const getStatusDesc = (status) => {
    const statusList = ['出售中', '售出', '购买', '已下架']
    return statusList[status - 1]
  }

  const onCloseProduct = async () => {
    setCloseProductDialog(false)
    try {
      await closeShelve(address.toLowerCase(), handleItem.id)
      Notify.success('下架成功')
      setPage(1)
      fetchUserOrders()
    } catch (e) {
      Notify.danger(e.message)
    }
  }
  return (
    <div >
      <NavBar fixed titleAlign='left' right={<AppWalletConnectButton/>}>
        <span>我的订单</span>
      </NavBar>
      <div className={styles.container} ref={listRef} onScroll={async () => handleScroll()}>
        {list?.map((item) => (
          <Cell.Group key={item.id}>
            <Cell>
              <div className={styles.listTitle}>
                <Row gutter="10" type="flex" justify="space-start" align='center'>
                  <Image src={item.thumb} width='40px'/>
                  <div style={{marginLeft: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <div className={styles.value}>{item.quantity}</div>
                    <div className={styles.title}>{item.itemName}</div>
                  </div>
                </Row>

                {item.status === 1 &&
                  <Tag style={{width: '50px'}} type='success'>{getStatusDesc(item.status)}</Tag>}
                {item.status === 2 && <Tag style={{width: '50px'}} type='info'>{getStatusDesc(item.status)}</Tag>}
                {item.status === 3 &&
                  <Tag style={{width: '50px'}} type='success'>{getStatusDesc(item.status)}</Tag>}
                {item.status === 4 &&
                  <Tag style={{width: '50px'}} type='warning'>{getStatusDesc(item.status)}</Tag>}
                {
                  item.status === 1 &&
                  <Button style={{
                    '--nutui-button-default-border-color': 'transparent',
                    '--nutui-button-default-color': '#000',
                    '--nutui-button-default-background-color': '#fff',
                  }} onClick={() => {
                    setHandleItem(item)
                    setCloseProductDialog(true)
                  }}>
                    {"下架"}
                  </Button>
                }
              </div>
            </Cell>
            <Cell>
              <div className={styles.listInfo}>
                <Row type="flex" justify="space-between">
                  <div className={styles.title}>单价</div>
                  <div className={styles.value}>${getCurrencyFormat(item.price || '0.00', 4)}</div>
                </Row>
                <Row type="flex" justify="space-between">
                  <div className={styles.title} style={{width: '100px'}}>总价</div>
                  <Row type='flex' justify='end' align='center'>
                    <Image src={btcIcon} width='20px' style={{marginRight: '5px'}}/>
                    <div className={styles.value}>{getCurrencyFormat(item.payPrice || '0.00', 6)}</div>
                  </Row>
                </Row>
                <Row type="flex" justify="space-between">
                  <div className={styles.title}>时间</div>
                  <div className={styles.title}>{getDayjsYYYYMDHMS(item.createTime / 1000)}</div>
                </Row>
              </div>
            </Cell>
          </Cell.Group>
        ))}
      </div>
      <Dialog
        style={{background: '#000'}}
        title="下架"
        visible={closeProductDialog}
        onConfirm={onCloseProduct}
        onCancel={() => setCloseProductDialog(false)}>
        确认下架该铭文
      </Dialog>
      <BottomAppBar/>
    </div>
  )
}