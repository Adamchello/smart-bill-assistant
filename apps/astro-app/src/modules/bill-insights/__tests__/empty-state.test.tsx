import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillInsights } from "../presentation/bill-insights";
import { emptyInsights } from "./fixtures";

describe("Insights empty state", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
  });

  it("REQ1: shows empty state message when no insights available", async () => {
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: emptyInsights }),
      ),
    );

    render(<BillInsights />);

    await screen.findByText(/no insights available yet/i);
  });

  it("REQ2: no section headings rendered in empty state", async () => {
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: emptyInsights }),
      ),
    );

    render(<BillInsights />);

    await screen.findByText(/no insights available yet/i);

    expect(screen.queryByText("Forecast Alerts")).not.toBeInTheDocument();
    expect(screen.queryByText("Spending Behavior")).not.toBeInTheDocument();
    expect(screen.queryByText("Optimization Tips")).not.toBeInTheDocument();
  });

  it("REQ3: server error shows error message", async () => {
    server.use(
      http.get(
        "/api/bills/insights",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    render(<BillInsights />);

    await screen.findByText("Failed to fetch insights");
  });
});
