// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CeloNeutralVault
/// @notice Non-custodial stablecoin vault on Celo. Users deposit cUSD/USDC and
///         earn yield; an authorized autonomous agent allocates idle funds to a
///         lending market and can settle payments directly from vault balance.
/// @dev    MVP scope: principal accounting only. Yield distribution accounting
///         is intentionally simple and can be extended to a share-based model.
contract CeloNeutralVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ───────────────────────── State ─────────────────────────

    /// @notice The stablecoin this vault accepts (e.g. cUSD or USDC).
    IERC20 public immutable stable;

    /// @notice Autonomous agent permitted to manage funds and settle payments.
    address public agent;

    /// @notice Aave-style lending pool address (configurable by owner).
    address public lendingPool;

    /// @notice Principal balance tracked per depositor.
    mapping(address => uint256) public balanceOf;

    /// @notice Sum of all user balances.
    uint256 public totalDeposits;

    // ───────────────────────── Events ────────────────────────

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event SuppliedToPool(uint256 amount);
    event PaymentExecuted(address indexed to, uint256 amount, bytes32 ref);
    event AgentUpdated(address indexed newAgent);
    event LendingPoolUpdated(address indexed newPool);

    // ───────────────────────── Modifiers ─────────────────────

    modifier onlyAgent() {
        require(msg.sender == agent, "CeloNeutral: not agent");
        _;
    }

    /// @param _stable Address of the accepted stablecoin.
    /// @param _agent  Address of the autonomous agent (EOA or contract).
    constructor(address _stable, address _agent) Ownable(msg.sender) {
        require(_stable != address(0) && _agent != address(0), "zero addr");
        stable = IERC20(_stable);
        agent = _agent;
    }

    // ───────────────────── User functions ────────────────────

    /// @notice Deposit stablecoins into the vault. Caller must approve first.
    /// @param amount Amount of stablecoin (in token decimals) to deposit.
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "amount = 0");
        stable.safeTransferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    /// @notice Withdraw principal from the vault.
    /// @param amount Amount of stablecoin to withdraw.
    function withdraw(uint256 amount) external nonReentrant {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalDeposits -= amount;
        stable.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    // ─────────────────── Agent-controlled functions ──────────

    /// @notice Agent moves idle vault funds into the lending pool to earn yield.
    /// @dev    Pool integration kept pluggable for the MVP. Uncomment the supply
    ///         call once the target pool's interface is wired in.
    /// @param amount Amount of idle stablecoin to supply.
    function supplyToAave(uint256 amount) external onlyAgent nonReentrant {
        require(lendingPool != address(0), "pool not set");
        require(amount <= stable.balanceOf(address(this)), "exceeds idle");
        stable.forceApprove(lendingPool, amount);
        // IAavePool(lendingPool).supply(address(stable), amount, address(this), 0);
        emit SuppliedToPool(amount);
    }

    /// @notice Agent settles a real-world payment directly from the vault.
    /// @param to     Recipient (merchant / payee).
    /// @param amount Amount of stablecoin to send.
    /// @param ref    Off-chain invoice reference for reconciliation.
    function executePayment(address to, uint256 amount, bytes32 ref)
        external
        onlyAgent
        nonReentrant
    {
        require(to != address(0), "zero recipient");
        require(amount <= stable.balanceOf(address(this)), "insufficient liquidity");
        stable.safeTransfer(to, amount);
        emit PaymentExecuted(to, amount, ref);
    }

    // ───────────────────── Admin functions ───────────────────

    /// @notice Rotate the authorized agent address.
    function setAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "zero addr");
        agent = _agent;
        emit AgentUpdated(_agent);
    }

    /// @notice Set / update the lending pool the agent supplies to.
    function setLendingPool(address _pool) external onlyOwner {
        lendingPool = _pool;
        emit LendingPoolUpdated(_pool);
    }
}
