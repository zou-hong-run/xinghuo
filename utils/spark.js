import CryptoJs from 'crypto-js'

const signatureToHmacSHA256ToBase64 = (origin, secret) => {
  let signatureSha = CryptoJs.HmacSHA256(origin, secret);
  let signature = CryptoJs.enc.Base64.stringify(signatureSha);
  return signature
}
// 鉴权url地址
const getWebsocketUrl = () => {
  const hostUrl = import.meta.env.VITE_APP_SPARK_URL;
  const host = new URL(hostUrl).host;
  const pathname = new URL(hostUrl).pathname;
  const apiKey = import.meta.env.VITE_APP_SPARK_APIKEY;
  const apiSecret = import.meta.env.VITE_APP_SPARK_APISECRET;
  let apiKeyName = "api_key";
  let date = new Date().toGMTString();
  let algorithm = "hmac-sha256"
  let headers = "host date request-line";
  // let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
  let signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${pathname} HTTP/1.1`;
  let signature = signatureToHmacSHA256ToBase64(signatureOrigin, apiSecret)
  let authorizationOrigin = `${apiKeyName}="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  let authorization = btoa(authorizationOrigin)
  // 将空格编码
  let url = `${hostUrl}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`;
  return url
}
/**
 *  获取参数
 * @param {Array} textList [
       { "role": "user", "content": "你是谁" }, //# 用户的历史问题
       { "role": "assistant", "content": "我是AI助手" },  //# AI的历史回答结果
       // ....... 省略的历史对话
       { "role": "user", "content": inputVal },  //# 最新的一条问题，如无需上下文，可只传最新一条问题
   ]
 * @returns 
 */
export const getParams = (textList) => {
  let params = {
    "header": {
      "app_id": import.meta.env.VITE_APP_SPARK_APPID,
      "uid": import.meta.env.VITE_APP_SPARK_UID
    },
    "parameter": {
      "chat": {
        "domain": import.meta.env.VITE_APP_DOMAIN,
        "temperature": 0.5,
        "max_tokens": 4096,
      }
    },
    "payload": {
      "message": {
        // 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
        // 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
        "text": textList
      }
    }
  };
  return params;
}
// 每次聊天都要重新建立连接,使用异步等待
export const getWSConnect = async () => {
  const url = getWebsocketUrl();
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', (event) => {
      console.log('开启连接！！', event);
      resolve(event)
    });
    ws.addEventListener('error', (error) => {
      console.log('连接发送错误！！', event);
      reject(error)
    });
  });
  return ws;
}