// SvgTemplateRenderer.jsx
import React from 'react';

const SvgTemplateRenderer = ({ template, page }) => {
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

  // 渲染文本元素为 SVG
  const renderTextElementAsSVG = (element) => {
    const { left, top, width, height, id } = element;
    const shape = element.shape;

    // 创建文本内容
    let textContent = '';
    if (element.contents && element.contents.length > 0) {
      textContent = element.contents.map(content => content.content || '').join(' ');
    }

    // 根据页面类型和元素ID填充内容
    if (page) {
      switch (page.type) {
        case 'cover':
          if (id === 5) textContent = page.title || '';
          if (id === 6) textContent = page.subtitle || '';
          if (id === 7) textContent = page.author || '';
          if (id === 8) textContent = page.date || '';
          break;
        case 'outline':
          if (id === 5) textContent = page.title || '';
          if (id === 6) textContent = page.subtitle || '';
          break;
        case 'content':
          if (page.sections && page.sections.length > 0) {
            if (id === 5) textContent = page.title || '';
            if (id === 6) textContent = page.sections[0]?.heading || '';
            if (id === 7) textContent = page.sections[0]?.content || '';
            if (id === 8) textContent = page.sections[1]?.heading || '';
            if (id === 9) textContent = page.sections[1]?.content || '';
          }
          break;
        case 'section_header':
          if (id === 5) textContent = page.title || '';
          if (id === 6) textContent = page.subtitle || '';
          break;
        case 'conclusion':
          if (id === 5) textContent = page.title || '';
          if (id === 6) textContent = page.content || '';
          break;
        case 'thank_you':
          if (id === 5) textContent = page.title || '';
          if (id === 6) textContent = page.subtitle || '';
          if (id === 7) textContent = page.contact || '';
          break;
        default:
          break;
      }
    }

    // 背景填充
    let fill = 'transparent';
    if (shape?.fill) {
      fill = parseColor(shape.fill);
    }

    // 边框
    let stroke = 'none';
    let strokeWidth = 0;
    if (shape?.line?.stroke) {
      stroke = parseColor(shape.line.stroke);
      strokeWidth = shape.line.strokeWidth || 1;
    }

    return (
      <g key={id} transform={`translate(${left}, ${top})`}>
        {/* 背景形状 */}
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={strokeWidth}
          rx="5"
        />
        
        {/* 文本 */}
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={element.contents?.[0]?.fontFamily || 'Arial'}
          fontSize={element.contents?.[0]?.fontSize || 14}
          fill={element.contents?.[0]?.fontFill ? parseColor(element.contents[0].fontFill) : '#000'}
        >
          {textContent}
        </text>
      </g>
    );
  };

  // 渲染图片元素为 SVG
  const renderImageElementAsSVG = (element) => {
    const { left, top, width, height, src, id } = element;

    return (
      <image
        key={id}
        href={src}
        x={left}
        y={top}
        width={width}
        height={height}
      />
    );
  };

  // 渲染单个元素为 SVG
  const renderElementAsSVG = (element) => {
    switch (element.type) {
      case 'text':
        return renderTextElementAsSVG(element);
      case 'image':
        return renderImageElementAsSVG(element);
      default:
        return null;
    }
  };

  // 背景颜色
  let backgroundColor = 'white';
  if (template.background) {
    backgroundColor = parseColor(template.background);
  }

  return (
    <svg 
      viewBox="0 0 960 540" 
      style={{ width: '100%', height: 'auto', background: backgroundColor }}
    >
      {/* 渲染所有元素 */}
      {template.elements?.map((element) => renderElementAsSVG(element))}
    </svg>
  );
};

export default SvgTemplateRenderer;