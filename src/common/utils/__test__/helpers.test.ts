import { generateStockKeepingUnit } from "../helpers";

describe("Helper testing", () => {
  it("should return combination of first 3 characters, a dash and number length of the name, if name is single word", () => {
    const name = "Electronics";
    const expectation = `ELE-${name.length}`;
    const res = generateStockKeepingUnit("ELE", name, name.length.toString());

    expect(res).toBe(expectation);
  });

  it("should return combination of first characters from each word, a dash and number length of the name, if name is not a single word", () => {
    const name = "Electronics and Gadgets";
    const res = generateStockKeepingUnit("ELE", name, name.length.toString());

    const expectation = `EAG-${name.length}`;

    expect(res).toBe(expectation);
  });
});
