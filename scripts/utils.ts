import fs from "fs";

export const jsonName = "deployedtokenMakers.json";

export const deployedAddresses: { [id: number]: string } = JSON.parse(
  fs.readFileSync(jsonName).toString()
);
