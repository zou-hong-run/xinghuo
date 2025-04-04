import { getParams, getWSConnect } from "./utils/gpt/spark";
import { parseContent } from "./utils/style/beautiful";
import * as ChatHistory from './utils/storage'
import Functions from "./utils/functions/index";

const questi = document.querySelector("#question");
const sendMsgBtn = document.querySelector("#btn");
const result = document.querySelector("#result");
const results = document.querySelector("#results");
const clearbtn = document.querySelector("#clearBtn");

// 清除历史记录
clearbtn.addEventListener("click", () => {
    const isClear = window.confirm("确定要清除所有聊天记录吗？此操作不可撤销。");
    if (isClear) {
        ChatHistory.clearChatHistory();
        window.location.reload();
    }
});

// 发送消息按钮点击事件
sendMsgBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sendMsg();
});

// 输入框回车事件
questi.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMsg();
    }
});

// 创建加载动画
const createLoadingDots = () => {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading-dots";
    loadingDiv.innerHTML = `
    <div></div>
    <div></div>
    <div></div>
  `;
    return loadingDiv;
};

// 发送消息
const sendMsg = async () => {
    const inputVal = questi.value.trim();
    if (!inputVal) return;

    // 禁用按钮和输入框
    sendMsgBtn.disabled = true;
    questi.disabled = true;
    sendMsgBtn.textContent = "发送中...";

    // 保存用户消息
    ChatHistory.addChatMessage("user", inputVal);
    questi.value = "";

    // 渲染用户消息
    const userMessageDiv = createMessageDiv("user");
    updateMessageContent(userMessageDiv, inputVal);
    result.appendChild(userMessageDiv);
    scrollToBottom();

    // 创建并显示加载动画
    const assistantMessageDiv = createMessageDiv("assistant");
    const loadingDots = createLoadingDots();
    assistantMessageDiv.querySelector(".content").appendChild(loadingDots);
    result.appendChild(assistantMessageDiv);
    scrollToBottom();

    try {
        const params = getParams(ChatHistory.getChatHistory());
        const connect = await getWSConnect();
        let answer = "";

        connect.send(JSON.stringify(params));

        connect.addEventListener("message", async (event) => {
            const data = JSON.parse(event.data);

            if (data.header.code !== 0) {
                console.error("Error:", data.header.message);
                updateMessageContent(assistantMessageDiv, `抱歉，出现错误: ${data.header.message}`);
                connect.close();
                return;
            }

            if (data.payload.choices.text) {
                answer += data.payload.choices.text[0].content;
                // 移除加载动画并更新内容
                loadingDots.remove();
                updateMessageContent(assistantMessageDiv, answer);
                scrollToBottom();
            }

            if (data.header.status === 2) {
                // 处理函数调用
                const function_call = data?.payload?.choices?.text[0]?.function_call;
                if (function_call) {
                    const name = function_call.name;
                    const params = JSON.parse(function_call.arguments);
                    const target = Functions.getFunctionByName(name);

                    if (target) {
                        // 显示正在处理函数的提示
                        updateMessageContent(assistantMessageDiv, `${answer}<br><br><i>正在处理 ${name} 请求...</i>`);
                        scrollToBottom();

                        try {
                            const res = await target.handler(name, params);
                            answer = res;
                        } catch (error) {
                            answer = `处理 ${name} 请求时出错: ${error.message}`;
                        }
                    }
                }

                // 保存最终回答
                ChatHistory.addChatMessage("assistant", answer);
                updateMessageContent(assistantMessageDiv, answer);
                scrollToBottom();

                setTimeout(() => {
                    connect.close();
                }, 1000);
            }
        });

        connect.addEventListener("close", () => {
            sendMsgBtn.disabled = false;
            questi.disabled = false;
            questi.value = "";
            questi.focus();
            sendMsgBtn.textContent = "发送";
        });

        connect.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            updateMessageContent(assistantMessageDiv, "抱歉，连接出现错误，请重试。");
            sendMsgBtn.disabled = false;
            questi.disabled = false;
            sendMsgBtn.textContent = "发送";
        });

    } catch (error) {
        console.error("Error:", error);
        updateMessageContent(assistantMessageDiv, "抱歉，发送消息时出现错误，请重试。");
        sendMsgBtn.disabled = false;
        questi.disabled = false;
        sendMsgBtn.textContent = "发送";
    }
};

/** 创建消息容器 */
const createMessageDiv = (role) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}-message`;

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = role === "user" ? "./redrun.avif" : "./spark.png";
    avatar.alt = `${role} avatar`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    messageDiv.append(avatar, contentDiv);
    return messageDiv;
};

/** 更新消息内容 */
const updateMessageContent = (messageDiv, content) => {
    const contentDiv = messageDiv.querySelector(".content");
    contentDiv.innerHTML = parseContent(content);
};

/** 平滑滚动到底部 */
const scrollToBottom = () => {
    results.scrollTo({
        top: results.scrollHeight,
        behavior: 'smooth'
    });
};

// 初始化页面时显示历史消息
const initChatHistory = () => {
    const history = ChatHistory.getChatHistory();
    if (history.length === 0) {
        // 添加欢迎消息
        const welcomeMessage = createMessageDiv("assistant");
        updateMessageContent(welcomeMessage, "您好！我是讯飞星火认知大模型，有什么可以帮您的吗？");
        result.appendChild(welcomeMessage);
    } else {
        history.forEach((item) => {
            const messageDiv = createMessageDiv(item.role);
            updateMessageContent(messageDiv, item.content);
            result.appendChild(messageDiv);
        });
    }
    scrollToBottom();
};

// 初始化聊天界面
initChatHistory();

// 自动聚焦输入框
questi.focus();