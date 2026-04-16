import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeroSection from "../components/HeroSection";

describe("HeroSection", () => {
  it("hien thi hero content chinh", () => {
    render(<HeroSection dark={false} onToggle={() => {}} />);

    expect(screen.getByRole("heading", { name: /strength\./i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /xem hành trình/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /kết nối với mình/i })).toBeInTheDocument();
  });

  it("cho phep chuyen avatar bang nut next", async () => {
    render(<HeroSection dark={false} onToggle={() => {}} />);
    const nextButton = screen.getByRole("button", { name: /next image/i });
    const firstSlide = screen.getByRole("img", {
      name: /nguyen thanh tam tap calisthenics o tu the dung tren thanh xa/i,
    });

    expect(firstSlide).toHaveAttribute("fetchpriority", "high");

    await userEvent.click(nextButton);

    await waitFor(() =>
      expect(
        screen.getByRole("img", {
          name: /nguyen thanh tam luyen ky nang calisthenics voi dong tac can bang/i,
        })
      ).toBeInTheDocument()
    );
  });
});
