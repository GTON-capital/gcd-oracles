const hre = require("hardhat");
const { ethers } = hre;

const oracleRegistryRopsten = "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd"
const wethAddressRopsten = "0xc778417e063141139fce010982780140aa0cd5ab"
const wethAggregatorUSDRopsten = "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E" // ETH / USD
const chainlinkedOracleMainAssetRopsten = ""
const uniV3OracleRopsten = "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981"
const vaultParametersRopsten = "0x634cd07fce65a2f2930b55c7b1b20a97196d362f"

const wethAddressEthereum = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const wethAggregatorUSDEthereum = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" // ETH / USD
const vaultParametersEth = ""

const wethAddress = wethAddressRopsten
const wethAggregatorUSD = wethAggregatorUSDRopsten // ETH / USD
const chainlinkedOracleMainAsset = chainlinkedOracleMainAssetRopsten
const vaultParameters = vaultParametersRopsten

async function main() {
    await deployChainlinkedOracleMainAsset()
}

async function deployMockAggregatorWethUSD() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    const name = "ETH / USD"
    const price = 178954000000
    const decimals = 8

    console.log("Deploying contracts with the account:", deployer.address)

    console.log("Account balance:", (await deployer.getBalance()).toString())

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

    console.log("Deploying contracts with the account:", deployer.address)

    console.log("Account balance:", (await deployer.getBalance()).toString())

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

    console.log("Deploying contracts with the account:", deployer.address)

    console.log("Account balance:", (await deployer.getBalance()).toString())

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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
