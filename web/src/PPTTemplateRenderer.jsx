// 修改后的 PPTTemplateRenderer.jsx
import React from 'react';

const PPTTemplateRenderer = ({ template, page }) => {
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

  // 解析径向渐变
  const parseRadialGradient = (gradientData) => {
    if (!gradientData || gradientData.type !== 2) return 'transparent';

    const colors = gradientData.gsList?.map((gs, index) => {
      const color = parseColor({ type: 1, color: gs.color });
      const position = gs.pos * 100;
      return `${color} ${position}%`;
    }).join(', ');

    return `radial-gradient(${colors})`;
  };

  // 解析背景
  const parseBackground = (bgData) => {
    if (!bgData) return 'transparent';

    switch (bgData.type) {
      case 1: // 纯色
        return parseColor(bgData.data);
      case 2: // 渐变
        if (bgData.data?.mode === 'br') {
          return parseRadialGradient(bgData.data);
        }
        return parseLinearGradient(bgData.data);
      default:
        return 'transparent';
    }
  };

  // 查找并替换文本内容
  const fillTextContent = (element, page) => {
    // 创建元素的深拷贝以避免修改原始模板
    const newElement = JSON.parse(JSON.stringify(element));
    
    if (newElement.type === 'text' && newElement.contents) {
      // 根据元素ID或其他标识符映射内容
      switch (newElement.id) {
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
          // 这里需要根据具体模板和页面类型来填充内容
          // 为了简化，我们使用一种通用的方法来映射内容
          fillContentByPageType(newElement, page);
          break;
        default:
          break;
      }
    }
    
    return newElement;
  };
  
  // 根据页面类型填充内容
  const fillContentByPageType = (element, page) => {
    switch (page.type) {
      case 'cover':
        if (element.id === 5 || element.id === 6) {
          // 标题元素
          if (element.contents && element.contents.length > 0) {
            element.contents[0].content = page.title || '';
          }
        } else if (element.id === 7 || element.id === 8) {
          // 副标题/作者/日期元素
          if (element.contents && element.contents.length > 0) {
            element.contents[0].content = page.subtitle || '';
          }
        }
        break;
        
      case 'outline':
        if (element.id === 5 || element.id === 6) {
          // 目录标题
          if (element.contents && element.contents.length > 0) {
            element.contents[0].content = page.title || '';
          }
        } else if (element.id === 7 || element.id === 8) {
          // 目录副标题
          if (element.contents && element.contents.length > 0) {
            element.contents[0].content = page.subtitle || '';
          }
        }
        break;
        
      case 'content':
        // 内容页面处理
        if (element.contents && element.contents.length > 0) {
          // 根据元素ID和位置填充不同内容
          fillContentPageText(element, page);
        }
        break;
        
      case 'section_header':
        if (element.contents && element.contents.length > 0) {
          if (element.id === 5 || element.id === 6) {
            element.contents[0].content = page.title || '';
          } else if (element.id === 7 || element.id === 8) {
            element.contents[0].content = page.subtitle || '';
          }
        }
        break;
        
      case 'conclusion':
        if (element.contents && element.contents.length > 0) {
          fillConclusionPageText(element, page);
        }
        break;
        
      case 'thank_you':
        if (element.contents && element.contents.length > 0) {
          if (element.id === 5 || element.id === 6) {
            element.contents[0].content = page.title || '';
          } else if (element.id === 7 || element.id === 8) {
            element.contents[0].content = page.subtitle || '';
          }
        }
        break;
        
      default:
        break;
    }
  };
  
  // 填充内容页面文本
  const fillContentPageText = (element, page) => {
    // 简化处理，实际应用中需要更复杂的映射逻辑
    if (page.sections && page.sections.length > 0) {
      const firstSection = page.sections[0];
      if (element.id === 5 || element.id === 6) {
        // 章节标题
        element.contents[0].content = page.title || '';
      } else if (element.id === 7 || element.id === 8) {
        // 第一个部分内容
        element.contents[0].content = firstSection.heading || '';
      } else if (element.id === 9 || element.id === 10) {
        // 第一个部分的详细内容
        element.contents[0].content = firstSection.content || '';
      }
    }
  };
  
  // 填充结论页面文本
  const fillConclusionPageText = (element, page) => {
    if (element.id === 5 || element.id === 6) {
      element.contents[0].content = page.title || '';
    } else if (element.id === 7 || element.id === 8) {
      element.contents[0].content = page.content || '';
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
      transform: `
        rotate(${rotate || 0}deg)
        scaleX(${flipH ? -1 : 1})
        scaleY(${flipV ? -1 : 1})
      `,
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
        if (shape.fill.mode === 'br') {
          textContainerStyle.background = parseRadialGradient(shape.fill);
        } else {
          textContainerStyle.background = parseLinearGradient(shape.fill);
        }
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
    };

    // 处理文本内容
    const renderTextContent = () => {
      if (!element.contents || element.contents.length === 0) {
        return <div style={textStyle}>&nbsp;</div>;
      }

      return element.contents.map((content, index) => {
        const contentStyle = {
          ...textStyle,
          fontFamily: content.fontFamily,
          fontSize: `${content.fontSize}px`,
          fontWeight: content.fontWeight,
          color: parseColor(content.fontFill),
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
    // 填充文本内容
    const filledElement = fillTextContent(element, page);
    
    switch (filledElement.type) {
      case 'text':
        return renderTextElement(filledElement);
      case 'image':
        return renderImageElement(filledElement);
      default:
        return null;
    }
  };

  // 页面样式
  const pageStyle = {
    position: 'relative',
    width: '960px',
    height: '540px',
    background: parseBackground(template.background),
    overflow: 'hidden',
    margin: '20px auto',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };

  return (
    <div style={pageStyle}>
      {template.elements?.map((element, index) => (
        <div key={element.uuid || element.id || index}>
          {renderElement(element)}
        </div>
      ))}
    </div>
  );
};

export default PPTTemplateRenderer;