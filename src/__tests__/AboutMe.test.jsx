import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutMe from "../components/AboutMe";
import { LanguageProvider } from "../contexts/LanguageContext";

describe("AboutMe component", () => {
  it("render phan gioi thieu va tab", async () => {
    render(
      <LanguageProvider>
        <AboutMe />
      </LanguageProvider>
    );

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

  it("cho phep chuyen doi qua tab thanh tich (portfolio)", async () => {
    render(
      <LanguageProvider>
        <AboutMe />
      </LanguageProvider>
    );

    const imageItemButton = screen.getByRole("button", {
      name: /30\/03\/2025\s*battle of team ii/i,
    });

    await userEvent.click(imageItemButton);

    const timelineItem = imageItemButton.closest(".timeline-item");
    expect(timelineItem).toBeInTheDocument();
    const thumb = timelineItem.querySelector(".timeline-project-thumb");
    expect(thumb).toBeInTheDocument();

    await waitFor(() => {
      const image = within(thumb).queryByRole("img", { name: /battle of team ii/i });
      const placeholder = thumb.querySelector(".timeline-project-placeholder");
      expect(Boolean(image || placeholder)).toBe(true);
    });
  });
});
