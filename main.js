
import { getParams, getWSConnect } from "./utils/spark";
import { parseCodeBlocks } from "./utils/common";
import * as ChatHistory from './utils/storage'
import Functions from "./utils/functions";
let questi = document.querySelector("#question");
let sendMsgBtn = document.querySelector("#btn");
let result = document.querySelector("#result");
let results = document.querySelector("#results");
let clearbtn = document.querySelector("#clearBtn")
clearbtn.addEventListener("click", () => {
    let isClear = window.confirm("确定要清除吗？")
    if (isClear) {
        ChatHistory.clearChatHistory()
        window.location.reload()
    }
})
// let chatHistoryList = getChatHistory();

// 点击发送信息按钮
sendMsgBtn.addEventListener("click", (e) => {
    sendMsg();
});

// 输入完信息点击enter发送信息
questi.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMsg();
    }
});

// 发送消息
const sendMsg = async () => {
    sendMsgBtn.style.display = "none";
    let answer = ""; // 回答

    // 获取输入框中的内容
    let inputVal = questi.value;
    ChatHistory.addChatMessage("user", inputVal)
    // chatHistoryList.push({ role: "user", content: inputVal });
    questi.value = "";

    // 渲染用户的输入内容
    let userMessageDiv = createMessageDiv("user");
    updateMessageContent(userMessageDiv, inputVal);
    result.appendChild(userMessageDiv);

    // 确保用户消息渲染后滚动到底部
    scrollToBottom();

    const params = getParams(ChatHistory.getChatHistory());

    // 每次发送问题 都是一个新的websocket请求
    const connect = await getWSConnect();
    console.log("发送消息");
    connect.send(JSON.stringify(params));

    // 创建一个新的消息容器用于实时显示回答
    let assistantMessageDiv = createMessageDiv("assistant");
    result.appendChild(assistantMessageDiv);

    connect.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);
        if (data.header.code !== 0) {
            console.log("出错了", data.header.code, ":", data.header.message);
            // 出错了"手动关闭连接"
            connect.close();
        }
        if (data.header.code === 0) {
            // 实时更新回答内容
            if (data.payload.choices.text) {
                answer += data.payload.choices.text[0].content;
            }
            updateMessageContent(assistantMessageDiv, answer);
            // 每次更新内容后滚动到底部
            scrollToBottom();
            // 对话已经完成
            if (data.header.status === 2) {
                let function_call = data?.payload?.choices?.text[0]?.function_call;
                if (function_call) {
                    let name = function_call.name;
                    let params = JSON.parse(function_call.arguments);
                    // console.log(name,params);
                    let target = Functions.getFunctionByName(name);
                    if (target) {
                        // 返回一个promise，可以自定义answer返回答案
                        target.handler(params)
                    }
                    // 默认回答
                    answer = `已为您处理任务：${name}，参数：${JSON.stringify(params)}`
                }
                ChatHistory.addChatMessage("assistant", answer)
                // chatHistoryList.push({
                //     role: "assistant",
                //     content: answer,
                // });
                // 更新页面内容
                updateMessageContent(assistantMessageDiv, answer);
                // 每次更新内容后滚动到底部
                scrollToBottom();
                answer = "";
                setTimeout(() => {
                    // "对话完成，手动关闭连接"
                    connect.close();
                }, 1000);
                sendMsgBtn.style.display = "block";
                questi.value = "继续聊天";
            }
        }
    });

    connect.addEventListener("close", (event) => {
        console.log("聊天完成关闭", event);
        // 清空输入框
        questi.value = "";
    });
};

/** 创建消息容器 */
const createMessageDiv = (role) => {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message"); // 添加通用的 message 类名以应用样式

    // 根据角色决定样式，用户和助手的消息可以有不同的显示风格
    if (role === "user") {
        messageDiv.classList.add("user-message");
        let userAvatar = document.createElement("img"); // 创建用户头像元素
        userAvatar.src = "./redrun.avif"; // 设置用户头像图片路径
        userAvatar.alt = "User Avatar"; // 设置替代文本
        userAvatar.classList.add("avatar"); // 添加头像样式类名
        messageDiv.prepend(userAvatar); // 将头像添加到消息前面
    } else if (role === "assistant") {
        messageDiv.classList.add("assistant-message");
        let assistantAvatar = document.createElement("img"); // 创建助手头像元素
        assistantAvatar.src = "./spark.png"; // 设置助手头像图片路径
        assistantAvatar.alt = "Assistant Avatar"; // 设置替代文本
        assistantAvatar.classList.add("avatar"); // 添加头像样式类名
        messageDiv.prepend(assistantAvatar); // 将头像添加到消息前面
    }

    // 创建内容容器
    let contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    messageDiv.appendChild(contentDiv);

    return messageDiv;
};

/** 更新消息内容 */
const updateMessageContent = (messageDiv, content) => {
    let contentDiv = messageDiv.querySelector(".content");
    contentDiv.innerHTML = parseCodeBlocks(content);
};

/** 滚动到底部 */
const scrollToBottom = () => {
    results.scrollTop = results.scrollHeight;
};

// 初始化页面时显示历史消息
ChatHistory.getChatHistory().forEach((item) => {
    let messageDiv = createMessageDiv(item.role);
    updateMessageContent(messageDiv, item.content);
    result.appendChild(messageDiv);
});

// 初始化时滚动到底部
scrollToBottom();
