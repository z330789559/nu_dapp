// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface SwapRouterService {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface Erc20Service {
    function balanceOf(address account) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    function burn(uint256 amount) external returns (bool);
}

interface SwapService {
    function swapHttAndBurn(uint256 amountIn) external returns (uint256);
}

contract Chujinpro is Ownable {

    mapping(uint256 => uint256) orderMapping;

    struct addconfig {
        address swapRouterAdd;
        address btcbAdd;
        address ethAdd;htcAdd
        address[] getPath;
        SwapRouterService swapRouterService;
        Erc20Service erc20Service;
        Erc20Service erc20EthService;
        SwapService swapService;
    }

    address signAccount;

    addconfig initconfig;

    constructor(
    ){
        signAccount = msg.sender;
        initconfig.swapRouterAdd = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
        initconfig.btcbAdd = 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c;
        initconfig.ethAdd = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
        initconfig.getPath = [initconfig.ethAdd, initconfig.btcbAdd];
        initconfig.swapRouterService = SwapRouterService(initconfig.swapRouterAdd);
        initconfig.erc20Service = Erc20Service(initconfig.btcbAdd);
        initconfig.erc20EthService = Erc20Service(initconfig.ethAdd);
    }

    function giveMoney(uint256 orderNo, uint256 amountOut, uint256 servicefee, uint256 expireTimer, uint256 deadline,
        bytes32 r, bytes32 s, bytes1 v) public {
        require(msg.sender == tx.origin, "You Are Danger");

        uint256[] memory amountIns;
        uint256 amountIn;
        uint256 totalAmount = amountOut + servicefee;

        require(orderMapping[orderNo] == 0, "Exist Cash Out");
        uint256 nowTimer = block.timestamp * 1000;
        require(expireTimer > nowTimer, "More Than Time");
        require(recoverSigner(genMsg(orderNo, amountOut, servicefee, expireTimer, msg.sender, address(this)), r, s, v) == signAccount, "Sign Not Pass");

        amountIns = initconfig.swapRouterService.getAmountsIn(amountOut, initconfig.getPath);
        amountIn = amountIns[0];
        initconfig.erc20EthService.approve(initconfig.swapRouterAdd, totalAmount * 2);
        initconfig.swapRouterService.swapExactTokensForTokens(amountIn, amountOut, initconfig.getPath, msg.sender, deadline);

        if (servicefee > 0) {

            amountIns = initconfig.swapRouterService.getAmountsIn(servicefee, initconfig.getPath);
            amountIn = amountIns[0];
            uint[] memory amounts = initconfig.swapRouterService.swapExactTokensForTokens(amountIn, servicefee, initconfig.getPath, address(this), deadline); //servicefee

            uint256 part2 = (amounts[1] * 40) / 100;

            initconfig.erc20Service.approve(initconfig.swapRouterAdd, part2);
//            initconfig.erc20HtcService.burn(amounts[1]); // 40% HTC销毁
            part2 = (amounts[1] * 10) / 100;

        }

        orderMapping[orderNo] = totalAmount;

        emit CashOut(orderNo, msg.sender, totalAmount);
    }


    function getBalance(address tokenAddress) public view returns (uint){
        return Erc20Service(tokenAddress).balanceOf(address(this));
    }

    function withdraw(address to, uint256 num, address tokenAddress) public onlyOwner {
        Erc20Service(tokenAddress).transfer(to, num);
    }

    function setSignAccount(address changeAddress) public {
        require(msg.sender == signAccount, "You are not has permisson");
        signAccount = changeAddress;
    }


    function getOrderStatus(uint256 orderNo) public view returns (uint256){
        return orderMapping[orderNo];
    }

    function closeOrder(uint256 orderNo) public onlyOwner {
        orderMapping[orderNo] = 1;
    }


    function genMsg(
        uint256 orderNo,
        uint256 amountOut, uint256 servicefee, uint256 expireTimer,
        address _address,
        address contractAddress
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(orderNo, amountOut, servicefee, expireTimer, _address, contractAddress));
    }


    function recoverSigner(bytes32 message, bytes32 r,
        bytes32 s,
        bytes1 v)
    internal
    pure
    returns (address)
    {
        uint8 vu = uint8(v[0]) * (2 ** (8 * (0)));
        return ecrecover(message, vu, r, s);
    }

    event CashOut(uint256 indexed orderNo, address indexed from, uint256 indexed amount);

}