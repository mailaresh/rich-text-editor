"use client";
import { useEffect, useRef, useState } from "react";
import CustomCheckbox from "./checkbox";

interface TodoItem {
  id: string;
  text: string;
  checked: boolean;
}

const Editor: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isToDoListStarted, setIsToDoListStarted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load items from local storage on refresh
  useEffect(() => {
    const storedTodos = localStorage.getItem("todoItems");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }

    // Ensure editor is focused after loading todos
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Save items to local storage
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem("todoItems", JSON.stringify(todos));
    }
  }, [todos]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (e.key === "Enter" && isToDoListStarted) {
      e.preventDefault();
      const lastChild = editor.lastChild as HTMLElement;
      if (lastChild && (lastChild.lastElementChild as HTMLInputElement)?.value?.trim() === "") {
        const lastTodoId = todos[todos.length - 1]?.id;
        setTodos((prevTodos) => {
          const updatedTodos = prevTodos.slice(0, prevTodos.length - 1); // Remove last todo
          localStorage.setItem("todoItems", JSON.stringify(updatedTodos)); // Update localStorage
          return updatedTodos;
        });
        setIsToDoListStarted(false);
        const newLine = document.createElement("div");
        newLine.innerHTML = "<br>";
        editor.appendChild(newLine);
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(newLine, 0);
        range.collapse(true);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        editor.focus();
        return;
      }

      const newTodo = createTodoItem();
      setTodos((prevTodos) => [...prevTodos, newTodo]);

      // Focus on the input of the newly added todo item
      setTimeout(() => {
        const lastInput = inputRefs.current[inputRefs.current.length - 1];
        if (lastInput) {
          lastInput.focus();
        }
      }, 0);

      return;
    }
  };

  const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;

    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    const text = editor.innerText;

    if (text.endsWith('[] ') && !isToDoListStarted) {
      e.preventDefault();

      // Detect and remove the '[] ' directly from the last text node.
      const lastChild = editor.lastChild as HTMLElement;

      if (lastChild && lastChild?.textContent?.endsWith('[] ')) {
        const updatedText = lastChild.textContent.slice(0, -3); // Remove the last 4 characters ('[] ')
        lastChild.textContent = updatedText; // Update the last text node's content
      }
      setIsToDoListStarted(true);

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const newTodo = createTodoItem();
      setTodos((prevTodos) => [...prevTodos, newTodo]);

      // Focus on the input of the newly added todo item
      setTimeout(() => {
        const lastInput = inputRefs.current[inputRefs.current.length - 1];
        if (lastInput) {
          lastInput.focus();
        }
      }, 0);
    }
  };

  const createTodoItem = (): TodoItem => {
    return { id: Date.now().toString(), text: "", checked: false };
  };

  // Apply formatting commands
  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rich Text To-Do List</h1>

      {/* Formatting Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => applyFormat("bold")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Bold
        </button>
        <button
          onClick={() => applyFormat("italic")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Italic
        </button>
        <button
          onClick={() => applyFormat("underline")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Underline
        </button>
      </div>

      {/* Editable Input Area */}
      <div
        ref={editorRef}
        contentEditable
        className="w-[500px] h-[100px] min-h-[200px] max-h-[400px] overflow-y-auto border border-gray-300 p-4 rounded-md focus:outline-none bg-gray-50"
        onKeyUp={handleInput}
        onKeyDown={handleKeyDown}
      >
        {todos.map((todo, index) => (
          <div key={todo.id} className="todo-item flex items-center space-x-2">
            <CustomCheckbox
              checked={todo.checked}
              onChange={(e) => {
                const updatedTodos = todos.map(t =>
                  t.id === todo.id ? { ...t, checked: e.target.checked } : t
                );
                setTodos(updatedTodos);
              }}
            />
            <input
              ref={(el) => { inputRefs.current[index] = el; }} // Assign ref to input element
              type="text"
              className={`todo-input flex-1 bg-gray-50 focus:outline-none px-2 py-1 rounded ${todo.checked ? "line-through" : ""}`}
              value={todo.text}
              onChange={(e) => {
                const updatedTodos = todos.map(t =>
                  t.id === todo.id ? { ...t, text: e.target.value } : t
                );
                setTodos(updatedTodos);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Editor;