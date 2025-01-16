import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.scss'
import {WagmiConfig} from "wagmi";
import {wagmiConfig} from "./configs/const.js";
import {darkTheme, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {chains} from "./configs/const.js";
import '@nutui/nutui-react/dist/style.css';
import '@nutui/nutui-react/dist/styles/theme-dark.scss';
import '@rainbow-me/rainbowkit/styles.css';
import {RouterProvider} from "react-router-dom";
import {globalRouters} from "./routers/index.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <RouterProvider router={globalRouters} />
        </RainbowKitProvider>
      </WagmiConfig>
  </React.StrictMode>
)