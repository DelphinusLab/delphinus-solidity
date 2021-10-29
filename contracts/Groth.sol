// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./ZKPVerifier.sol";
contract GrothVerifier is Verifier {
  function verifyDelphinusTx(uint256[] calldata input)
      public view returns (bool)
  {
      require(input.length == 12, "ZKPVerifier: input length is invalid");

      Proof memory proof = Proof(
          Pairing.G1Point(input[0], input[1]),
          Pairing.G2Point([input[2], input[3]], [input[4], input[5]]),
          Pairing.G1Point(input[6], input[7])
      );

      uint256[] memory inputValues = new uint256[](4);
      for (uint256 i = 0; i < 4; i++) {
          inputValues[i] = input[i + 8];
      }

      if (verify(inputValues, proof) == 0) {
          return true;
      } else {
          return false;
      }
  }
}
