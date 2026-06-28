import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import ContactForm from "../components/ContactForm";
import { LanguageProvider } from "../contexts/LanguageContext";

describe("ContactForm", () => {
  const fillRequired = async () => {
    const name = screen.getByLabelText(/tên của bạn/i);
    const email = screen.getByLabelText(/email/i);
    const message = screen.getByLabelText(/tin nhắn/i);
    await userEvent.type(name, "Test User");
    await userEvent.type(email, "test@example.com");
    await userEvent.type(message, "Hello from unit test!");
  };

  it("hiển thị lỗi validate khi submit trống", async () => {
    render(
      <LanguageProvider>
        <ContactForm />
      </LanguageProvider>
    );
    const submit = screen.getByRole("button", { name: /gửi tin nhắn/i });
    await act(async () => {
      await userEvent.click(submit);
    });
    await waitFor(() =>
      expect(screen.getAllByText(/chưa nhập/i).length).toBeGreaterThanOrEqual(3)
    );
  });

  it("submit thành công sẽ reset form và hiển thị thông báo", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          message: "Gửi thành công",
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <LanguageProvider>
        <ContactForm />
      </LanguageProvider>
    );
    await fillRequired();
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /gửi tin nhắn/i }));
    });

    await waitFor(() =>
      expect(screen.getByText(/Gửi thành công/i)).toBeInTheDocument()
    );
    expect(screen.queryByLabelText(/tên của bạn/i)).not.toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("hiển thị banner lỗi khi backend trả lỗi", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, message: "Server error" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <LanguageProvider>
        <ContactForm />
      </LanguageProvider>
    );
    await fillRequired();
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /gửi tin nhắn/i }));
    });

    await waitFor(() =>
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
