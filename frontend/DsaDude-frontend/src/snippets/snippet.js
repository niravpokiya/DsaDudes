const languageSnippets = {
  javascript: {
    code: `console.log("Hello World");`,
    version: "20.11.1", // Piston-supported version
  },
  python: {
    code: `print("Hello World")`,
    version: "3.10.0",
  },
  java: {
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`,
    version: "15.0.2",
  },
  cpp: {
    code: `#include <bits/stdc++.h>\nusing namespace std; \nint main() {\n  std::cout << "Hello World";\n  return 0;\n}`,
    version: "10.2.0",
  },
};
export default languageSnippets;
