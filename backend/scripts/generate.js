// Generate random private and public key.

const {secp256k1} = require("ethereum-cryptography/secp256k1")
const {toHex} = require("ethereum-cryptography/utils");
// const {randomBytes}  = require("crypto"); alternative for privateKey generation.

const privateKey = secp256k1.utils.randomPrivateKey();;
const publicKey = secp256k1.getPublicKey(privateKey);;

console.log("PrivateKey: ", toHex(privateKey))
console.log("PublicKey: ", toHex(publicKey))