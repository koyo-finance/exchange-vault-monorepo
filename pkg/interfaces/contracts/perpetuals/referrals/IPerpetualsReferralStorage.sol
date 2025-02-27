// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

interface IPerpetualsReferralStorage {
    function codeOwners(bytes32 _code) external view returns (address);

    function getTraderReferralInfo(address _account) external view returns (bytes32, address);

    function setTraderReferralCode(address _account, bytes32 _code) external;

    function setTier(
        uint256 _tierId,
        uint256 _totalRebate,
        uint256 _discountShare
    ) external;

    function setReferrerTier(address _referrer, uint256 _tierId) external;

    function govSetCodeOwner(bytes32 _code, address _newAccount) external;
}
