const hre = require("hardhat");

// console.log(hre);

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECONDS = 365*24*60*60;
  const unlockedTime = currentTimestampInSeconds + ONE_YEAR_IN_SECONDS;

  const lockedAmount = hre.ethers.utils.parseEther("1");
  // console.log(currentTimestampInSeconds, ONE_YEAR_IN_SECONDS, unlockedTime, lockedAmount);

  const MyTest = await hre.ethers.getContractFactory("MyTest");
  const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });

  await myTest.deployed();

  console.log(`Contract containing 1 Eth and address: ${myTest.address}`)
  // console.log(myTest);
}

main().catch(error => {
  console.log(error);
  process.exitCode = 1;
})