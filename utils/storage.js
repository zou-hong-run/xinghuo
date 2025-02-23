// chatHistoryModule.js

// 从 localStorage 获取聊天记录，若没有记录则初始化为空数组
const getChatHistory = () => {
  const chatHistory = localStorage.getItem('chatHistory');
  return chatHistory ? JSON.parse(chatHistory) : [
    // {
    //   role: "user",
    //   content: "给我一个js代码片段",
    // },
    // {
    //   role: "assistant",
    //   content:
    //     '当然！以下是一个简单的 JavaScript 代码片段，它定义了一个函数 `greet`，该函数接受一个名字作为参数并打印一条问候消息：\n\n```javascript\nfunction greet(name) {\n    console.log("Hello, " + name + "!");\n}\n\n// 调用函数并传递一个名字\ngreet("Alice");\n```\n\n这个代码片段定义了一个名为 `greet` 的函数，并在控制台中输出一条包含传入名字的问候消息。你可以将这段代码复制到你的 JavaScript 环境中运行，例如在浏览器的控制台或 Node.js 环境中。',
    // },
  ];
};

// 将聊天记录保存到 localStorage
const saveChatHistory = (chatHistory) => {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
};

// 添加聊天记录
const addChatMessage = (role, content) => {
  let chatHistory = getChatHistory();  // 获取当前聊天历史
  chatHistory.push({ role, content });
  saveChatHistory(chatHistory);  // 更新 localStorage
};

// 更新聊天记录
const updateChatMessage = (index, content) => {
  let chatHistory = getChatHistory();
  if (chatHistory[index]) {
    chatHistory[index].content = content;
    saveChatHistory(chatHistory);
  } else {
    console.log("聊天记录不存在");
  }
};

// 清除聊天历史
const clearChatHistory = () => {
  localStorage.removeItem('chatHistory');
};

export { getChatHistory, addChatMessage, updateChatMessage, clearChatHistory };
