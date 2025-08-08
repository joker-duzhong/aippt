// TemplateBasedPptRenderer.jsx
import React, { useState, useEffect } from 'react';
import './PptRenderer.css';

const TemplateBasedPptRenderer = ({ pptData }) => {
  const [templates, setTemplates] = useState({});

  // 加载所有模板文件
  useEffect(() => {
    const loadTemplates = async () => {
      const templateFiles = [];
      for (let i = 1; i <= 17; i++) {
        try {
          const template = await import(`./templates/${i}.json`);
          templateFiles.push(template.default);
        } catch (error) {
          console.warn(`Failed to load template ${i}.json:`, error);
        }
      }

      // 将模板按类型分组
      const templateMap = {};
      templateFiles.forEach(template => {
        if (template.type) {
          templateMap[template.type] = template;
        }
      });
      console.log(templateFiles);
      setTemplates(templateFiles);
    };

    loadTemplates();
  }, []);

  // 根据页面类型选择模板
  const getTemplateByPageType = (pageType) => {
    // 这里可以根据实际模板文件的结构进行映射
    switch (pageType) {
      case 'cover':
        return templates['1'] || Object.values(templates)[0];
      case 'outline':
        return templates[17] || Object.values(templates)[1];
      case 'content':
        return templates['1'] || Object.values(templates)[2];
      case 'section_header':
        return templates['3'] || Object.values(templates)[3];
      case 'conclusion':
        return templates['5'] || Object.values(templates)[4];
      case 'thank_you':
        return templates['6'] || Object.values(templates)[5];
      default:
        return Object.values(templates)[0];
    }
  };

  // 将内容填充到模板中
  const fillTemplateWithContent = (template, page) => {
    if (!template) return null;

    // 深拷贝模板以避免修改原始数据
    const filledTemplate = JSON.parse(JSON.stringify(template));

    // 根据页面类型填充内容
    switch (page.type) {
      case 'cover':
        return fillCoverTemplate(filledTemplate, page);
      case 'outline':
        return fillOutlineTemplate(filledTemplate, page);
      case 'content':
        return fillContentTemplate(filledTemplate, page);
      case 'section_header':
        return fillSectionHeaderTemplate(filledTemplate, page);
      case 'conclusion':
        return fillConclusionTemplate(filledTemplate, page);
      case 'thank_you':
        return fillThankYouTemplate(filledTemplate, page);
      default:
        return filledTemplate;
    }
  };

  // 填充封面模板
  const fillCoverTemplate = (template, page) => {
    const textElements = template.elements?.filter(el => el.type === 'text') || [];

    // 假设第一个文本元素是主标题
    if (textElements[0] && page.title) {
      if (!textElements[0].contents) {
        textElements[0].contents = [{}];
      }
      textElements[0].contents[0].content = page.title;
    }

    // 假设第二个文本元素是副标题
    if (textElements[1] && page.subtitle) {
      if (!textElements[1].contents) {
        textElements[1].contents = [{}];
      }
      textElements[1].contents[0].content = page.subtitle;
    }

    // 假设第三个文本元素是作者
    if (textElements[2] && page.author) {
      if (!textElements[2].contents) {
        textElements[2].contents = [{}];
      }
      textElements[2].contents[0].content = page.author;
    }

    // 假设第四个文本元素是日期
    if (textElements[3] && page.date) {
      if (!textElements[3].contents) {
        textElements[3].contents = [{}];
      }
      textElements[3].contents[0].content = page.date;
    }

    return template;
  };

  // 填充目录模板
  const fillOutlineTemplate = (template, page) => {
    const textElements = template.elements?.filter(el => el.type === 'text') || [];

    // 假设第一个文本元素是标题
    if (textElements[0] && page.title) {
      if (!textElements[0].contents) {
        textElements[0].contents = [{}];
      }
      textElements[0].contents[0].content = page.title;
    }

    // 假设第二个文本元素是副标题
    if (textElements[1] && page.subtitle) {
      if (!textElements[1].contents) {
        textElements[1].contents = [{}];
      }
      textElements[1].contents[0].content = page.subtitle;
    }

    // 填充目录项
    page.outline?.forEach((item, index) => {
      if (textElements[index + 2]) {
        if (!textElements[index + 2].contents) {
          textElements[index + 2].contents = [{}];
        }
        textElements[index + 2].contents[0].content = item;
      }
    });

    return template;
  };

  // 填充内容页模板
  const fillContentTemplate = (template, page) => {
    const textElements = template.elements?.filter(el => el.type === 'text') || [];

    // 填充页面标题
    if (textElements[0] && page.title) {
      if (!textElements[0].contents) {
        textElements[0].contents = [{}];
      }
      textElements[0].contents[0].content = page.title;
    }

    // 填充内容部分
    let textElementIndex = 1;
    page.sections?.forEach((section, sectionIndex) => {
      // 填充章节标题
      if (textElements[textElementIndex] && section.heading) {
        if (!textElements[textElementIndex].contents) {
          textElements[textElementIndex].contents = [{}];
        }
        textElements[textElementIndex].contents[0].content = section.heading;
        textElementIndex++;
      }

      // 填充章节内容
      if (textElements[textElementIndex] && section.content) {
        if (!textElements[textElementIndex].contents) {
          textElements[textElementIndex].contents = [{}];
        }
        textElements[textElementIndex].contents[0].content = section.content;
        textElementIndex++;
      }

      // 填充要点列表
      if (textElements[textElementIndex] && section.bulletPoints) {
        if (!textElements[textElementIndex].contents) {
          textElements[textElementIndex].contents = [];
        }
        textElements[textElementIndex].contents = section.bulletPoints.map((point, pointIndex) => ({
          content: point,
          ...(textElements[textElementIndex].contents[0] || {})
        }));
        textElementIndex++;
      }
    });

    return template;
  };

  // 填充章节标题页模板
  const fillSectionHeaderTemplate = (template, page) => {
    const textElements = template.elements?.filter(el => el.type === 'text') || [];

    // 填充主标题
    if (textElements[0] && page.title) {
      if (!textElements[0].contents) {
        textElements[0].contents = [{}];
      }
      textElements[0].contents[0].content = page.title;
    }

    // 填充副标题
    if (textElements[1] && page.subtitle) {
      if (!textElements[1].contents) {
        textElements[1].contents = [{}];
      }
      textElements[1].contents[0].content = page.subtitle;
    }

    return template;
  };

  // 填充总结页模板
  const fillConclusionTemplate = (template, page) => {
    const textElements = template.elements?.filter(el => el.type === 'text') || [];

    // 填充标题
    if (textElements[0] && page.title) {
      if (!textElements[0].contents) {
        textElements[0].contents = [{}];
      }
      textElements[0].contents[0].content = page.title;
    }

    // 填充内容
    if (textElements[1] && page.content) {
      if (!textElements[1].contents) {
        textElements[1].contents = [{}];
      }
      textElements[1].contents[0].content = page.content;
    }

    // 填充关键点
    page.keyPoints?.forEach((point, index) => {
      if (textElements[index + 2]) {
        if (!textElements[index + 2].contents) {
          textElements[index + 2].contents = [{}];
        }
        textElements[index + 2].contents[0].content = point;
      }
    });

    return template;
  };

  // 填充感谢页模板
  const fillThankYouTemplate = (template, page) => {
    const textElements = template.elements?.filter(el => el.type === 'text') || [];

    // 填充标题
    if (textElements[0] && page.title) {
      if (!textElements[0].contents) {
        textElements[0].contents = [{}];
      }
      textElements[0].contents[0].content = page.title;
    }

    // 填充副标题
    if (textElements[1] && page.subtitle) {
      if (!textElements[1].contents) {
        textElements[1].contents = [{}];
      }
      textElements[1].contents[0].content = page.subtitle;
    }

    // 填充联系方式
    if (textElements[2] && page.contact) {
      if (!textElements[2].contents) {
        textElements[2].contents = [{}];
      }
      textElements[2].contents[0].content = page.contact;
    }

    return template;
  };

  // 解析颜色值
  const parseColor = (colorData) => {
    if (!colorData) return 'transparent';

    if (colorData.type === 1 && colorData.color?.rgba) {
      const [r, g, b, a] = colorData.color.rgba;
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }

    if (colorData.type === 0) {
      return 'transparent';
    }

    return colorData.color || 'transparent';
  };

  // 解析线性渐变
  const parseLinearGradient = (gradientData) => {
    if (!gradientData || gradientData.type !== 2) return 'transparent';

    const angle = gradientData.angle || 0;
    const colors = gradientData.gsList?.map((gs, index) => {
      const color = parseColor({ type: 1, color: gs.color });
      const position = gs.pos * 100;
      return `${color} ${position}%`;
    }).join(', ');

    return `linear-gradient(${angle}deg, ${colors})`;
  };

  // 解析背景
  const parseBackground = (bgData) => {
    if (!bgData) return 'transparent';

    switch (bgData.type) {
      case 1: // 纯色
        return parseColor(bgData.data);
      case 2: // 渐变
        return parseLinearGradient(bgData.data);
      default:
        return 'transparent';
    }
  };

  // 渲染文本元素
  const renderTextElement = (element) => {
    const { left, top, width, height, rotate, flipH, flipV } = element;
    const shape = element.shape;

    // 文本框样式
    const textContainerStyle = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `rotate(${rotate || 0}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
      transformOrigin: 'center center',
      display: 'flex',
      alignItems: element.verticalType === 'center' ? 'center' :
        element.verticalType === 'top' ? 'flex-start' : 'flex-end',
      justifyContent: element.textAlign === 'center' ? 'center' :
        element.textAlign === 'left' ? 'flex-start' : 'flex-end',
      padding: element.pad ? `${element.pad[1]}px ${element.pad[0]}px` : '0px',
      boxSizing: 'border-box',
    };

    // 背景样式
    if (shape?.fill) {
      if (shape.fill.type === 1) {
        textContainerStyle.background = parseColor(shape.fill);
      } else if (shape.fill.type === 2) {
        textContainerStyle.background = parseLinearGradient(shape.fill);
      }
    }

    // 边框样式
    if (shape?.line?.stroke) {
      textContainerStyle.border = `${shape.line.strokeWidth || 1}px solid ${parseColor(shape.line.stroke)}`;
    }

    // 文本内容样式
    const textStyle = {
      lineHeight: element.lineHeight,
      textAlign: element.textAlign,
      letterSpacing: `${element.letterSpacing}px`,
      margin: 0,
      width: '100%',
    };

    // 处理文本内容
    const renderTextContent = () => {
      if (!element.contents || element.contents.length === 0) {
        return <div style={textStyle}>&nbsp;</div>;
      }

      return element.contents.map((content, index) => {
        const contentStyle = {
          ...textStyle,
          fontFamily: content.fontFamily || 'Arial',
          fontSize: `${content.fontSize || 16}px`,
          fontWeight: content.fontWeight || 400,
          color: content.color || parseColor(content.fontFill) || '#000000',
        };

        return (
          <div key={index} style={contentStyle}>
            {content.content || '\u200B'}
          </div>
        );
      });
    };

    return (
      <div style={textContainerStyle}>
        {renderTextContent()}
      </div>
    );
  };

  // 渲染图片元素
  const renderImageElement = (element) => {
    const { left, top, width, height, src, flipH, flipV, rotate } = element;

    const imageStyle = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `rotate(${rotate || 0}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
      transformOrigin: 'center center',
    };

    return (
      <img
        src={src}
        alt=""
        style={imageStyle}
        draggable={false}
      />
    );
  };

  // 渲染单个元素
  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
        return renderTextElement(element);
      case 'image':
        return renderImageElement(element);
      default:
        return null;
    }
  };

  // 渲染单页PPT
  const renderPptPage = (page, index) => {
    // 选择合适的模板
    const template = getTemplateByPageType(page.type);

    if (!template) {
      return <div key={index} className="page-placeholder">无法加载模板</div>;
    }

    // 填充内容到模板
    const filledTemplate = fillTemplateWithContent(template, page);

    if (!filledTemplate) {
      return <div key={index} className="page-placeholder">无法填充内容</div>;
    }

    // 页面样式
    const pageStyle = {
      position: 'relative',
      width: '960px',
      height: '540px',
      background: parseBackground(filledTemplate.background),
      overflow: 'hidden',
      margin: '20px auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    };

    return (
      <div key={index} style={pageStyle} className="ppt-page">
        {filledTemplate.elements?.map((element, elIndex) => (
          <div key={element.uuid || element.id || elIndex}>
            {renderElement(element)}
          </div>
        ))}
      </div>
    );
  };

  if (!pptData || !pptData.pages) {
    return <div>无PPT数据</div>;
  }

  return (
    <div className="template-based-ppt-renderer">
      <h2 className="ppt-title">{pptData.title}</h2>
      <div className="ppt-pages">
        {pptData.pages.map((page, index) => renderPptPage(page, index))}
      </div>
    </div>
  );
};

export default TemplateBasedPptRenderer;