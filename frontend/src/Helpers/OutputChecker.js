export default async function CompareOutputs(outputs, examples, staticSolution, checker) {
  const results = [];

  for (let i = 0; i < examples.length; i++) {
    const expected = examples[i].output;
    const actual = outputs[i];


    if (staticSolution) {
      // ✅ static solution → just normalize strings
      const cleanExpected = expected.trim().replace(/\r\n/g, "\n");
      const cleanActual = actual.trim().replace(/\r\n/g, "\n");

      results.push(cleanExpected === cleanActual ? 1 : 0);
    } else {
      // ✅ dynamic solution → run checker code
      try {
        const requestBody = {
          language: "cpp",
          version: "10.2.0",   // don’t use cpp-latest
          files: [
            { name: "Main.cpp", content: checker.code }, // or checker string
          ],
          stdin: `${examples[i].input}\n${actual}`,
        };
        console.log(`${examples[i].input}${actual}`)
        const res = await fetch("http://localhost:8083/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        const verdict = (data.run.stdout || "").trim();
        results.push(verdict === "1" ? 1 : 0);
      } catch {
        results.push(0);
      }
    }
  }

  return results;
}
