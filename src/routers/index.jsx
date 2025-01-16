import {createHashRouter, Navigate} from "react-router-dom";
import MarketPage from "../pages/market/index.jsx";
import MinePage from "../pages/mine/index.jsx";
import OrderPage from "../pages/order/index.jsx";
import BuyPage from "../pages/buy/index.jsx";
import RechargePage from "../pages/recharge/index.jsx";
import StakePage from "../pages/stake/index.jsx";
import Redeem from "../pages/redeem/index.jsx";
import WithdrawPage from "../pages/withdraw/index.jsx";
import PostProductPage from "../pages/postProduct/index.jsx";

export const globalRouters = createHashRouter([
  {path: '/', element: <MarketPage/>},
  {path: '/mine', element: <MinePage/>},
  {path: '/order', element: <OrderPage/>},
  {path: '/buy', element: <BuyPage/>},
  {path: '/recharge', element: <RechargePage/>},
   {path: '/stake', element: <StakePage/>},
  {path: '/redeem', element: <Redeem/>},
  {path: '/withdraw', element: <WithdrawPage/>},
  {path: '/post', element: <PostProductPage/>},
  {path: '*', element: <Navigate to="/"/>},
])