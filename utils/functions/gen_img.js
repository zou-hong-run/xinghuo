export const genImg = async (prompt) => {
  // 这里填写自己的后台
  const response = await fetch("http://localhost:3000/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      width: 512,
      height: 512,
    }),
  });
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  const result = await response.json();
  // 显示AI响应
  if (result.payload?.choices?.text?.[0]?.content) {
    const imageData = result.payload.choices.text[0].content;
    if (imageData.startsWith("data:image/")) {
      return imageData;
    } else {
      return "data:image/png;base64," + imageData;
    }
  }
}