require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const wallets = {
  "manufacturer@chaintrace.com":
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",

  "supplier@chaintrace.com":
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",

  "distributor@chaintrace.com":
    "0x3C44CdDdB6a900fa2b585dd299e03d12fa4293BC",

  "retailer@chaintrace.com":
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",

  "customer@chaintrace.com":
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
};

const updateWallets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    for (const [email, walletAddress] of Object.entries(
      wallets
    )) {
      const user = await User.findOneAndUpdate(
        { email },
        { walletAddress: walletAddress.toLowerCase() },
        { new: true }
      );

      if (user) {
        console.log(
          `${user.email} -> ${user.walletAddress}`
        );
      } else {
        console.log(
          `User not found: ${email}`
        );
      }
    }

    console.log("Wallet addresses updated successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Wallet update error:",
      error
    );

    process.exit(1);
  }
};

updateWallets();