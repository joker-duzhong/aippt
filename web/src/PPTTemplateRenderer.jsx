// PPTTemplateRenderer.jsx
import React from 'react';

const PPTTemplateRenderer = ({ template, page }) => {
  // console.log(template);
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
      transform: `
        rotate(${rotate || 0}deg)
        scaleX(${flipH ? -1 : 1})
        scaleY(${flipV ? -1 : 1})
      `,
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

  // 页面样式
  const pageStyle = {
    position: 'relative',
    width: '960px', // 标准PPT宽度
    height: '540px', // 标准PPT高度
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