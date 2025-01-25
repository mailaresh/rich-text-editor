"use client";
import React, { useState, useEffect, useRef } from "react";
import CustomCheckbox from '../components/checkbox'

const Editor: React.FC = () => {
  const [items, setItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isToDoListStarted, setIsToDoListStarted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load items from local storage on refresh
  useEffect(() => {
    const savedItems = localStorage.getItem("todoItems");
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Save items to local storage
  useEffect(() => {
    localStorage.setItem("todoItems", JSON.stringify(items));
  }, [items]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentInput.trim() !== "") {
        // Single Enter Press
        if (editorRef.current) editorRef.current.innerHTML = "";
        if (isToDoListStarted) {
          setItems([...items, { text: '', checked: false }]); 
        }
        setCurrentInput(""); 
      } else {
        // Double Enter Press
        setCurrentInput(""); 
        setIsToDoListStarted(false);
        // Check if the last item text is empty, if so remove it
        setItems((prevItems) => {
          if (prevItems.length > 0 && prevItems[prevItems.length - 1].text.trim() === "") {
            return prevItems.slice(0, -1);
          }
          return prevItems;
        });
      }
    } else if (e.key === " ") { 
      if (!isToDoListStarted && currentInput.startsWith("[]")) {
        e.preventDefault();
        setIsToDoListStarted(true);
        setCurrentInput(""); 
        if (editorRef.current) editorRef.current.innerHTML = ""; 
        setItems([...items, { text: "", checked: false }]); 
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newInput = editorRef.current.innerHTML;
      setCurrentInput(newInput); 

      // Update on input
      if (isToDoListStarted) {
        setItems((prevItems) => {
          const updatedItems = [...prevItems];
          if (updatedItems.length > 0) {
            updatedItems[updatedItems.length - 1].text = newInput;
          }
          return updatedItems;
        });
      }
    }
  };

  const toggleCheck = (index: number) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
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
        className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
        onKeyUp={handleInput}
        onKeyDown={handleKeyDown}
      ></div>

      {/* To-Do Items */}
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center mb-2 space-x-2 p-2"
          >
            <CustomCheckbox checked={item.checked} onChange={() => toggleCheck(index)} />
            <span
              className={`text-sm ${
                item.checked ? "line-through" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: item.text }}
            ></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Editor;