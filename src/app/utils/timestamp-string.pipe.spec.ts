import { TimestampStringPipe } from "./timestamp-string.pipe";

describe("TimestampStringPipe", () => {
  it("create an instance", () => {
    const pipe = new TimestampStringPipe();
    expect(pipe).toBeTruthy();
  });
});
