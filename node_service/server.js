// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 8000;

// 中间件
app.use(express.json());
app.use(cors());

// 模拟数据存储
let pptStorage = {};

// 数据模型验证中间件
const validatePPTRequest = (req, res, next) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ detail: "缺少必要字段: title" });
  }
  next();
};

const validateContentRequest = (req, res, next) => {
  next(); // 简单验证，所有字段都是可选的
};

// 数据模型
class PPTRequest {
  constructor(data) {
    this.title = data.title;
    this.template = data.template || "default";
    this.style = data.style || "business";
  }
}

class ContentRequest {
  constructor(data) {
    this.content = data.content || "";
    this.mode = data.mode || "glm-4.5";
    this.prompt = data.prompt || "";
    this.key = data.key || "horltqg8iupk0n1ypfn75soyn4rbaiod";
  }
}

// 解析markdown响应的函数
function parseMarkdownResponse(markdownText) {
  const lines = markdownText.trim().split("\n");

  // 提取标题
  let title = "默认标题";
  for (const line of lines) {
    if (line.startsWith("### PPT大纲：")) {
      title = line.replace("### PPT大纲：", "").trim();
      break;
    }
  }

  // 提取幻灯片内容
  let slides = [];
  let currentSlide = null;
  let contentList = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("#### 幻灯片")) {
      // 保存上一张幻灯片
      if (currentSlide) {
        slides.push(currentSlide);
      }

      // 提取幻灯片标题
      if (trimmedLine.includes(": ")) {
        try {
          const slideTitle = trimmedLine.split(": ", 1)[1].trim();
          currentSlide = {
            title: slideTitle,
            content: [],
          };
        } catch (e) {
          currentSlide = {
            title: "未命名幻灯片",
            content: [],
          };
        }
      } else {
        currentSlide = {
          title: "未命名幻灯片",
          content: [],
        };
      }
    } else if (trimmedLine.startsWith("- 内容要点：") && currentSlide !== null) {
      // 跳过内容要点这一行本身
      continue;
    } else if (trimmedLine.startsWith("  - ") && currentSlide !== null) {
      // 处理内容要点项
      const content = trimmedLine.substring(4).trim();
      if (!content.startsWith("说明文字：")) {
        currentSlide.content.push(content);
      }
    } else if (trimmedLine.startsWith("- ") && currentSlide !== null) {
      const content = trimmedLine.substring(2).trim();
      if (!content.startsWith("标题：") && !content.startsWith("副标题：") && !content.startsWith("图片：") && !content.startsWith("内容要点：") && !content.startsWith("说明文字：")) {
        currentSlide.content.push(content);
      }
    }
  }

  // 添加最后一个幻灯片
  if (currentSlide) {
    slides.push(currentSlide);
  }

  // 构造content列表
  for (const slide of slides) {
    const slideContent = `${slide.title}\n` + slide.content.map((c) => `  ${c}`).join("\n");
    contentList.push(slideContent);
  }

  // 构造outline列表
  const outline = slides.map((slide) => slide.title);

  return {
    title: title,
    outline: outline,
    content: contentList,
  };
}
app.post("/api/v1/ppt/generate-content", validateContentRequest, async (req, res) => {
  try {
    const request = new ContentRequest(req.body);
    // 准备请求数据
    const payload = {
      message: [
        { role: "system", content: request.prompt },
        { role: "user", content: request.content },
      ],
      mode: request.mode,
      key: request.key,
    };
    // 调用外部API并处理流式响应
    const response = await axios.post("https://aliyun.zaiwen.top/admin/chatbot", payload, {
      headers: { "Content-Type": "application/json" },
      responseType: "stream",
    });

    if (response.status !== 200) {
      return res.status(response.status).json({
        detail: `外部API调用失败 - 状态码: ${response.status}`,
      });
    }
    // 收集流式数据
    let responseData = "";
    response.data.on("data", (chunk) => {
      responseData += chunk.toString();
    });

    response.data.on("end", async () => {
      console.log("响应数据:", responseData);

      try {
        // 解析响应数据
        const parsedData = JSON.parse(responseData);

        // 生成唯一的PPT ID
        const pptId = uuidv4().substring(0, 8);

        // 提取PPT信息
        const { title, outline, pages } = parsedData || parsedData;

        // 保存PPT信息到存储中
        pptStorage[pptId] = {
          status: "completed",
          template: request.template || "default",
          style: request.style || "business",
          ...parsedData,
        };

        // 返回响应
        return res.json(pptStorage[pptId]);
      } catch (parseError) {
        console.error("解析响应数据失败:", parseError);
        return res.status(500).json({
          detail: "解析响应数据失败",
          raw_data: responseData,
        });
      }
    });

    response.data.on("error", (err) => {
      console.error("流式响应错误:", err);
      return res.status(500).json({ detail: "流式响应处理失败" });
    });
  } catch (error) {
    // 错误处理代码保持不变
    if (error.code === "ECONNABORTED") {
      return res.status(500).json({ detail: "外部API调用超时" });
    } else if (error.response) {
      return res.status(error.response.status).json({
        detail: `外部API调用失败: ${error.message}`,
      });
    } else {
      return res.status(500).json({
        detail: `内容生成失败: ${error.message}`,
      });
    }
  }
});

// 修改获取PPT状态接口
app.get("/api/v1/ppt/:pptId", (req, res) => {
  const { pptId } = req.params;

  if (!pptStorage[pptId]) {
    return res.status(404).json({ detail: "PPT不存在" });
  }

  const pptInfo = pptStorage[pptId];
  res.json({
    ppt_id: pptId,
    title: pptInfo.title,
    outline: pptInfo.outline || [],
    pages: pptInfo.pages,
    content: pptInfo.content || [],
    download_url: `http://localhost:${PORT}/api/v1/ppt/download/${pptId}`,
    status: pptInfo.status,
  });
});

// 修改获取所有PPT接口
app.get("/api/v1/ppt", (req, res) => {
  const pptList = Object.keys(pptStorage).map((pptId) => {
    const info = pptStorage[pptId];
    return {
      ppt_id: pptId,
      title: info.title,
      outline: info.outline || [],
      pages: info.pages,
      download_url: `http://localhost:${PORT}/api/v1/ppt/download/${pptId}`,
      status: info.status,
    };
  });

  res.json(pptList);
});

// 健康检查接口
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "AI PPT API" });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`AI PPT API server is running on port ${PORT}`);
  console.log(`http://localhost:${8000}/`);
});
