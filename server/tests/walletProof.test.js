const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Wallet } = require("ethers");
const User = require("../src/models/User");
const routes = require("../src/routes/userRoutes");

async function main() {
  process.env.JWT_SECRET = "wallet-proof-test-only-secret";
  const wallet = Wallet.createRandom();
  const other = Wallet.createRandom();
  const user = { _id: "wallet-test-user", walletAddress: wallet.address.toLowerCase() };
  User.findById = () => ({ select: async () => user });
  User.updateOne = async (filter, update) => {
    if (filter.walletAddress !== user.walletAddress) return { matchedCount: 0, modifiedCount: 0 };
    if (filter["walletChallenge.nonce"] && (user.walletChallenge?.nonce !== filter["walletChallenge.nonce"] || !(user.walletChallenge.expiresAt > filter["walletChallenge.expiresAt"].$gt))) return { matchedCount: 0, modifiedCount: 0 };
    Object.assign(user, update.$set);
    if (update.$unset) delete user.walletChallenge;
    return { matchedCount: 1, modifiedCount: 1 };
  };
  const app = express();
  app.use(express.json());
  app.use("/users", routes);
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise(resolve => server.once("listening", resolve));
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    const call = async (path, body = {}, authenticated = true) => {
      const res = await fetch("http://127.0.0.1:" + server.address().port + "/users/wallet/" + path, {
        method: "POST", headers: { "Content-Type": "application/json", ...(authenticated ? { Authorization: "Bearer " + token } : {}) }, body: JSON.stringify(body)
      });
      return { status: res.status, body: await res.json() };
    };
    assert.equal((await call("challenge", {}, false)).status, 401);
    let challenge = await call("challenge");
    assert.equal(challenge.status, 200);
    assert.equal((await call("verify", { signature: "invalid" })).status, 400);
    assert.equal((await call("verify", { signature: await other.signMessage(challenge.body.message) })).status, 403);
    const signature = await wallet.signMessage(challenge.body.message);
    assert.equal((await call("verify", { signature })).status, 200);
    assert.equal(user.walletProof.address, user.walletAddress);
    assert.equal((await call("verify", { signature })).status, 409);
    challenge = await call("challenge");
    user.walletChallenge.expiresAt = new Date(Date.now() - 1000);
    assert.equal((await call("verify", { signature: await wallet.signMessage(challenge.body.message) })).status, 409);
    for (let i = 0; i < 20; i++) await call("challenge");
    assert.equal((await call("challenge")).status, 429);
    console.log("Wallet proof endpoint tests passed");
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
