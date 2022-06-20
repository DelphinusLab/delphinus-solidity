pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract FakeBridge {
    event Deposit(address sender, uint256 amount);
    function deposit(
        address token,
        uint256 amount
    ) public {
        IERC20 underlying_token = IERC20(token);
        
        uint256 balance = underlying_token.balanceOf(msg.sender);
        require(balance >= amount, "Insuffecient Balance");
        //(bool success, bytes memory data) = underlying_token.transferFrom(msg.sender, address(this), amount);
        (bool success, bytes memory data) = address(underlying_token).call(abi.encodeWithSelector(IERC20.transferFrom.selector,msg.sender, address(this), amount));
        //console.log(abi.decode(data, (bool)), "decoded data");
         require(success && (data.length == 0 || abi.decode(data, (bool))), 'TF');
        emit Deposit(msg.sender,  amount);
    }
}
