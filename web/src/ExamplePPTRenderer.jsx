// ExamplePPTRenderer.jsx
import React from 'react';
import PPTTemplateRenderer from './PPTTemplateRenderer';
import exampleData from './example/AI算力示例数据.json';

// 导入模板文件
import template1 from './templates/1.json';
import template2 from './templates/2.json';
import template3 from './templates/3.json';
import template4 from './templates/4.json';
import template5 from './templates/5.json';
import template6 from './templates/6.json';

const ExamplePPTRenderer = () => {
  // 定义模板映射
  const templates = {
    cover: template1,
    outline: template2,
    content: template3,
    section_header: template4,
    conclusion: template5,
    thank_you: template6
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', padding: '20px' }}>AI算力示例PPT</h1>
      <div>
        {exampleData.pages.map((page, index) => {
          // 根据页面类型选择模板
          const template = templates[page.type] || template1;
          
          return (
            <div key={index} style={{ marginBottom: '40px' }}>
              <PPTTemplateRenderer 
                template={template} 
                page={page} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamplePPTRenderer;