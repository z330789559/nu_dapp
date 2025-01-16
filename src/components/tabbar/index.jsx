// eslint-disable-next-line no-unused-vars
import React, {forwardRef, useEffect, useState} from 'react'
import {useLocation, useNavigate,} from 'react-router-dom'
import {Tabbar} from "@nutui/nutui-react";
import {Home, Order, Wallet} from "@nutui/icons-react";

// eslint-disable-next-line react/display-name
const BottomAppBar = forwardRef(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const [index, setIndex] = useState(0)

  const pages = [
    '/', '/mine', '/order'
  ]

  useEffect(() => {
    const value = pages.findIndex((item) => item === location.pathname)
    setIndex(value)
  }, [location.pathname])

  const onSwitch = (index) => {
    const page = pages[index]
    navigate(page)
  }

  return (
    <Tabbar value={index} fixed safeArea onSwitch={onSwitch}>
      <Tabbar.Item title="市场" icon={<Home width={20} height={20}/>}/>
      <Tabbar.Item title="我的钱包" icon={<Wallet width={20} height={20}/>}/>
      <Tabbar.Item title="我的订单" icon={<Order width={20} height={20}/>}/>
    </Tabbar>
  )
})

export default BottomAppBar