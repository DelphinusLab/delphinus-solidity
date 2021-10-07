// SPDX-License-Identifier: LGPL-3.0-only
// This file is LGPL3 Licensed
pragma solidity ^0.8.0;

import "./Verifier.sol";
/**
 * @title Elliptic curve operations on twist points for alt_bn128
 * @author Mustafa Al-Bassam (mus@musalbas.com)
 * @dev Homepage: https://github.com/musalbas/solidity-BN256G2
 */

library BN256G2 {
    uint256 internal constant FIELD_MODULUS =
        0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;
    uint256 internal constant TWISTBX =
        0x2b149d40ceb8aaae81be18991be06ac3b5b4c5e559dbefa33267e6dc24a138e5;
    uint256 internal constant TWISTBY =
        0x9713b03af0fed4cd2cafadeed8fdf4a74fa084e52d1852e4a2bd0685c315d2;
    uint256 internal constant PTXX = 0;
    uint256 internal constant PTXY = 1;
    uint256 internal constant PTYX = 2;
    uint256 internal constant PTYY = 3;
    uint256 internal constant PTZX = 4;
    uint256 internal constant PTZY = 5;

    /**
     * @notice Add two twist points
     * @param pt1xx Coefficient 1 of x on point 1
     * @param pt1xy Coefficient 2 of x on point 1
     * @param pt1yx Coefficient 1 of y on point 1
     * @param pt1yy Coefficient 2 of y on point 1
     * @param pt2xx Coefficient 1 of x on point 2
     * @param pt2xy Coefficient 2 of x on point 2
     * @param pt2yx Coefficient 1 of y on point 2
     * @param pt2yy Coefficient 2 of y on point 2
     * @return (pt3xx, pt3xy, pt3yx, pt3yy)
     */
    function ECTwistAdd(
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy,
        uint256 pt2xx,
        uint256 pt2xy,
        uint256 pt2yx,
        uint256 pt2yy
    )
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        if (pt1xx == 0 && pt1xy == 0 && pt1yx == 0 && pt1yy == 0) {
            if (!(pt2xx == 0 && pt2xy == 0 && pt2yx == 0 && pt2yy == 0)) {
                assert(_isOnCurve(pt2xx, pt2xy, pt2yx, pt2yy));
            }
            return (pt2xx, pt2xy, pt2yx, pt2yy);
        } else if (pt2xx == 0 && pt2xy == 0 && pt2yx == 0 && pt2yy == 0) {
            assert(_isOnCurve(pt1xx, pt1xy, pt1yx, pt1yy));
            return (pt1xx, pt1xy, pt1yx, pt1yy);
        }

        assert(_isOnCurve(pt1xx, pt1xy, pt1yx, pt1yy));
        assert(_isOnCurve(pt2xx, pt2xy, pt2yx, pt2yy));

        uint256[6] memory pt3 = _ECTwistAddJacobian(
            pt1xx,
            pt1xy,
            pt1yx,
            pt1yy,
            1,
            0,
            pt2xx,
            pt2xy,
            pt2yx,
            pt2yy,
            1,
            0
        );

        return
            _fromJacobian(
                pt3[PTXX],
                pt3[PTXY],
                pt3[PTYX],
                pt3[PTYY],
                pt3[PTZX],
                pt3[PTZY]
            );
    }

    /**
     * @notice Multiply a twist point by a scalar
     * @param s     Scalar to multiply by
     * @param pt1xx Coefficient 1 of x
     * @param pt1xy Coefficient 2 of x
     * @param pt1yx Coefficient 1 of y
     * @param pt1yy Coefficient 2 of y
     * @return (pt2xx, pt2xy, pt2yx, pt2yy)
     */
    function ECTwistMul(
        uint256 s,
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy
    )
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        uint256 pt1zx = 1;
        if (pt1xx == 0 && pt1xy == 0 && pt1yx == 0 && pt1yy == 0) {
            pt1xx = 1;
            pt1yx = 1;
            pt1zx = 0;
        } else {
            assert(_isOnCurve(pt1xx, pt1xy, pt1yx, pt1yy));
        }

        uint256[6] memory pt2 = _ECTwistMulJacobian(
            s,
            pt1xx,
            pt1xy,
            pt1yx,
            pt1yy,
            pt1zx,
            0
        );

        return
            _fromJacobian(
                pt2[PTXX],
                pt2[PTXY],
                pt2[PTYX],
                pt2[PTYY],
                pt2[PTZX],
                pt2[PTZY]
            );
    }

    /**
     * @notice Get the field modulus
     * @return The field modulus
     */
    function GetFieldModulus() public pure returns (uint256) {
        return FIELD_MODULUS;
    }

    function submod(
        uint256 a,
        uint256 b,
        uint256 n
    ) internal pure returns (uint256) {
        return addmod(a, n - b, n);
    }

    function _FQ2Mul(
        uint256 xx,
        uint256 xy,
        uint256 yx,
        uint256 yy
    ) internal pure returns (uint256, uint256) {
        return (
            submod(
                mulmod(xx, yx, FIELD_MODULUS),
                mulmod(xy, yy, FIELD_MODULUS),
                FIELD_MODULUS
            ),
            addmod(
                mulmod(xx, yy, FIELD_MODULUS),
                mulmod(xy, yx, FIELD_MODULUS),
                FIELD_MODULUS
            )
        );
    }

    function _FQ2Muc(
        uint256 xx,
        uint256 xy,
        uint256 c
    ) internal pure returns (uint256, uint256) {
        return (mulmod(xx, c, FIELD_MODULUS), mulmod(xy, c, FIELD_MODULUS));
    }

    function _FQ2Add(
        uint256 xx,
        uint256 xy,
        uint256 yx,
        uint256 yy
    ) internal pure returns (uint256, uint256) {
        return (addmod(xx, yx, FIELD_MODULUS), addmod(xy, yy, FIELD_MODULUS));
    }

    function _FQ2Sub(
        uint256 xx,
        uint256 xy,
        uint256 yx,
        uint256 yy
    ) internal pure returns (uint256 rx, uint256 ry) {
        return (submod(xx, yx, FIELD_MODULUS), submod(xy, yy, FIELD_MODULUS));
    }

    function _FQ2Div(
        uint256 xx,
        uint256 xy,
        uint256 yx,
        uint256 yy
    ) internal view returns (uint256, uint256) {
        (yx, yy) = _FQ2Inv(yx, yy);
        return _FQ2Mul(xx, xy, yx, yy);
    }

    function _FQ2Inv(uint256 x, uint256 y)
        internal
        view
        returns (uint256, uint256)
    {
        uint256 inv = _modInv(
            addmod(
                mulmod(y, y, FIELD_MODULUS),
                mulmod(x, x, FIELD_MODULUS),
                FIELD_MODULUS
            ),
            FIELD_MODULUS
        );
        return (
            mulmod(x, inv, FIELD_MODULUS),
            FIELD_MODULUS - mulmod(y, inv, FIELD_MODULUS)
        );
    }

    function _isOnCurve(
        uint256 xx,
        uint256 xy,
        uint256 yx,
        uint256 yy
    ) internal pure returns (bool) {
        uint256 yyx;
        uint256 yyy;
        uint256 xxxx;
        uint256 xxxy;
        (yyx, yyy) = _FQ2Mul(yx, yy, yx, yy);
        (xxxx, xxxy) = _FQ2Mul(xx, xy, xx, xy);
        (xxxx, xxxy) = _FQ2Mul(xxxx, xxxy, xx, xy);
        (yyx, yyy) = _FQ2Sub(yyx, yyy, xxxx, xxxy);
        (yyx, yyy) = _FQ2Sub(yyx, yyy, TWISTBX, TWISTBY);
        return yyx == 0 && yyy == 0;
    }

    function _modInv(uint256 a, uint256 n)
        internal
        view
        returns (uint256 result)
    {
        bool success;
        assembly {
            let freemem := mload(0x40)
            mstore(freemem, 0x20)
            mstore(add(freemem, 0x20), 0x20)
            mstore(add(freemem, 0x40), 0x20)
            mstore(add(freemem, 0x60), a)
            mstore(add(freemem, 0x80), sub(n, 2))
            mstore(add(freemem, 0xA0), n)
            success := staticcall(
                sub(gas(), 2000),
                5,
                freemem,
                0xC0,
                freemem,
                0x20
            )
            result := mload(freemem)
        }
        require(success);
    }

    function _fromJacobian(
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy,
        uint256 pt1zx,
        uint256 pt1zy
    )
        internal
        view
        returns (
            uint256 pt2xx,
            uint256 pt2xy,
            uint256 pt2yx,
            uint256 pt2yy
        )
    {
        uint256 invzx;
        uint256 invzy;
        (invzx, invzy) = _FQ2Inv(pt1zx, pt1zy);
        (pt2xx, pt2xy) = _FQ2Mul(pt1xx, pt1xy, invzx, invzy);
        (pt2yx, pt2yy) = _FQ2Mul(pt1yx, pt1yy, invzx, invzy);
    }

    function _ECTwistAddJacobian(
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy,
        uint256 pt1zx,
        uint256 pt1zy,
        uint256 pt2xx,
        uint256 pt2xy,
        uint256 pt2yx,
        uint256 pt2yy,
        uint256 pt2zx,
        uint256 pt2zy
    ) internal pure returns (uint256[6] memory pt3) {
        if (pt1zx == 0 && pt1zy == 0) {
            (
                pt3[PTXX],
                pt3[PTXY],
                pt3[PTYX],
                pt3[PTYY],
                pt3[PTZX],
                pt3[PTZY]
            ) = (pt2xx, pt2xy, pt2yx, pt2yy, pt2zx, pt2zy);
            return pt3;
        } else if (pt2zx == 0 && pt2zy == 0) {
            (
                pt3[PTXX],
                pt3[PTXY],
                pt3[PTYX],
                pt3[PTYY],
                pt3[PTZX],
                pt3[PTZY]
            ) = (pt1xx, pt1xy, pt1yx, pt1yy, pt1zx, pt1zy);
            return pt3;
        }

        (pt2yx, pt2yy) = _FQ2Mul(pt2yx, pt2yy, pt1zx, pt1zy); // U1 = y2 * z1
        (pt3[PTYX], pt3[PTYY]) = _FQ2Mul(pt1yx, pt1yy, pt2zx, pt2zy); // U2 = y1 * z2
        (pt2xx, pt2xy) = _FQ2Mul(pt2xx, pt2xy, pt1zx, pt1zy); // V1 = x2 * z1
        (pt3[PTZX], pt3[PTZY]) = _FQ2Mul(pt1xx, pt1xy, pt2zx, pt2zy); // V2 = x1 * z2

        if (pt2xx == pt3[PTZX] && pt2xy == pt3[PTZY]) {
            if (pt2yx == pt3[PTYX] && pt2yy == pt3[PTYY]) {
                (
                    pt3[PTXX],
                    pt3[PTXY],
                    pt3[PTYX],
                    pt3[PTYY],
                    pt3[PTZX],
                    pt3[PTZY]
                ) = _ECTwistDoubleJacobian(
                    pt1xx,
                    pt1xy,
                    pt1yx,
                    pt1yy,
                    pt1zx,
                    pt1zy
                );
                return pt3;
            }
            (
                pt3[PTXX],
                pt3[PTXY],
                pt3[PTYX],
                pt3[PTYY],
                pt3[PTZX],
                pt3[PTZY]
            ) = (1, 0, 1, 0, 0, 0);
            return pt3;
        }

        (pt2zx, pt2zy) = _FQ2Mul(pt1zx, pt1zy, pt2zx, pt2zy); // W = z1 * z2
        (pt1xx, pt1xy) = _FQ2Sub(pt2yx, pt2yy, pt3[PTYX], pt3[PTYY]); // U = U1 - U2
        (pt1yx, pt1yy) = _FQ2Sub(pt2xx, pt2xy, pt3[PTZX], pt3[PTZY]); // V = V1 - V2
        (pt1zx, pt1zy) = _FQ2Mul(pt1yx, pt1yy, pt1yx, pt1yy); // V_squared = V * V
        (pt2yx, pt2yy) = _FQ2Mul(pt1zx, pt1zy, pt3[PTZX], pt3[PTZY]); // V_squared_times_V2 = V_squared * V2
        (pt1zx, pt1zy) = _FQ2Mul(pt1zx, pt1zy, pt1yx, pt1yy); // V_cubed = V * V_squared
        (pt3[PTZX], pt3[PTZY]) = _FQ2Mul(pt1zx, pt1zy, pt2zx, pt2zy); // newz = V_cubed * W
        (pt2xx, pt2xy) = _FQ2Mul(pt1xx, pt1xy, pt1xx, pt1xy); // U * U
        (pt2xx, pt2xy) = _FQ2Mul(pt2xx, pt2xy, pt2zx, pt2zy); // U * U * W
        (pt2xx, pt2xy) = _FQ2Sub(pt2xx, pt2xy, pt1zx, pt1zy); // U * U * W - V_cubed
        (pt2zx, pt2zy) = _FQ2Muc(pt2yx, pt2yy, 2); // 2 * V_squared_times_V2
        (pt2xx, pt2xy) = _FQ2Sub(pt2xx, pt2xy, pt2zx, pt2zy); // A = U * U * W - V_cubed - 2 * V_squared_times_V2
        (pt3[PTXX], pt3[PTXY]) = _FQ2Mul(pt1yx, pt1yy, pt2xx, pt2xy); // newx = V * A
        (pt1yx, pt1yy) = _FQ2Sub(pt2yx, pt2yy, pt2xx, pt2xy); // V_squared_times_V2 - A
        (pt1yx, pt1yy) = _FQ2Mul(pt1xx, pt1xy, pt1yx, pt1yy); // U * (V_squared_times_V2 - A)
        (pt1xx, pt1xy) = _FQ2Mul(pt1zx, pt1zy, pt3[PTYX], pt3[PTYY]); // V_cubed * U2
        (pt3[PTYX], pt3[PTYY]) = _FQ2Sub(pt1yx, pt1yy, pt1xx, pt1xy); // newy = U * (V_squared_times_V2 - A) - V_cubed * U2
    }

    function _ECTwistDoubleJacobian(
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy,
        uint256 pt1zx,
        uint256 pt1zy
    )
        internal
        pure
        returns (
            uint256 pt2xx,
            uint256 pt2xy,
            uint256 pt2yx,
            uint256 pt2yy,
            uint256 pt2zx,
            uint256 pt2zy
        )
    {
        (pt2xx, pt2xy) = _FQ2Muc(pt1xx, pt1xy, 3); // 3 * x
        (pt2xx, pt2xy) = _FQ2Mul(pt2xx, pt2xy, pt1xx, pt1xy); // W = 3 * x * x
        (pt1zx, pt1zy) = _FQ2Mul(pt1yx, pt1yy, pt1zx, pt1zy); // S = y * z
        (pt2yx, pt2yy) = _FQ2Mul(pt1xx, pt1xy, pt1yx, pt1yy); // x * y
        (pt2yx, pt2yy) = _FQ2Mul(pt2yx, pt2yy, pt1zx, pt1zy); // B = x * y * S
        (pt1xx, pt1xy) = _FQ2Mul(pt2xx, pt2xy, pt2xx, pt2xy); // W * W
        (pt2zx, pt2zy) = _FQ2Muc(pt2yx, pt2yy, 8); // 8 * B
        (pt1xx, pt1xy) = _FQ2Sub(pt1xx, pt1xy, pt2zx, pt2zy); // H = W * W - 8 * B
        (pt2zx, pt2zy) = _FQ2Mul(pt1zx, pt1zy, pt1zx, pt1zy); // S_squared = S * S
        (pt2yx, pt2yy) = _FQ2Muc(pt2yx, pt2yy, 4); // 4 * B
        (pt2yx, pt2yy) = _FQ2Sub(pt2yx, pt2yy, pt1xx, pt1xy); // 4 * B - H
        (pt2yx, pt2yy) = _FQ2Mul(pt2yx, pt2yy, pt2xx, pt2xy); // W * (4 * B - H)
        (pt2xx, pt2xy) = _FQ2Muc(pt1yx, pt1yy, 8); // 8 * y
        (pt2xx, pt2xy) = _FQ2Mul(pt2xx, pt2xy, pt1yx, pt1yy); // 8 * y * y
        (pt2xx, pt2xy) = _FQ2Mul(pt2xx, pt2xy, pt2zx, pt2zy); // 8 * y * y * S_squared
        (pt2yx, pt2yy) = _FQ2Sub(pt2yx, pt2yy, pt2xx, pt2xy); // newy = W * (4 * B - H) - 8 * y * y * S_squared
        (pt2xx, pt2xy) = _FQ2Muc(pt1xx, pt1xy, 2); // 2 * H
        (pt2xx, pt2xy) = _FQ2Mul(pt2xx, pt2xy, pt1zx, pt1zy); // newx = 2 * H * S
        (pt2zx, pt2zy) = _FQ2Mul(pt1zx, pt1zy, pt2zx, pt2zy); // S * S_squared
        (pt2zx, pt2zy) = _FQ2Muc(pt2zx, pt2zy, 8); // newz = 8 * S * S_squared
    }

    function _ECTwistMulJacobian(
        uint256 d,
        uint256 pt1xx,
        uint256 pt1xy,
        uint256 pt1yx,
        uint256 pt1yy,
        uint256 pt1zx,
        uint256 pt1zy
    ) internal pure returns (uint256[6] memory pt2) {
        while (d != 0) {
            if ((d & 1) != 0) {
                pt2 = _ECTwistAddJacobian(
                    pt2[PTXX],
                    pt2[PTXY],
                    pt2[PTYX],
                    pt2[PTYY],
                    pt2[PTZX],
                    pt2[PTZY],
                    pt1xx,
                    pt1xy,
                    pt1yx,
                    pt1yy,
                    pt1zx,
                    pt1zy
                );
            }
            (pt1xx, pt1xy, pt1yx, pt1yy, pt1zx, pt1zy) = _ECTwistDoubleJacobian(
                pt1xx,
                pt1xy,
                pt1yx,
                pt1yy,
                pt1zx,
                pt1zy
            );

            d = d / 2;
        }
    }
}
// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;

library Pairing {
    struct G1Point {
        uint256 X;
        uint256 Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }

    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        return
            G2Point(
                [
                    10857046999023057135944570762232829481370756359578518086990519993285655852781,
                    11559732032986387107991004021392285783925812861821192530917403151452391805634
                ],
                [
                    8495653923123431417604973247489272438418190587263600148770280649306958101930,
                    4082367875863433681332203403145435568316851327593401208105741076214120093531
                ]
            );
    }

    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint256 q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0) return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }

    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2)
        internal
        view
        returns (G1Point memory r)
    {
        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success
            case 0 {
                invalid()
            }
        }
        require(success);
    }

    /// @return r the sum of two points of G2
    function addition(G2Point memory p1, G2Point memory p2)
        internal
        view
        returns (G2Point memory r)
    {
        (r.X[0], r.X[1], r.Y[0], r.Y[1]) = BN256G2.ECTwistAdd(
            p1.X[0],
            p1.X[1],
            p1.Y[0],
            p1.Y[1],
            p2.X[0],
            p2.X[1],
            p2.Y[0],
            p2.Y[1]
        );
    }

    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint256 s)
        internal
        view
        returns (G1Point memory r)
    {
        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success
            case 0 {
                invalid()
            }
        }
        require(success);
    }

    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2)
        internal
        view
        returns (bool)
    {
        require(p1.length == p2.length);
        uint256 elements = p1.length;
        uint256 inputSize = elements * 6;
        uint256[] memory input = new uint256[](inputSize);
        for (uint256 i = 0; i < elements; i++) {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint256[1] memory out;
        bool success;
        assembly {
            success := staticcall(
                sub(gas(), 2000),
                8,
                add(input, 0x20),
                mul(inputSize, 0x20),
                out,
                0x20
            )
            // Use "invalid" to make gas estimation work
            switch success
            case 0 {
                invalid()
            }
        }
        require(success);
        return out[0] != 0;
    }

    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(
        G1Point memory a1,
        G2Point memory a2,
        G1Point memory b1,
        G2Point memory b2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }

    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
        G1Point memory a1,
        G2Point memory a2,
        G1Point memory b1,
        G2Point memory b2,
        G1Point memory c1,
        G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }

    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
        G1Point memory a1,
        G2Point memory a2,
        G1Point memory b1,
        G2Point memory b2,
        G1Point memory c1,
        G2Point memory c2,
        G1Point memory d1,
        G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract ZKPVerifier is Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }

    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(
            uint256(
                0x1df2f70110c8ea114947f744d8d71b3af7843dfb7932d9bebd5e84b1c7aabe9f
            ),
            uint256(
                0x0b153ff8185aeac95ec583e8c7c005632e659f6879f2d10d18f06074fb7cd59d
            )
        );
        vk.beta = Pairing.G2Point(
            [
                uint256(
                    0x120c95a0e26a4296cc7a35cb0d030207bdd483e40749c809775620490d4ef0d2
                ),
                uint256(
                    0x10cf28487af541b2dbdc09e0f1ebd2f41ec24941872ca3417495a15af8aecd28
                )
            ],
            [
                uint256(
                    0x23ef60ae1319bdb6aafcb0c4c6814618697a71fed0d441d55dff64286d2101fb
                ),
                uint256(
                    0x176e7c8c2ae886e6ea7312f93e721f1971fa76d3e3e88701f62dfd6793d9cf81
                )
            ]
        );
        vk.gamma = Pairing.G2Point(
            [
                uint256(
                    0x1359dda420c0450418c7d8ebb007934adfd2e9bcb6c0abf716a78fe0a545c14c
                ),
                uint256(
                    0x283a4dc098bbf09d52c9524edd67ac93af9f29e11d911afa81974b39c66eafa1
                )
            ],
            [
                uint256(
                    0x048a42c74a0c8d7da837851518a93120b7177394006a6a56d2a897ec2018607a
                ),
                uint256(
                    0x211990fa49f5211494231762560cef87e51de0f6eb9e7e36f4adac560e15944b
                )
            ]
        );
        vk.delta = Pairing.G2Point(
            [
                uint256(
                    0x2e1f141dee6fcf7a6df112f6d0dbe51120d4f758b7ab631fcf63f9f770ed5a2f
                ),
                uint256(
                    0x09de0e517d4b85d1faaa555d54e801d59673bc1710afa3af720eb3a2ebacdc89
                )
            ],
            [
                uint256(
                    0x18c0a72180c63625f444f8448e2fe31a806f90b1d0089bbec03722994eefc1ca
                ),
                uint256(
                    0x0a9f50b6aa04aee5875c840c0f68f23888b88a9f2cff836997b65de81ce9594e
                )
            ]
        );
        vk.gamma_abc = new Pairing.G1Point[](5);
        vk.gamma_abc[0] = Pairing.G1Point(
            uint256(
                0x1576cd54a61148cfef0359bfdf4df9ccc0a850d3ca009a64bef8d77f7c19bc3c
            ),
            uint256(
                0x0f3b613f7a0868bf008d93c7bc19f9d01d3d715de55225b9fb73e48bda351acb
            )
        );
        vk.gamma_abc[1] = Pairing.G1Point(
            uint256(
                0x02cd7fbeee2feadf9cd70317961a7d25931e92459ac09d11c1b3a1e1bfd003c7
            ),
            uint256(
                0x18941a5660af7d9ddae301db91c92e1c7b7963222d3ac1b574cf9b0971a661bf
            )
        );
        vk.gamma_abc[2] = Pairing.G1Point(
            uint256(
                0x0f5a51ca087136a5a12e6e74843ae62aee33bd4ebc6b200ea3091502c18a1ec2
            ),
            uint256(
                0x29c6b13697c6549e3348b217396732c9a2f6f38dae6a54dad25b86ee1d8b0854
            )
        );
        vk.gamma_abc[3] = Pairing.G1Point(
            uint256(
                0x24e62b8e777216c92e14c3be950099f55644b9da7dae3c3069ea4659a6d99cf8
            ),
            uint256(
                0x1330cd88b2cbc781306856ba494b8df918525a9bfef7817017b578b51ce458d0
            )
        );
        vk.gamma_abc[4] = Pairing.G1Point(
            uint256(
                0x073586dc1dbb8c27ef11e46900f4f4b2935e661840b9bd70256cfdcc192ca05f
            ),
            uint256(
                0x2996ed7f3725974924968ec6cbfa543a741f50228e846c1a5283abcc0d790754
            )
        );
    }

    function verify(uint256[] memory input, Proof memory proof)
        internal
        view
        returns (uint256)
    {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint256 i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(
                vk_x,
                Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i])
            );
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if (
            !Pairing.pairingProd4(
                proof.a,
                proof.b,
                Pairing.negate(vk_x),
                vk.gamma,
                Pairing.negate(proof.c),
                vk.delta,
                Pairing.negate(vk.alpha),
                vk.beta
            )
        ) return 1;
        return 0;
    }

    function verifyTx(uint256[] calldata input)
        public view override returns (bool)
    {
        Proof memory proof = Proof(
            Pairing.G1Point(input[0], input[1]),
            Pairing.G2Point([input[2], input[3]], [input[4], input[5]]),
            Pairing.G1Point(input[6], input[7])
        );

        uint256[] memory inputValues = new uint256[](4);
        for (uint256 i = 8; i < input.length; i++) {
            inputValues[i] = input[i];
        }

        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
