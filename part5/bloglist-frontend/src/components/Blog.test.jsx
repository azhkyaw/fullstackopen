import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";
import BlogForm from "./BlogForm";
import { expect } from "vitest";
import Togglable from "./Togglable";

const blog = {
  title: "React patterns",
  author: "Michael Chan",
  url: "https://reactpatterns.com/",
  likes: 7,
};

test("renders title and author but does not render url and likes", () => {
  const { container } = render(<Blog blog={blog} />);

  const div = container.querySelector(".blog");
  expect(div).toHaveTextContent("React patterns Michael Chan");
  expect(div).not.toHaveTextContent("https://reactpatterns.com/");
  expect(div).not.toHaveTextContent("7");
});

test("url and likes are shown when show details button is clicked", async () => {
  const { container } = render(<Blog blog={blog} user={{}} />);

  const user = userEvent.setup();
  const button = screen.getByText("view");
  await user.click(button);

  const div = container.querySelector(".blog");
  expect(div).toHaveTextContent("React patterns Michael Chan");
  expect(div).toHaveTextContent("https://reactpatterns.com/");
  expect(div).toHaveTextContent("7");
});

test("clicking like button twice calls event handler twice", async () => {
  const mockHandler = vi.fn();

  render(<Blog blog={blog} onUpdateBlog={mockHandler} user={{}} />);

  const user = userEvent.setup();

  const viewDetailsButton = screen.getByText("view");
  await user.click(viewDetailsButton);

  const likeButton = screen.getByText("like");
  await user.click(likeButton);
  await user.click(likeButton);

  expect(mockHandler.mock.calls).toHaveLength(2);
});

describe("<Togglable />", () => {
  let container;

  beforeEach(() => {
    container = render(
      <Togglable buttonLabel="show...">
        <div className="testDiv">togglable content</div>
      </Togglable>
    ).container;
  });

  test("at start the children are not displayed", () => {
    const div = container.querySelector(".togglableContent");
    expect(div).toBeNull();
  });

  test("after clicking the button, children are displayed", async () => {
    const user = userEvent.setup();
    const button = screen.getByText("show...");
    await user.click(button);

    const div = container.querySelector(".togglableContent");
    expect(div).not.toBeNull();
  });

  test("toggled content can be closed", async () => {
    const user = userEvent.setup();

    const showButton = screen.getByText("show...");
    await user.click(showButton);

    const cancelButton = screen.getByText("cancel");
    await user.click(cancelButton);

    const div = container.querySelector(".togglableContent");
    expect(div).toBeNull();
  });
});

test("<BlogForm /> updates parent state and calls onSubmit", async () => {
  const handleAddBlog = vi.fn();
  const user = userEvent.setup();

  render(<BlogForm onAddBlog={handleAddBlog} />);

  const titleInput = screen.getByPlaceholderText("new title");
  const authorInput = screen.getByPlaceholderText("new author");
  const urlInput = screen.getByPlaceholderText("new url");
  const sendButton = screen.getByText("create");

  await user.type(titleInput, "testing title...");
  await user.type(authorInput, "testing author...");
  await user.type(urlInput, "testing url...");
  await user.click(sendButton);

  console.log(handleAddBlog.mock.calls);
  expect(handleAddBlog.mock.calls).toHaveLength(1);
  expect(handleAddBlog.mock.calls[0][0].title).toBe("testing title...");
  expect(handleAddBlog.mock.calls[0][0].author).toBe("testing author...");
  expect(handleAddBlog.mock.calls[0][0].url).toBe("testing url...");
});
