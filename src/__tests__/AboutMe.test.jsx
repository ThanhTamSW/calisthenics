import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutMe from "../components/AboutMe";

describe("AboutMe", () => {
  it("toggle mo dong timeline va hien thi chips cho moc khong co anh", async () => {
    render(<AboutMe />);

    const timelineTitle = screen
      .getAllByText(/bắt đầu hành trình calisthenics/i)
      .find((node) => node.classList.contains("timeline-title"));
    expect(timelineTitle).toBeDefined();
    const noImageItemButton = timelineTitle.closest("button");

    expect(noImageItemButton).toBeInTheDocument();
    expect(noImageItemButton).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(noImageItemButton);
    expect(noImageItemButton).toHaveAttribute("aria-expanded", "true");

    const timelineItem = noImageItemButton.closest(".timeline-item");
    expect(timelineItem).toBeInTheDocument();
    expect(timelineItem.querySelector(".timeline-project-thumb")).toBeNull();
    expect(within(timelineItem).getByText(/^hành trình$/i)).toBeInTheDocument();
  });

  it("mo moc co anh se hien thi thumb va anh timeline", async () => {
    render(<AboutMe />);

    const imageItemButton = screen.getByRole("button", {
      name: /30\/03\/2025\s*battle of team ii/i,
    });

    await userEvent.click(imageItemButton);

    const timelineItem = imageItemButton.closest(".timeline-item");
    expect(timelineItem).toBeInTheDocument();
    expect(timelineItem.querySelector(".timeline-project-thumb")).toBeInTheDocument();
    expect(within(timelineItem).getByRole("img", { name: /battle of team ii/i })).toBeInTheDocument();
  });
});
