const hre = require("hardhat");
const { ethers } = hre;

const wethAddressRopsten = "0xc778417e063141139fce010982780140aa0cd5ab"
const wethAddressEthereum = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const wethAddress = wethAddressRopsten

const usdcAddressRopsten = "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8" // gtonUSDC
const usdcAddressEthereum = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const usdcAddress = usdcAddressRopsten

const wethAggregatorUSDRopsten = "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E"
const wethAggregatorUSDEthereum = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
const wethAggregatorUSD = wethAggregatorUSDRopsten // ETH / USD

const chainlinkedOracleMainAssetRopsten = "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28"
const chainlinkedOracleMainAssetEthereum = ""
const chainlinkedOracleMainAsset = chainlinkedOracleMainAssetRopsten

const vaultParametersRopsten = "0x634cd07fce65a2f2930b55c7b1b20a97196d362f"
const vaultParametersEth = ""
const vaultParameters = vaultParametersRopsten

const gtonAddressRopsten = "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6"
const gtonAddressEthereum = "0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d"
const gtonAddress = gtonAddressRopsten

const oracleRegistryRopsten = "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd"
const oracleRegistryEthereum = ""
const oracleRegistry = oracleRegistryRopsten

const uniV3OracleRopsten = "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981"
const uniV3OracleEthereum = ""
const uniV3Oracle = uniV3OracleRopsten

async function main() {
    await setGtonQuoteParams()
}

async function deployMockAggregatorWethUSD() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    const name = "ETH / USD"
    const price = 178954000000
    const decimals = 8

    console.log("Account : ", deployer.address)

    console.log("Account balance: ", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("MockAggregator")
    const contract = await Factory.deploy(
        name,
        price,
        decimals
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            name,
            price,
            decimals
        ]
      });
}

async function deployChainlinkedOracleMainAsset() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    console.log("Account : ", deployer.address)

    console.log("Account balance: ", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("ChainlinkedOracleMainAsset")
    const contract = await Factory.deploy(
        [wethAddress], // tokenAddresses1 - usd
        [wethAggregatorUSD], // _usdAggregators
        [], // tokenAddresses2 - eth
        [], // _ethAggregators
        wethAddress, // weth
        vaultParameters, // VaultParameters
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            [wethAddress], // tokenAddresses1 - usd
            [wethAggregatorUSD], // _usdAggregators
            [], // tokenAddresses2 - eth
            [], // _ethAggregators
            wethAddress, // weth
            vaultParameters, // VaultParameters
        ]
      });
}

async function deployUniV3() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    console.log("Account : ", deployer.address)

    console.log("Account balance: ", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
        ]
      });
}

async function deployPoolAddressGetter() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    console.log("Account : ", deployer.address)

    console.log("Account balance: ", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("UniV3PoolAddress") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
        ]
      });
}

async function setGtonQuoteParams() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    console.log("Account : ", deployer.address)

    console.log("Account balance: ", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(uniV3Oracle)

    let quoteParams = [
        "0x0000000000000000000000000000000000000000", // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(gtonAddress, quoteParams)
    tx.wait()
    console.log("Set GTON quote params tx: " + tx.hash)
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
