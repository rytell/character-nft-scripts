// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const RytellCharacters = await ethers.getContractFactory("Rytell");
  const characters = await RytellCharacters.attach(
    "0x0ca68D5768BECA6FCF444C01FE1fb6d47C019b9f"
  );
  const totalSupply = await characters.totalSupply();
  const characterOwners: any = {};
  const allCharacterIndexes = [];
  for (let index = 0; index < totalSupply.toNumber(); index++) {
    allCharacterIndexes[index] = index;
  }

  await Promise.all(
    allCharacterIndexes.map(async (characterIndex) => {
      const characterId = await characters.tokenByIndex(characterIndex);
      characterOwners[characterId.toString()] = "";
    })
  );

  await Promise.all(
    Object.keys(characterOwners).map(async (characterId) => {
      const owner = await characters.ownerOf(characterId);
      characterOwners[characterId] = owner;
    })
  );

  const data = JSON.stringify(characterOwners, null, 2);
  fs.writeFileSync("characterOwners.json", data);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
