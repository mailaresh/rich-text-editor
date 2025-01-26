"use client";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import CustomCheckbox from "./checkbox";

const Editor: React.FC = () => {
  const [currentInput, setCurrentInput] = useState(""); // Track the current content of the editor
  const [isToDoListStarted, setIsToDoListStarted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load items from local storage on refresh
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const loadFromLocalStorage = () => {
    const storedTodos = localStorage.getItem("todoItems");
    if (storedTodos) {
      const todos = JSON.parse(storedTodos);
      todos.forEach((todo: { text: string; checked: boolean }) => {
        insertTodoItem(todo); // Use the existing `insertTodoItem` to ensure React renders correctly
      });
    }
  };

  // Save items to local storage
  const saveToLocalStorage = () => {
    const todos = Array.from(document.querySelectorAll(".todoItem")).map((todo) => {
      const inputField = todo.querySelector("input[type='text']") as HTMLInputElement;
      const checkbox = todo.querySelector("input[type='checkbox']") as HTMLInputElement;
      return {
        text: inputField?.value || "",
        checked: checkbox?.checked || false,
      };
    });
    localStorage.setItem("todoItems", JSON.stringify(todos));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "INPUT") {
      if (e.key === "Enter") {
        e.preventDefault();
        const inputElement = e.target as HTMLInputElement;
        if (inputElement.value.trim() === "") {
          setIsToDoListStarted(false);
          const todoItem = inputElement.closest(".todoItem");
          todoItem?.remove();
          saveToLocalStorage();
          // Move cursor to the end of the editor
          if (editorRef.current) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current); // Select all editor content
            range.collapse(false); // Collapse to the end
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
            editorRef.current.focus();
          }
        } else {
          e.preventDefault(); // Prevent default Enter behavior

          // Find the current to-do item's input field
          const todoInput = e.target as HTMLInputElement;
          const currentTodoItem = todoInput.closest('.flex.items-center');

          // Insert a new to-do item after the current one
          if (currentTodoItem && editorRef.current) {
            const range = document.createRange();
            range.setStartAfter(currentTodoItem);
            range.collapse(true);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
            insertTodoItem();
            saveToLocalStorage();
          }
        }
      }
    } else if (currentInput.endsWith("[]") && !isToDoListStarted) {
      setIsToDoListStarted(true);
      setCurrentInput((prev) => prev.slice(0, -2));
      if (editorRef.current) {
        editorRef.current.textContent = currentInput.slice(0, -2); // Update editor content
      }
      insertTodoItem();
      saveToLocalStorage();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setCurrentInput(editorRef.current.textContent || ""); // Update the state with the current content
    }
  };

  const insertTodoItem = (todo = { text: "", checked: false }) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();

      // Place the cursor at the end of the editor content
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse the range to the end
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Create todoItem container
      const todoItemDiv = document.createElement("div");
      todoItemDiv.className = "todoItem flex items-center";

      // Create checkbox container
      const checkboxContainer = document.createElement("div");
      checkboxContainer.id = "custom-checkbox-container";

      // Render CustomCheckbox into checkboxContainer
      const root = createRoot(checkboxContainer);
      root.render(
        <CustomCheckbox
          checked={todo.checked}
          onChange={() => {
            const todoItem = checkboxContainer.closest(".todoItem");
            const inputField = todoItem?.querySelector('input[type="text"]');
            if (todo.checked) {
              inputField?.classList.add("line-through");
            } else {
              inputField?.classList.remove("line-through");
            }
            saveToLocalStorage();
          }}
        />
      );

      // Create input field
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.className =
        "ml-2 p-1 border rounded-md focus:outline-none " + (todo.checked ? "line-through" : "");
      inputField.value = todo.text;
      inputField.addEventListener("input", saveToLocalStorage);
      inputField.addEventListener("focus", function () {
        this.setAttribute("data-text", this.value);
      });

      // Append checkbox and input field to the to-do item container
      todoItemDiv.appendChild(checkboxContainer);
      todoItemDiv.appendChild(inputField);

      // Append the new to-do item at the end of the editor content
      editorRef.current.appendChild(todoItemDiv);

      // Place the cursor after the inserted node
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse to the end again
      selection?.removeAllRanges();
      selection?.addRange(range);

      inputField.focus();
    }
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
        id="editor"
        ref={editorRef}
        contentEditable
        className="w-[500px] h-[100px] min-h-[200px] max-h-[400px] overflow-y-auto border border-gray-300 p-4 rounded-md focus:outline-none bg-gray-50"
        onKeyUp={handleInput}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Editor;