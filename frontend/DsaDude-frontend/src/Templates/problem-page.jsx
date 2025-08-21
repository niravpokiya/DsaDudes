import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import languageSnippets from "../snippets/snippet";
import CompareOutputs from "./../Helpers/OutputChecker";

export default function ProblemsPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(languageSnippets["javascript"].code);
  const [running, setRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(0);
  const [sampleOutputs, setSampleOutputs] = useState([]);
  const [outputMatch, setOutputMatch] = useState(2);
  const [editorHeight, setEditorHeight] = useState(400); // for resizable dragger...
  const isResizing = useRef(false);
  const [gotCorrectOutput, setGotCorrectOutput] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/question/${slug}`)
      .then((res) => res.json())
      .then((data) => setProblem(data.data))
      .catch((err) => console.error(err));
  }, [slug]);

  useEffect(() => {
    setCode(languageSnippets[language].code);
  }, [language]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      setEditorHeight((prev) => Math.max(100, e.clientY - 100)); // prevent too small
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  async function runCodeForSamples() {
    if (!problem) return;
    setRunning(true);

    const outputs = []; // Collect all outputs here

    // Run all testcases sequentially
    for (let i = 0; i < problem.examples.length; i++) {
      const input = problem.examples[i].input;
      console.log(input)
      const requestBody = {
        language,
        version: languageSnippets[language].version,
        files: [{ name: "Main", content: code }],
        stdin: input,
        args: [],
      };

      try {
        const res = await fetch("http://localhost:8085/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        let output;
        if (!res.ok) {
          output = `Error: ${res.status}`;
        } else {
          const data = await res.json();
          const runResult = data.run;
          output =
            runResult?.stdout?.trim() ||
            runResult?.output?.trim() ||
            runResult?.stderr?.trim() ||
            "";
        }

        outputs.push(output);
        console.log(output)
      } catch (err) {
        outputs.push("Error running code");
      }
    }

    // Set all outputs at once
    setSampleOutputs(outputs);
    setRunning(false);
    console.log(sampleOutputs)
    // Compare with expected outputs
    const results = await CompareOutputs(
      outputs,
      problem.examples,
      problem.StaticSolution,
      problem.checker
    );
    setGotCorrectOutput(results);
    console.log(results);
  }

  if (!problem) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Panel */}
      <div className="w-2/5 p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-3xl font-bold mb-2">{problem.title}</h2>
        <p className="mt-1">
          <strong>Difficulty:</strong> {problem.difficulty}
        </p>

        <div className="mt-4">
          <h3 className="text-xl font-medium">Problem Statement</h3>
          <p className="mt-1">{problem.description}</p>
        </div>

        {problem.constraints && (
          <div className="mt-4">
            <h3 className="text-xl font-medium">Constraints</h3>
            <ul className="mt-2 space-y-2">
              {problem.constraints.map((c, i) => (
                <li
                  key={i}
                  className="bg-gray-800 p-2 rounded border border-gray-600"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {problem.examples && problem.examples.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Sample Test Cases</h3>
            <div className="space-y-4">
              {problem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 p-3 rounded border border-gray-600"
                >
                  <strong>Input:</strong>
                  <pre className="mt-2 bg-gray-700 p-2 rounded whitespace-pre-wrap">
                    {ex.input}
                  </pre>
                  <strong>Output:</strong>
                  <pre className="mt-2 bg-gray-700 p-2 rounded text-green-400 whitespace-pre-wrap">
                    {ex.output}
                  </pre>
                  {ex.explanation && (
                    <div className="mt-2">
                      <strong>Explanation:</strong> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-3/5 flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={runCodeForSamples}
            >
              {running ? "Running..." : "Run"}
            </button>
            <button
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
              onClick={() => console.log("Submit clicked")}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Code Editor with resizable height */}
        <div
          className="overflow-hidden"
          style={{ height: `${editorHeight}px` }}
        >
          <Editor
            height="100%"
            width="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
          />
        </div>

        {/* Resizer bar */}
        <div
          className="h-1 bg-blue-900 cursor-row-resize hover:bg-blue-400"
          onMouseDown={() => (isResizing.current = true)}
        ></div>

        {/* Tabs for sample testcases */}
        <div className="flex space-x-2 border-b border-gray-600 mb-2">
          {problem.examples.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTest(idx)}
              className={`px-3 py-1 rounded-t ${
                selectedTest === idx
                  ? `bg-${
                      gotCorrectOutput[idx] === 1
                        ? "green"
                        : gotCorrectOutput[idx] === 0
                        ? "red"
                        : "gray"
                    } border-t border-l border-r border-gray-600`
                  : "bg-gray-800"
              }`}
            >
              Test {idx + 1}
            </button>
          ))}
        </div>

        {/* Input / Output Section */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-2 bg-gray-900 rounded">
          {/* Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-1">
              Input
            </label>
            <textarea
              value={problem.examples[selectedTest]?.input || ""}
              readOnly
              className="bg-gray-800 text-white p-2 rounded resize-none h-20 overflow-auto whitespace-pre-wrap"
            />
          </div>

          {/* Expected Output */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-1">
              Expected Output
            </label>
            <pre className="bg-gray-800 text-green-400 p-2 rounded h-max overflow-auto whitespace-pre-wrap">
              {problem.examples[selectedTest]?.output || ""}
            </pre>
          </div>

          {/* Your Output */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-1">
              Your Output
            </label>
            <pre className="bg-gray-800 text-blue-400 p-2 rounded h-max overflow-auto whitespace-pre-wrap">
              {sampleOutputs[selectedTest] !== undefined
                ? sampleOutputs[selectedTest]
                : "Run code to see output"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
