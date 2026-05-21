import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillForecasts } from "../presentation/bill-forecasts";
import { emptyForecast } from "./fixtures";

describe("Forecast empty state", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
  });

  it("shows a prompt to add data when user has no bills", async () => {
    server.use(
      http.get("/api/bills/forecast", () =>
        HttpResponse.json({ data: emptyForecast }),
      ),
    );

    render(<BillForecasts />);

    await screen.findByText(/no bill data available for forecasting/i);
  });

  it("does not render forecast sections in empty state", async () => {
    server.use(
      http.get("/api/bills/forecast", () =>
        HttpResponse.json({ data: emptyForecast }),
      ),
    );

    render(<BillForecasts />);

    await screen.findByText(/no bill data available/i);

    expect(
      screen.queryByText("Projected Yearly Spending"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Monthly Forecast")).not.toBeInTheDocument();
    expect(screen.queryByText("By Category")).not.toBeInTheDocument();
  });

  it("shows error message when forecast API fails", async () => {
    server.use(
      http.get(
        "/api/bills/forecast",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    render(<BillForecasts />);

    await screen.findByText("Failed to fetch forecasts");
    expect(
      screen.queryByText("Projected Yearly Spending"),
    ).not.toBeInTheDocument();
  });
});
