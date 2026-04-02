"use client";

import { PortfolioProvider } from "@/contexts/portfolio-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PortfolioProvider>{children}</PortfolioProvider>;
}
