const parseContent = (content) => {
  // 首先检查是否是Base64图片数据
  if (isBase64Image(content)) {
    return `<img src="${content}" alt="Generated image" style="max-width:100%;"/>`;
  }

  // 否则当作普通文本处理，解析其中的代码块
  return parseCodeBlocks(content);
};

// 检查是否是Base64图片
const isBase64Image = (str) => {
  // 简单的Base64图片检测
  return str.startsWith('data:image/');
};

const parseCodeBlocks = (content) => {
  // 匹配代码块的正则表达式
  const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
  return content.replace(codeBlockRegex, (match, lang, code) => {
    // 如果指定了语言，则使用该语言，否则默认使用 'javascript'
    const language = lang || "javascript";
    // 高亮代码
    const highlightedCode = highlightCode(code.trim(), language);
    // 返回包裹在 <pre> 和 <code> 标签中的代码块
    return `<pre><span>${language}<span><hr style='margin:10px 0;border-top: 1px solid blue;'/><code class="language-${language}">${highlightedCode}</code></pre>`;
  });
};

// 高亮代码（保持不变）
const highlightCode = (code, language) => {
  if (language === "javascript") {
    // 1. 匹配字符串
    code = code.replace(
      /"([^"]*)"|'([^']*)'/g,
      (match, p1, p2) => `<span class="string">"${p1 || p2}"</span>`
    );

    // 2. 匹配关键字
    code = code.replace(
      /\b(function|let|const|var|if|else|return)\b/g,
      '<span class="keyword">$&</span>'
    );

    // 3. 匹配函数名
    code = code.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
      (match, p1) => `<span class="function">${p1}</span>(`
    );

    // 4. 匹配 console.log
    code = code.replace(
      /\b(console\.log)\b/g,
      '<span class="function">$&</span>'
    );

    // 5. 匹配单行注释
    code = code.replace(
      /\/\/.*$/gm,
      '<span class="comment">$&</span>'
    );

    // 6. 匹配多行注释
    code = code.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="comment">$&</span>'
    );

    // 7. 匹配数字
    code = code.replace(
      /\b(\d+)\b/g,
      '<span class="number">$&</span>'
    );
  }
  return code;
};

// const content = `
// Here is some JavaScript code:

// \`\`\`javascript
// function greet(name) {
//     console.log("Hello, " + name + "!");
// }

// // 调用函数并传递一个名字
// greet("Alice");
// \`\`\`
// `;

// console.log(parseCodeBlocks(content));

/**
 * Here is some JavaScript code:

<pre><code class="language-javascript"><span class="keyword">function</span> <span class="function">greet</span>(name) {
    console.<span class="function">log</span>(<span class="string">"Hello, "</span> + name + <span class="string">"!"</span>);
}

<span class="comment">// 调用函数并传递一个名字</span>
<span class="function">greet</span>(<span class="string">"Alice"</span>);</code></pre>
 */

export { parseContent };
