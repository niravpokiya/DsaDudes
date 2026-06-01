import { useEffect } from "react";

export default function useResizablePanel(setEditorHeight) {
  useEffect(() => {
    let isResizing = false;

    const handleMouseDown = () => {
      isResizing = true;
      document.body.style.userSelect = "none"; // prevent text selection
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      setEditorHeight(e.clientY); // set new height based on cursor
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.body.style.userSelect = "auto";
    };

    const resizer = document.getElementById("drag-bar");
    if (resizer) resizer.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (resizer) resizer.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setEditorHeight]);
}
