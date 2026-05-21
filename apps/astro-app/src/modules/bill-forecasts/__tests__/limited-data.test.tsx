import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillForecasts } from "../presentation/bill-forecasts";
import { limitedForecast } from "./fixtures";

describe("Forecast display with limited data quality", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    server.use(
      http.get("/api/bills/forecast", () =>
        HttpResponse.json({ data: limitedForecast }),
      ),
    );
  });

  it("shows limited data warning banner", async () => {
    render(<BillForecasts />);

    await screen.findByText("Limited data available");
    expect(
      screen.getByText(/less than 3 months of bill history/i),
    ).toBeInTheDocument();
  });

  it("still renders forecast cards despite limited data", async () => {
    render(<BillForecasts />);

    await screen.findByText("By Category");

    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("$600.00/mo")).toBeInTheDocument();
  });

  it("displays wider confidence ranges reflecting higher uncertainty", async () => {
    render(<BillForecasts />);

    await screen.findByText("By Category");

    // $600 prediction with $300–$900 spread (100% of predicted value)
    expect(screen.getByText("$600.00")).toBeInTheDocument();
    expect(screen.getByText(/\$300\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$900\.00/)).toBeInTheDocument();
  });

  it("renders yearly projection even with limited data", async () => {
    render(<BillForecasts />);

    await screen.findByText("Projected Yearly Spending");
    expect(screen.getByText("$7,200.00")).toBeInTheDocument();
  });
});
