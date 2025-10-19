const languageSnippets = {
  javascript: {
    code: `console.log("Hello World");`,
    language: "nodejs", // JDoodle Node.js identifier
    versionIndex: null, // not needed
  },
  python: {
    code: `print("Hello World")`,
    language: "python3",
    versionIndex: "3",
  },
  java: {
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`,
    language: "java",
    versionIndex: "3",
  },
  cpp: {
    code: `#include <bits/stdc++.h>\nusing namespace std; \nint main() {\n  std::cout << "Hello World";\n  return 0;\n}`,
    language: "cpp14",
    versionIndex: "0",
  },
};
export default languageSnippets;
