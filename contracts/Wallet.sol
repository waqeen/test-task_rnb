// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Wallet is IERC721Receiver {
	address payable public owner;
	address payable public feeRecipient;
	uint256 public feePercent;

	mapping(address => mapping(address => bool)) private _approvedERC20;
    mapping(address => mapping(address => bool)) private _approvedERC721;


	constructor(address payable _feeRecipient, uint256 _feePercent){
		owner = payable(msg.sender);
		feeRecipient = _feeRecipient;
		feePercent = _feePercent;
	}

	modifier onlyOwner() { //модификатор доступа только для владельца
		require(msg.sender == owner, "Only owner can use this wallet");
		_;
	}

	function setFeePercent(uint256 _newFeePercent) external onlyOwner{
		require(_newFeePercent <= 100, "Fee precent should be less than 100%");
		feePercent = _newFeePercent;
	}

    // Approve ERC20
    function approveERC20(address _tokenAddress, address _spender) external {
        IERC20 token = IERC20(_tokenAddress);
        require(token.approve(_spender, token.balanceOf(msg.sender)), "Approve ERC20 failed");
        _approvedERC20[_tokenAddress][_spender] = true;
    }

    // Approve ERC721
    function approveERC721(address _tokenAddress, address _spender) external {
        IERC721 token = IERC721(_tokenAddress);
        token.approve(_spender, token.balanceOf(msg.sender));
        _approvedERC721[_tokenAddress][_spender] = true;
    }

	//Метод отправки эфира

	function sendEth(address payable _to) external payable {
		require(msg.value > 0, "Amount should be greater than 0");
		require(address(this).balance >= msg.value, "Not enough eth");

		uint256 feeAmount = (msg.value * feePercent) / 100;
		uint256 amountAfterFee = msg.value - feeAmount;

		_to.transfer(amountAfterFee);
		feeRecipient.transfer(feeAmount);
	}
	//Метод отправки ERC-20  токенов

	function sendERC20(address _tokenAddress, address _to, uint256 _value) external onlyOwner{
		require(_value > 0, "Amount should be greater than 0");
		require(_approvedERC20[_tokenAddress][msg.sender], "Sender is not approved for ERC20");
		IERC20 token = IERC20(_tokenAddress);
		require(token.balanceOf(address(this)) >= _value, "Not Enough tokens");
		uint256 feeAmount = (_value * feePercent) / 100;
		uint256 amountAfterFee = _value - feeAmount;

		token.transfer(_to, amountAfterFee);
		token.transfer(feeRecipient, feeAmount);
	}

	//Метод отправки ERC-721  токенов

	function sendERC721(address _tokenAddress, address _to, uint256 _tokenId) external onlyOwner{
		IERC721 token = IERC721(_tokenAddress);
		require(_approvedERC721[_tokenAddress][msg.sender], "Sender is not approved for ERC721");
		token.safeTransferFrom(address(this), _to, _tokenId);

	}
	// Принимаем ETH
	receive() external payable {
    }
    // Принимаем NFT
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }


}