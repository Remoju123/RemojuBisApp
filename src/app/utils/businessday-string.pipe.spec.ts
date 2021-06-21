import { BusinessdayStringPipe } from "./businessday-string.pipe";

describe("BusinessdayStringPipe", () => {
  it("create an instance", () => {
    const pipe = new BusinessdayStringPipe();
    expect(pipe).toBeTruthy();
  });
});
