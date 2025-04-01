import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DateForm from "../../app/components/DateForm"; // パスを修正
import "@testing-library/jest-dom";

describe("DateForm", () => {
  const mockOnChange = jest.fn();

  it("ラベルが正しく表示される", () => {
    render(
      <DateForm
        label="日付を選択"
        id="test-date"
        value=""
        onChange={mockOnChange}
      />
    );
    expect(screen.getByLabelText("日付を選択")).toBeInTheDocument();
  });

  it("入力値が変更されるとonChangeが呼び出される", () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState("");
      return (
        <DateForm
          label="日付を選択"
          id="test-date"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            mockOnChange(e);
          }}
        />
      );
    };

    render(<TestComponent />);
    const input = screen.getByLabelText("日付を選択") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2023-10-01" } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("2023-10-01");
  });

  it("初期値が正しく設定される", () => {
    render(
      <DateForm
        label="日付を選択"
        id="test-date"
        value="2023-10-01"
        onChange={mockOnChange}
      />
    );
    const input = screen.getByLabelText("日付を選択") as HTMLInputElement;
    expect(input.value).toBe("2023-10-01");
  });
});
