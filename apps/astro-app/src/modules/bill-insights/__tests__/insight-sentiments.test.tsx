import { render, screen } from "@testing-library/react";
import { server } from "@/__tests__/mock-server";
import { http, HttpResponse } from "msw";
import { queryClient } from "@/lib/query-client";
import { BillInsights } from "../presentation/bill-insights";
import { fullInsights, groupedInsights } from "./fixtures";

describe("Insight sentiments and formatting", () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
  });

  it("REQ10: category badges are visible for insights with categories", async () => {
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: fullInsights }),
      ),
    );

    render(<BillInsights />);

    await screen.findByText("Forecast Alerts");

    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("Pets")).toBeInTheDocument();
    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("REQ11: dollar amounts rendered with font-semibold class", async () => {
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: fullInsights }),
      ),
    );

    render(<BillInsights />);

    await screen.findByText("Forecast Alerts");

    // BoldNumbers wraps dollar amounts in <span class="font-semibold ...">
    const boldSpans = document.querySelectorAll("span.font-semibold");
    const boldTexts = Array.from(boldSpans).map((el) => el.textContent);

    expect(boldTexts).toContain("$50.00");
    expect(boldTexts).toContain("$120.00");
    expect(boldTexts).toContain("140%");
  });

  it("REQ12: grouped insights show group heading with count", async () => {
    server.use(
      http.get("/api/bills/insights", () =>
        HttpResponse.json({ data: groupedInsights }),
      ),
    );

    render(<BillInsights />);

    await screen.findByText("Spending Spikes");
    expect(screen.getByText("(2 categories)")).toBeInTheDocument();
  });
});
