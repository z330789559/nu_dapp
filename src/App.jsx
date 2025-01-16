import MarketPage from "./pages/market/index.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MinePage from "./pages/mine/index.jsx";
import BuyPage from "./pages/buy/index.jsx";
import RechargePage from "./pages/recharge/index.jsx";
import WithdrawPage from "./pages/withdraw/index.jsx";
import PostProductPage from "./pages/postProduct/index.jsx";
import OrderPage from "./pages/order/index.jsx";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<MarketPage/>}/>
          <Route exact path="/mine" element={<MinePage/>}/>
          <Route exact path="/order" element={<OrderPage/>}/>
          <Route exact path="/buy" element={<BuyPage/>}/>
          <Route exact path="/recharge" element={<RechargePage/>}/>
          <Route exact path="/withdraw" element={<WithdrawPage/>}/>
          <Route exact path="/post" element={<PostProductPage/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App