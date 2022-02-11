// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import fs from "fs";

function makeChunks(arrayToWork: any[]) {
  let i, j, temporary;
  const chunk = 100;
  const chunks = [];
  for (i = 0, j = arrayToWork.length; i < j; i += chunk) {
    temporary = arrayToWork.slice(i, i + chunk);
    chunks.push(temporary);
  }

  return chunks;
}

async function wait() {
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      console.log("waited 10 seconds");
      resolve(true);
    }, 10000)
  );
}

async function getERC721NftIdAndOwners(contractInfo: {
  name: string;
  address: string;
  dumpFileName: string;
}) {
  const NFTChars = await ethers.getContractFactory(contractInfo.name);
  const characters = await NFTChars.attach(contractInfo.address);
  const totalSupply = await characters.totalSupply();
  const characterOwners: any = {};
  const allCharacterIndexes = [];
  for (let index = 0; index < totalSupply.toNumber(); index++) {
    allCharacterIndexes[index] = index;
  }

  const chunks = makeChunks(allCharacterIndexes);
  for (let index = 0; index < chunks.length; index++) {
    console.log(chunks[index].length);
    const chunkCharacters: string[] = [];
    await Promise.all(
      chunks[index].map(async (characterIndex) => {
        const characterId = await characters.tokenByIndex(characterIndex);
        characterOwners[characterId.toString()] = "";
        chunkCharacters.push(characterId.toString());
      })
    );

    await Promise.all(
      chunkCharacters.map(async (characterId) => {
        const owner = await characters.ownerOf(characterId);
        characterOwners[characterId] = owner;
      })
    );

    await wait();
    console.log(
      Object.keys(characterOwners).length,
      " out of: ",
      allCharacterIndexes.length
    );
  }

  const data = JSON.stringify(characterOwners, null, 2);
  fs.writeFileSync(contractInfo.dumpFileName, data);
}

async function main() {
  // await getERC721NftIdAndOwners({
  //   name: "Rytell",
  //   address: "0x0ca68D5768BECA6FCF444C01FE1fb6d47C019b9f",
  //   dumpFileName: "rytellCharactersAndOwners.json",
  // });
  await getERC721NftIdAndOwners({
    name: "CryptoSeals",
    address: "0x0540E4EE0C5CdBA347C2f0E011ACF8651bB70Eb9",
    dumpFileName: "csCharactersAndOwners.json",
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
