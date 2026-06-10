import "react";
import type { DataE2E } from "./data-e2e";

declare module "react" {
  interface HTMLAttributes<T> {
    "data-e2e"?: DataE2E;
  }
}
