// SvgPptViewer.jsx
import React from 'react';
import SvgTemplateRenderer from './SvgTemplateRenderer';
import template1 from './templates/1.json';
import template2 from './templates/2.json';
import template3 from './templates/3.json';
import template4 from './templates/4.json';
import template5 from './templates/5.json';
import template6 from './templates/6.json';

const templates = {
  cover: template1,
  outline: template2,
  content: template3,
  section_header: template4,
  conclusion: template5,
  thank_you: template6
};

const SvgPptViewer = ({ pptData }) => {
  const renderPage = (page, index) => {
    const template = templates[page.type] || template1;
    
    return (
      <div key={index} style={{ margin: '20px auto', width: '960px', height: '540px' }}>
        <SvgTemplateRenderer template={template} page={page} />
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>{pptData.title}</h1>
      <div>
        {pptData.pages.map((page, index) => renderPage(page, index))}
      </div>
    </div>
  );
};

export default SvgPptViewer;