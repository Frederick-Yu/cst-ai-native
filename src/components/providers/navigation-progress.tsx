"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <AppProgressBar
      height="2px"
      color="#0d9488"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
