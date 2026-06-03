// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BasePulse
 * @dev A simple contract to track user "pulses" on Base.
 */
contract BasePulse {
    mapping(address => uint256) public pulseCounts;
    mapping(address => uint256) public lastPulseTimestamp;
    
    uint256 public totalPulses;
    uint256 public totalUniquePulsers;

    event Pulsed(address indexed user, uint256 count, uint256 timestamp);

    /**
     * @dev Records a pulse for the caller.
     * Includes a builder code suffix check if desired, but standard calls work too.
     */
    function pulse() external {
        if (pulseCounts[msg.sender] == 0) {
            totalUniquePulsers++;
        }
        
        pulseCounts[msg.sender]++;
        lastPulseTimestamp[msg.sender] = block.timestamp;
        totalPulses++;

        emit Pulsed(msg.sender, pulseCounts[msg.sender], block.timestamp);
    }

    /**
     * @dev Getter for pulse count.
     */
    function getPulseCount(address user) external view returns (uint256) {
        return pulseCounts[user];
    }
}
