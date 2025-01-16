// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface SwapRouterService{
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface Erc20Service {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract Rujinpro is Ownable {

    mapping(uint256 => uint256) orderMapping;


    struct addconfig {
        address swapRouterAdd;
        address usdtAdd;
        address busdAdd;
        address vaultAdd;
        address safeAdd_1;
        address[] getPath;
        address[] getBusdPath;
        SwapRouterService swapRouterService;
        Erc20Service erc20EthService;
        Erc20Service erc20Service;
    }

    address account;

    addconfig initconfig;

    constructor(
    ){
        initconfig.vaultAdd = msg.sender;
        initconfig.safeAdd_1 = 0x9348434D2E674d7875Bd404502e8767Bb924026C;  // 公司
        initconfig.swapRouterAdd = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
        initconfig.btcbAdd = 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c;
        initconfig.ethAdd = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
        initconfig.getPath = [initconfig.btcbAdd,initconfig.ethAdd];
        initconfig.getBusdPath = [initconfig.ethAdd,initconfig.btcbAdd];
        initconfig.swapRouterService = SwapRouterService(initconfig.swapRouterAdd);
        initconfig.erc20Service = Erc20Service(initconfig.btcbAdd);
        initconfig.erc20EthService = Erc20Service(initconfig.ethAdd);
    }


    function getMoney(uint256 amountIn,uint256 orderNo) public {
        uint256 finalIn = (amountIn * 98) / 100;
        uint256 part2 = (amountIn * 2) / 100;
        uint256 deadline = block.timestamp + 300;

        initconfig.erc20Service.transferFrom(msg.sender,address(this), finalIn);



        initconfig.erc20Service.approve(initconfig.swapRouterAdd, finalIn);

        /*uint256[] memory amountOuts = initconfig.swapRouterService.getAmountsOut(finalIn, initconfig.getPath);
        uint256 amountOut = amountOuts[1];
        initconfig.swapRouterService.swapExactTokensForTokens(finalIn, amountOut, initconfig.getPath, initconfig.vaultAdd, deadline);*/


        uint256[] memory amountOuts = initconfig.swapRouterService.getAmountsOut(finalIn, initconfig.getPath);
        uint256 amountOut = amountOuts[1];
        initconfig.swapRouterService.swapExactTokensForTokens(finalIn, amountOut, initconfig.getPath, initconfig.safeAdd_1, deadline);

        orderMapping[orderNo] = finalIn;

        emit InMoney(orderNo,msg.sender,finalIn);
    }

    function getFakeMoney(uint256 amountIn,uint256 deadline,uint256 orderNo) public onlyOwner{
        //        uint256 finalIn = (amountIn * 98) / 100;
        uint256 usdt = (amountIn * 2) / 100;


        uint256[] memory busdAmountIns = initconfig.swapRouterService.getAmountsIn(usdt, initconfig.getPath);
        uint256 busdAmountIn = busdAmountIns[0] * 2;
        initconfig.erc20EthService.approve(initconfig.swapRouterAdd, busdAmountIn);

        initconfig.swapRouterService.swapExactTokensForTokens(busdAmountIn, usdt, initconfig.getBusdPath, address(this), deadline);


        orderMapping[orderNo] = usdt;

        emit InMoney(orderNo,msg.sender,usdt);
    }

    function getBalance(address tokenAddress) public view returns(uint){
        return Erc20Service(tokenAddress).balanceOf(address(this));
    }

    function withdraw(address to,uint256 num,address tokenAddress) public onlyOwner{
        Erc20Service(tokenAddress).transfer(to,num);
    }

    function setVaultAdd(address changeAddress)  public onlyOwner{
        initconfig.vaultAdd = changeAddress;
    }

    // 设置安全地址及
    function setSafeAddr_1(address addr, uint percent)  public onlyOwner{
        initconfig.safeAdd_1 = addr;
        safeAdd_percent_1 = percent;
    }

    function getInit() public view returns (addconfig memory){
        return initconfig;
    }


    function getOrderStatus(uint256 orderNo) public view returns (uint256){
        return orderMapping[orderNo];
    }

    event InMoney( uint256 indexed orderNo,address indexed from, uint256 indexed amount);

}

