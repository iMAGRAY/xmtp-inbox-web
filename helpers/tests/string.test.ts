//@ts-nocheck
import {
  isEnsAddress,
  formatDate,
  formatTime,
  getConversationKey,
  shortAddress,
  truncate,
  isValidRecipientAddressFormat,
} from "../string";
import { expect } from "@jest/globals";

describe("truncate", () => {
  it("should return the original string if its length is less than the length param", () => {
    expect(truncate("123 string", 10)).toBe("123 string");
  });
  it("should return a truncated string if its length is greater than the length param", () => {
    expect(truncate("123 string", 6)).toBe("123...");
  });
  it("should return an empty string for unexpected string input", () => {
    expect(truncate(undefined, 3)).toBe("");
  });
});

describe("formatDate", () => {
  it("should return proper en-US formatted date", () => {
    const date = new Date(2023, 0, 26);
    expect(formatDate(date)).toBe("1/26/2023");
  });
  it("should handle falsey dates", () => {
    expect(formatDate(undefined)).toBe("");
  });
});

describe("formatTime", () => {
  it("should return formatted time by date, ignoring seconds if added", () => {
    let date = new Date(2023, 0, 26, 1, 40, 23);

    expect(formatTime(date)).toBe("1:40 AM");

    date = new Date(2023, 0, 26, 13, 40, 23);
    expect(formatTime(date)).toBe("1:40 PM");
  });
  it("should handle falsey dates", () => {
    expect(formatTime(undefined)).toBe("");
  });
  it("should handle falsey minutes seconds or hours", () => {
    let date = new Date(2023, 0, 26, 15, 30, 20);
    expect(formatTime(date)).toBe("3:30 PM");
    date = new Date(2023, 0, 26, 15, 30);
    expect(formatTime(date)).toBe("3:30 PM");
    date = new Date(2023, 0, 26, 15);
    expect(formatTime(date)).toBe("3:00 PM");
    date = new Date(2023, 0, 26);
    expect(formatTime(date)).toBe("12:00 AM");
  });
});

describe("isEnsAddress", () => {
  it("should return true if address ends with .eth", () => {
    expect(isEnsAddress("test.eth")).toBe(true);
  });
  it("should return false if address does not include eth", () => {
    expect(isEnsAddress("01201209483434")).toBe(false);
  });
  it("should return false if address includes but does not end with .eth", () => {
    expect(isEnsAddress("test.noteth")).toBe(false);
    expect(isEnsAddress("eth.test")).toBe(false);
  });
  it("should return false if invalid address", () => {
    expect(isEnsAddress("")).toBe(false);
  });

  describe("shortAddress", () => {
    it("should return properly formatted address with long addresses that start with 0x", () => {
      const address = "0x3843594754958459849584232930";
      expect(shortAddress(address)).toBe("0x3843...2930");
    });
    it("should not format long addresses that do not start with 0x", () => {
      const address = "123843594754958459849584232930";
      expect(shortAddress(address)).toBe(address);
    });
    it("should not format short addresses that start with 0x", () => {
      const address = "0xabc";
      expect(shortAddress(address)).toBe(address);
    });
    it("should not format short addresses that do not start with 0x", () => {
      const address = "abc";
      expect(shortAddress(address)).toBe(address);
    });
    it("should handle empty string inputs by returning an empty string", () => {
      expect(shortAddress("")).toBe("");
    });
  });
});

describe("getConversationKey", () => {
  let conversation = {
    context: {
      conversationId: "testConversationId",
    },
    peerAddress: "testPeerAddress",
  };
  it("should send back formatted conversation key if conversation id exists", () => {
    expect(getConversationKey(conversation)).toBe(
      "testPeerAddress/testConversationId",
    );
  });
  it("should send back peer address only if conversation key if conversation id does not exist", () => {
    conversation.context.conversationId = undefined;
    expect(getConversationKey(conversation)).toBe("testPeerAddress");
  });
  it("should handle falsey inputs by returning empty string", () => {
    let conversation = undefined;
    expect(getConversationKey(conversation)).toBe("");
  });
});

describe("isValidRecipientAddressFormat", () => {
  it("should return true if address ends with .eth", () => {
    expect(isValidRecipientAddressFormat("test.eth")).toBe(true);
  });
  it("should return true if address starts with 0x and is the right length", () => {
    expect(
      isValidRecipientAddressFormat(
        "0x1234567890123456789012345678901234567890",
      ),
    ).toBe(true);
  });
  it("should return false if address starts with 0x and is not the right length", () => {
    expect(isValidRecipientAddressFormat("0xwrongLength")).toBe(false);
  });
  it("should return false if invalid address", () => {
    expect(isValidRecipientAddressFormat("")).toBe(false);
  });
});
