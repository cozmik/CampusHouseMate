import { test as base } from "@playwright/test";
import { mockSupabase } from "./supabase";
import type { RawListing } from "./data";

export type MockOptions = {
  listings?: RawListing[];
  authenticated?: boolean;
  conversations?: import("./data").RawConversation[];
  savedListings?: import("./data").RawSavedListing[];
};

export const test = base.extend<{ mockOptions: MockOptions; mockApi: void }>({
  mockOptions: [{}, { option: true }],
  mockApi: [
    async ({ page, mockOptions }, use) => {
      await mockSupabase(page, mockOptions);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
