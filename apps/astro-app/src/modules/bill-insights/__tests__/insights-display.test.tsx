import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillInsights } from "../presentation/bill-insights";
import { fullInsights } from "./fixtures";

describe("Insights display", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: fullInsights }),
      ),
    );
  });

  it("REQ4: shows loading indicator before data loads", () => {
    render(<BillInsights />);

    expect(screen.getByText(/analysing your spending/i)).toBeInTheDocument();
  });

  it("REQ5: section headings rendered", async () => {
    render(<BillInsights />);

    await screen.findByText("Forecast Alerts");
    expect(screen.getByText("Spending Behavior")).toBeInTheDocument();
  });

  it("REQ6: each insight title is visible", async () => {
    render(<BillInsights />);

    await screen.findByText("Utilities Spending Spike");
    expect(screen.getByText("New Category Detected")).toBeInTheDocument();
    expect(screen.getByText("Top Spending: Housing")).toBeInTheDocument();
    expect(screen.getByText("Food Budget On Track")).toBeInTheDocument();
  });

  it("REQ7: each insight description is visible", async () => {
    render(<BillInsights />);

    await screen.findByText("Forecast Alerts");

    expect(screen.getByText(/utilities spending jumped/i)).toBeInTheDocument();
    expect(
      screen.getByText(/pets is a new spending category/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/housing remains your largest expense/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/food spending is trending/i)).toBeInTheDocument();
  });

  it("REQ8: comparison bar shown when comparison data exists", async () => {
    render(<BillInsights />);

    await screen.findByText("Forecast Alerts");

    const previousLabels = screen.getAllByText("Previous");
    const currentLabels = screen.getAllByText("Current");

    // fullInsights has 2 insights with comparisons (spending-spike and top-spending-category)
    expect(previousLabels.length).toBe(2);
    expect(currentLabels.length).toBe(2);
  });

  it("REQ9: no limited data warning when dataQuality is full", async () => {
    render(<BillInsights />);

    await screen.findByText("Forecast Alerts");

    expect(
      screen.queryByText(/limited data available/i),
    ).not.toBeInTheDocument();
  });
});
