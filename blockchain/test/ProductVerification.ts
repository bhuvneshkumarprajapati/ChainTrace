
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

describe("ProductVerification", async function () {
  const { ethers } = await network.connect();

  it("accepts the correct hash", async function () {
    const contract = await ethers.deployContract(
      "ProductVerification"
    );
    await contract.waitForDeployment();

    await contract.registerProduct(
      "CT-UNIT-001",
      "hash-original"
    );

    const result = await contract.verifyProduct(
      "CT-UNIT-001",
      "hash-original"
    );

    assert.equal(result[0], true);
  });

  it("rejects a tampered hash", async function () {
    const contract = await ethers.deployContract(
      "ProductVerification"
    );
    await contract.waitForDeployment();

    await contract.registerProduct(
      "CT-UNIT-002",
      "hash-original"
    );

    const result = await contract.verifyProduct(
      "CT-UNIT-002",
      "hash-tampered"
    );

    assert.equal(result[0], false);
  });

  it("rejects an unknown product", async function () {
    const contract = await ethers.deployContract(
      "ProductVerification"
    );
    await contract.waitForDeployment();

    const result = await contract.verifyProduct(
      "CT-UNKNOWN-001",
      "any-hash"
    );

    assert.equal(result[0], false);
  });

  it("allows the current owner to add a supply-chain event", async function () {
    const contract = await ethers.deployContract(
      "ProductVerification"
    );
    await contract.waitForDeployment();

    const [owner] = await ethers.getSigners();

    await contract.registerProduct(
      "CT-UNIT-003",
      "hash-original"
    );

    await contract.addSupplyChainEvent(
      "CT-UNIT-003",
      "QUALITY_CHECK",
      owner.address,
      "Delhi",
      "Quality check passed",
      "REF-001"
    );

    const history = await contract.getProductHistory(
      "CT-UNIT-003"
    );

    assert.equal(history.length, 2);
    assert.equal(history[1].eventType, "QUALITY_CHECK");
  });

  it("rejects a supply-chain event from a non-owner", async function () {
    const contract = await ethers.deployContract(
      "ProductVerification"
    );
    await contract.waitForDeployment();

    const [, attacker] = await ethers.getSigners();

    await contract.registerProduct(
      "CT-UNIT-004",
      "hash-original"
    );

    await assert.rejects(
      contract.connect(attacker).addSupplyChainEvent(
        "CT-UNIT-004",
        "FAKE_EVENT",
        attacker.address,
        "Unknown",
        "Unauthorized update",
        "REF-FAKE"
      ),
      /Only current owner can add events/
    );

    const history = await contract.getProductHistory(
      "CT-UNIT-004"
    );

    assert.equal(history.length, 1);
  });
});
