// PptViewer.jsx
import React from 'react';
import './PptViewer.css';
import PptRenderer from './PptRenderer';
import PPTTemplateRenderer from './PPTTemplateRenderer';
import template1 from './templates/1.json';
import template2 from './templates/2.json';
import template3 from './templates/3.json';
import template4 from './templates/4.json';
import template5 from './templates/5.json';
import template6 from './templates/6.json';
import template7 from './templates/7.json';
import template8 from './templates/8.json';
import template9 from './templates/9.json';
import template10 from './templates/10.json';
import template11 from './templates/11.json';
import template12 from './templates/12.json';
import template13 from './templates/13.json';
import template14 from './templates/14.json';
import template15 from './templates/15.json';
import template16 from './templates/16.json';
import template17 from './templates/17.json';


const templates = [template1, template2, template3, template4, template5, template6, template7, template8, template9, template10, template11, template12, template13, template14, template15, template16, template17]


const PptViewer = ({ pptData }) => {
  console.log(pptData);
  const renderPage = (page, index) => {
    switch (page.type) {
      case 'cover':
        return <CoverPage page={page} />;
      case 'outline':
        return <PPTTemplateRenderer template={template17} page={page} /> // <ContentPage page={page} />;
      case 'content':
        return <ContentPage page={page} />;
      case 'section_header':
        return <SectionHeaderPage page={page} />;
      case 'conclusion':
        return <ConclusionPage page={page} />;
      case 'thank_you':
        return <ThankYouPage page={page} />;
      default:
        return <div key={index}>未知页面类型</div>;
    }
  };

  return (
    // <div className="ppt-viewer">
    //   {templates.map(val =>

    //     <PPTTemplateRenderer template={val} />
    //   )}
    //   <PptRenderer pptData={pptData} />
    // </div>
    <div className="ppt-viewer">
      {templates.map(val =>
        <PPTTemplateRenderer template={val} />
      )}
      {/* <div className="header">{pptStr}</div> */}
      <div className="slides-container">
        {pptData.pages.map((page, index) => (
          <div key={index} className="slide">
            {renderPage(page, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

const CoverPage = ({ page }) => (
  <div className="cover-page page">
    {page.title && <h1 className="cover-title">{page.title}</h1>}
    {page.subtitle && <h2 className="cover-subtitle">{page.subtitle}</h2>}
    {page.author && <p className="cover-author">{page.author}</p>}
    {page.date && <p className="cover-date">{page.date}</p>}
  </div>
);

const ContentPage = ({ page }) => (
  <div className={`content-page page layout-${page.layout}`}>
    <h2 className="content-title">{page.title}</h2>
    <div className="content-sections">
      {page.sections.map((section, index) => (
        <div key={index} className="section">
          <h3 className="section-heading">{section.heading}</h3>
          <p className="section-content">{section.content}</p>
          {section.bulletPoints && (
            <ul className="bullet-points">
              {section.bulletPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  </div>
);

const SectionHeaderPage = ({ page }) => (
  <div className="section-header-page page">
    <h1 className="section-header-title">{page.title}</h1>
    {page.subtitle && <h2 className="section-header-subtitle">{page.subtitle}</h2>}
  </div>
);

const ConclusionPage = ({ page }) => (
  <div className="conclusion-page page">
    <h2 className="conclusion-title">{page.title}</h2>
    <p className="conclusion-content">{page.content}</p>
    {page.keyPoints && (
      <div className="key-points">
        <h3>关键点:</h3>
        <ul>
          {page.keyPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const ThankYouPage = ({ page }) => (
  <div className="thank-you-page page">
    <h1 className="thank-you-title">{page.title}</h1>
    {page.subtitle && <h2 className="thank-you-subtitle">{page.subtitle}</h2>}
    {page.contact && <p className="contact-info">{page.contact}</p>}
  </div>
);

export default PptViewer;