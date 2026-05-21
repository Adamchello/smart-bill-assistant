import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillForecasts } from "../presentation/bill-forecasts";
import { fullForecast } from "./fixtures";

describe("Forecast display with full data quality", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    server.use(
      http.get("/api/bills/forecast", () =>
        HttpResponse.json({ data: fullForecast }),
      ),
    );
  });

  it("shows loading indicator before data arrives", async () => {
    render(<BillForecasts />);

    expect(screen.getByText("Generating forecasts...")).toBeInTheDocument();
  });

  it("renders yearly projection with formatted amount", async () => {
    render(<BillForecasts />);

    await screen.findByText("Projected Yearly Spending");
    expect(screen.getByText("$18,600.00")).toBeInTheDocument();
    expect(screen.getByText("Based on 3 categories")).toBeInTheDocument();
  });

  it("renders monthly totals with amounts and confidence ranges", async () => {
    render(<BillForecasts />);

    await screen.findByText("Monthly Forecast");

    // Month labels appear in both monthly totals and per-category forecasts
    expect(screen.getAllByText("Jun 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$1,550.00").length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText("Jul 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$1,580.00").length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText("Aug 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$1,600.00").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a card per category with name and average", async () => {
    render(<BillForecasts />);

    await screen.findByText("By Category");

    expect(screen.getAllByText("Utilities").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/\$320\.00\/mo/)).toBeInTheDocument();

    expect(screen.getAllByText("Housing").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/\$1,200\.00\/mo/)).toBeInTheDocument();

    expect(screen.getAllByText("Subscriptions").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByText(/\$50\.00\/mo/)).toBeInTheDocument();
  });

  it("shows correct trend label for each direction", async () => {
    render(<BillForecasts />);

    await screen.findByText("By Category");

    const labels = screen.getAllByText(/^(Increasing|Decreasing|Stable)$/);
    const labelTexts = labels.map((el) => el.textContent);

    expect(labelTexts).toContain("Increasing");
    expect(labelTexts).toContain("Decreasing");
    expect(labelTexts).toContain("Stable");
  });

  it("does not show limited data warning for full quality", async () => {
    render(<BillForecasts />);

    await screen.findByText("Projected Yearly Spending");

    expect(
      screen.queryByText("Limited data available"),
    ).not.toBeInTheDocument();
  });

  it("renders per-category monthly forecasts with confidence intervals", async () => {
    render(<BillForecasts />);

    await screen.findByText("By Category");

    // Utilities first month: $340 with $300–$380 range
    expect(screen.getByText("$340.00")).toBeInTheDocument();
    expect(screen.getByText(/\$300\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$380\.00/)).toBeInTheDocument();
  });
});
