import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillInsights } from "../presentation/bill-insights";
import { limitedInsights } from "./fixtures";

describe("Minimal history (limited data)", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: limitedInsights }),
      ),
    );
  });

  it("REQ13: limited data warning banner visible", async () => {
    render(<BillInsights />);

    await screen.findByText("Limited data available");
  });

  it("REQ14: warning text mentions less than 3 months", async () => {
    render(<BillInsights />);

    await screen.findByText(/less than 3 months/i);
  });

  it("REQ15: available insights still render despite limited data", async () => {
    render(<BillInsights />);

    await screen.findByText("Top Spending: Utilities");
    expect(
      screen.getByText(/utilities is your largest expense/i),
    ).toBeInTheDocument();
  });

  it("REQ16: spending behavior section still shows content", async () => {
    render(<BillInsights />);

    await screen.findByText("Spending Behavior");
    expect(screen.getByText("Top Spending: Utilities")).toBeInTheDocument();
  });
});
