/**
 * 注：当前仅Spark Max/4.0 Ultra
      支持了该功能；需要请求参数payload.functions中申明大模型需要辨别的外部接口
 * 
 */

// 初始化默认的天气查询 function
const weatherFunction = {
  name: "天气查询",// 要触发的函数名
  // 描述越清晰越好，大模型会理解你需要的东西，然后传递参数
  description: "天气插件可以提供天气相关信息。你可以提供指定的地点信息、指定的时间点或者时间段信息，来精准检索到天气信息。",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "地点，比如北京。"
      },
      date: {
        type: "string",
        description: "日期。"
      }
    },
    required: ["location"]
  },
  // 自定义处理逻辑 可以做任何事 和其他软件，硬件通讯，执行爬虫，发送指令，操作其他软件
  handler: async (params) => {
    console.log(params);
    let location = params.location;
    if (location == "北京") { window.open("https://weather.cma.cn/web/weather/54511.html") }
    else if (location == "山东") {
      window.open("https://weather.cma.cn/web/weather/013462.html")
    }
    // return "需要的话可以将返回结果告诉用户"
  }
};
const baiduQuestions = {
  name: "百度搜索",
  description: "百度可以提供需要的的相关信息。你可以提供指定的用户关键词语，来精准检索到目标。",
  parameters: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "关键词，比如red润"
      }
    },
    required: ["username"]
  },
  // 自定义处理逻辑 可以做任何事 和其他软件，硬件通讯，执行爬虫，发送指令，操作其他软件
  handler: async (params) => {
    let username = params.username;
    // 构建百度搜索的 URL
    let url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(username);

    // 使用 window.open 打开链接，_blank 表示在新标签页中打开
    window.open(url, '_blank');
    // return "需要的话可以将返回结果告诉用户"
  }
};

// 获取所有的 function
const getFunctions = () => {
  return [
    weatherFunction,
    baiduQuestions
    // 可以在这里添加其他的function
  ];
};

// 通过名称获取特定的function
const getFunctionByName = (name) => {
  const functions = getFunctions();
  return functions.find(func => func.name === name);
};

// 更新某个function的参数
const updateFunctionParams = (name, newParams) => {
  const func = getFunctionByName(name);
  if (func) {
    func.parameters.properties = { ...func.parameters.properties, ...newParams };
  }
};

// 添加新的function
const addFunction = (newFunction) => {
  const functions = getFunctions();
  functions.push(newFunction);
};

export default {
  getFunctions,
  getFunctionByName,
  updateFunctionParams,
  addFunction
};
