const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
// console.log(time)
// console.log(loadFixture)
// console.log(time.days)

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// console.log(anyValue);

const { expect } = require("chai");
// You may not import ethers because that is automatically injected from 
// the toolbox but some people may prefer to manually import it
// const { ethers } = require("hardhat");
//console.log(expect);

describe("Mytest", function() {
  async function runEveryTime() {
    const ONE_YEAR_IN_SECONDS = 365*24*60*60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockedTime = (await time.latest()) + ONE_YEAR_IN_SECONDS;
    
    // console.log(unlockedTime);
    // console.log(ONE_YEAR_IN_SECONDS, ONE_GWEI);

    const [owner, otherAccount] = await ethers.getSigners();
    // console.log(owner, otherAccount); 

    const MyTest = await ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });
    
    await myTest.deployed()

    // console.log( myTest, unlockedTime, lockedAmount, owner, otherAccount);
    // console.log(myTest, unlockedTime);
    return { myTest, unlockedTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function() {
    // checking unlocked time
    it("Should check unlocked time", async function() {
      const { myTest, unlockedTime } = await loadFixture(runEveryTime);
      // console.log(myTest, unlockedTime);

      expect(await myTest.unlockedTime()).to.equal(unlockedTime)
    })

    // checking owner 
    it("Should set the right owner", async function() {
      const { myTest, owner } = await loadFixture(runEveryTime);

      expect(await myTest.owner()).to.equal(owner.address);
    });

    // checking the balance
    it("Should store and receive the funds", async function() {
      const { myTest, lockedAmount} = await loadFixture(runEveryTime);

      // const contractBal = await ethers.provider.getBalance(myTest.address);
      // console.log(contractBal.toNumber()); 
      expect(await ethers.provider.getBalance(myTest.address)).to.equal(lockedAmount);
    })

    //condition check
    it("Should fail if the unlocked is not in future", async function(){
      const latestTime = await time.latest()
      // console.log(latestTime / 60 / 60 / 24);

      const MyTest = await ethers.getContractFactory("MyTest");

      await expect(MyTest.deploy(latestTime, { value: 1})).to.revertedWith(
        "Unlock time should be in future"
      );
    })
  });

  describe("Withdrawls", function() {
    describe("Validations", function() {
      it("Should revert it trying to withdraw early", async function() {
        const {myTest} = await loadFixture(runEveryTime);

        await expect(myTest.withdrawal()).to.be.revertedWith("Wait till the time period completes");
      })

      it("Should only allow owner to withdraw", async function() {
        const {myTest, unlockedTime, otherAccount } = await loadFixture(runEveryTime);

        // its a condition that checks for the future time value and 
        // does not return a value, console.log will give undefined
        // const newTime = time.increaseTo(unlockedTime);
        // console.log(newTime);

        await time.increaseTo(unlockedTime);
        await expect(myTest.connect(otherAccount).withdrawal()).to.be.revertedWith("You are not the owner"); 
      })

      it("Should not fail if unlocked time has arrived and owner calls it", async function() {
        const { myTest, unlockedTime } = await loadFixture(runEveryTime);

        await time.increaseTo(unlockedTime);
        await expect(myTest.withdrawal()).not.to.be.reverted;
      })
    })
  })

  // lets check for the events
  describe("EVENTS", function() {
    // submit events
    it("Should emit the event on withdrawals", async function() {
      const { myTest, unlockedTime, lockedAmount } = await loadFixture(runEveryTime);

      await time.increaseTo(unlockedTime);

      await expect(myTest.withdrawal()).to.emit(myTest, "Widthrawal").withArgs(lockedAmount, anyValue);
    })
  })

  // TRANSFER
  describe("Transfer", function() {
    it("Should transfer the funds to the owner", async function() {
      const {myTest, unlockedTime, lockedAmount, owner} = await loadFixture(runEveryTime);

      await time.increaseTo(unlockedTime);
      await expect(myTest.withdrawal()).to.changeEtherBalances(
        [owner, myTest], [lockedAmount, -lockedAmount]
      );
    })
  })

  runEveryTime();
});