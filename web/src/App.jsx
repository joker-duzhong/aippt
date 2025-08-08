// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import PptViewer from './PptViewer';

function App() {
  const [ppts, setPpts] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPpt, setSelectedPpt] = useState(null);

  // 获取所有PPT列表
  const fetchPpts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ppt');
      const data = await response.json();
      setPpts(data);
    } catch (error) {
      console.error('获取PPT列表失败:', error);
    }
  };

  // 创建新PPT
  const createPpt = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/ppt/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: title || '新能源汽车',
          mode: "gpt4_o_mini",
          prompt: `你是一个专业的PPT内容生成专家，需要根据用户提供的主题生成完整的PPT结构。

请严格按照以下JSON格式输出，不要包含任何其他文本或解释：

{
  "title": "PPT主标题",
  "pages": [
    {
      "type": "cover",
      "title": "PPT主标题",
      "subtitle": "副标题（可选）",
      "author": "作者（可选）",
      "date": "日期（可选）"
    },
    {
      "type": "outline",
      "title": "目录",
      "subtitle": "contents",
      "outline": [
        "第一章节标题",
        "第二章节标题",
        "第三章节标题"
      ]
    },
    {
      "type": "content",
      "title": "章节标题",
      "sections": [
        {
          "heading": "要点标题",
          "content": "要点详细内容说明",
          "bulletPoints": ["要点1", "要点2", "要点3"]
        }
      ],
      "layout": "title_and_content", // 可选布局: title_and_content, two_content, comparison, blank
      "design": {
        "style": "business|modern|creative|minimalist", // 风格类型
        "colorScheme": "blue|green|red|monochrome", // 配色方案
        "visuals": ["chart", "image", "icon"] // 建议的视觉元素
      }
    },
    {
      "type": "section_header",
      "title": "新章节标题",
      "subtitle": "章节副标题（可选）"
    },
    {
      "type": "conclusion",
      "title": "总结",
      "content": "总结性内容",
      "keyPoints": ["关键点1", "关键点2", "关键点3"]
    },
    {
      "type": "thank_you",
      "title": "谢谢！",
      "subtitle": "感谢观看（可选）",
      "contact": "联系方式（可选）"
    }
  ]
}

具体要求：
1. 分析用户输入的主题，生成专业且吸引人的PPT内容
2. PPT结构必须包含封面页、内容页、章节过渡页、总结页和感谢页
3. 内容页需要包含详细的章节内容和要点
4. 每页指定适当的版式(layout)和设计风格(design)
5. 确保内容逻辑清晰、层次分明，适合PPT展示
6. 保持专业性和准确性
7. 只输出纯JSON，不要包含任何其他文字、解释或格式化标记

用户输入的主题是：`,
        }),
      });

      if (response.ok) {
        console.log('response.ok', response);
        const newPpt = await response.json();
        console.log('newPpt', newPpt);
        setPpts([newPpt.data, ...ppts]);
        // 清空表单
        setTitle('');
      } else {
        console.error('创建PPT失败:', response.statusText);
      }
    } catch (error) {
      console.error('创建PPT失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取PPT列表
  useEffect(() => {
    fetchPpts();
  }, []);



  return (
    <div className="App">
      <header className="App-header">
        <h1>AI PPT Generator</h1>
      </header>

      <main>
        <section className="create-ppt">
          <h2>创建新的PPT</h2>
          <form onSubmit={createPpt}>
            <div className="form-group">
              <label htmlFor="title">PPT标题:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建PPT'}
            </button>
          </form>
        </section>

        <section className="ppt-list">
          <h2>已创建的PPT</h2>
          {ppts.length === 0 ? (
            <p>暂无PPT</p>
          ) : (
            <div className="ppts">
              {ppts.map((ppt) => (
                <div key={ppt.ppt_id} className="ppt-card">
                  <h3>{ppt.title}</h3>
                  <p>ID: {ppt.ppt_id}</p>
                  <p>页数: {ppt.pages.length}</p>
                  <p>状态: {ppt.status}</p>
                  <button onClick={() => setSelectedPpt(ppt)}>
                    查看
                  </button>
                  <a
                    href={ppt.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    下载
                  </a>
                </div>
              ))}

              {selectedPpt && (
                <div className="ppt-viewer-overlay">
                  <button className="close-btn" onClick={() => setSelectedPpt(null)}>
                    关闭
                  </button>
                  <PptViewer pptData={selectedPpt} />
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;