import { getChargeAddress } from "../clients/client";

describe("test getChargeAddress works", () => {
    test("test works with ropsten id", async () => {
        jest.setTimeout(60000); //1 minute timeou
        const address = getChargeAddress("3");
        expect(address).toEqual("0x3761eb5078fa21d6f47481a1880217947cefe3ee8");
    });

    test("test works with bsctestnet id", async () => {
        jest.setTimeout(60000); //1 minute timeou
        const address = getChargeAddress("97");
        expect(address).toEqual("0x61cfc3970db6c935398ac6457e3eb8579b7252e4b4");
    });
});