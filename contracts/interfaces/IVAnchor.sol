// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC6777 is IERC20 {
  function transferAndCall(
    address,
    uint256,
    bytes calldata
  ) external returns (bool);
}
