import { render, screen } from "@testing-library/react";
import NavBar from "../../app/components/NavBar";
import "@testing-library/jest-dom";

describe("NavBar", () => {
  it("renders the NavBar component", () => {
    render(<NavBar />);
    expect(screen.getByText("Event Ops")).toBeInTheDocument();
  });

  it("contains a link to the home page", () => {
    render(<NavBar />);
    const homeLink = screen.getByText("ホーム");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("contains a link to the settings page", () => {
    render(<NavBar />);
    const settingsLink = screen.getByText("設定");
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("contains a link to the home page in the title", () => {
    render(<NavBar />);
    const titleLink = screen.getByText("Event Ops");
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", "/");
  });

  it("contains a link to the report page", () => {
    render(<NavBar />);
    const reportLink = screen.getByText("レポート");
    expect(reportLink).toBeInTheDocument();
    expect(reportLink).toHaveAttribute("href", "/event-report");
  });
});
