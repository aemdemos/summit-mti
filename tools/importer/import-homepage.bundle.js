var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document }) {
    const slideItems = element.querySelectorAll(".cmp-carousel__item");
    const cells = [];
    slideItems.forEach((slide) => {
      const imageCell = [];
      const itemEl = slide.querySelector(".item");
      if (itemEl) {
        const bgStyle = itemEl.style.backgroundImage;
        if (bgStyle) {
          const urlMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch) {
            let bgUrl = urlMatch[1];
            if (bgUrl.startsWith("/")) {
              bgUrl = `https://www.marvell.com${bgUrl}`;
            }
            const bgImg = document.createElement("img");
            bgImg.src = bgUrl;
            bgImg.alt = "";
            imageCell.push(bgImg);
          }
        }
      }
      const fgImg = slide.querySelector(".mrvll-hero-image img.d-none.d-md-block") || slide.querySelector(".mrvll-hero-image img") || slide.querySelector(".item-wrapper img");
      if (fgImg) {
        const fgClone = document.createElement("img");
        fgClone.src = fgImg.currentSrc || fgImg.src;
        fgClone.alt = fgImg.alt || "";
        imageCell.push(fgClone);
      }
      if (imageCell.length === 0) {
        const anyImg = slide.querySelector("img");
        if (anyImg) imageCell.push(anyImg);
      }
      const contentCell = [];
      const eyebrow = slide.querySelector(".mrvll-eyebrow");
      if (eyebrow) {
        const eyebrowP = document.createElement("p");
        eyebrowP.textContent = eyebrow.textContent.trim();
        contentCell.push(eyebrowP);
      }
      const headingContainer = slide.querySelector('.color-white, [class*="color-white"]');
      if (headingContainer) {
        const h1s = headingContainer.querySelectorAll("h1");
        if (h1s.length > 0) {
          const combinedHeading = document.createElement("h1");
          const parts = [];
          h1s.forEach((h) => {
            const b = h.querySelector("b");
            parts.push(b ? b.textContent.trim() : h.textContent.trim());
          });
          combinedHeading.textContent = parts.join(" ");
          contentCell.push(combinedHeading);
        }
      }
      const ctaContainer = slide.querySelector(".d-none.d-md-inline-block .mrvll-text-link a, .cmp-teaser__ctabutton a");
      if (ctaContainer) {
        const ctaLink = document.createElement("a");
        ctaLink.href = ctaContainer.href;
        ctaLink.textContent = ctaContainer.textContent.trim();
        const ctaP = document.createElement("p");
        ctaP.append(ctaLink);
        contentCell.push(ctaP);
      }
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell.length > 0 ? imageCell : "", contentCell.length > 0 ? contentCell : ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const leftSection = element.querySelector(".left-section, .col-sm-6:first-child");
    const col1 = [];
    if (leftSection) {
      const heading = leftSection.querySelector("h2, h3, h1");
      if (heading) col1.push(heading);
      const desc = leftSection.querySelector("p");
      if (desc) col1.push(desc);
      const ctaLink = leftSection.querySelector(".mrvll-text-link a, .ctabutton a, a[href]");
      if (ctaLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaLink.href;
        a.textContent = ctaLink.textContent.trim();
        p.append(a);
        col1.push(p);
      }
    }
    const rightSection = element.querySelector(".right-section, .col-sm-6:last-child");
    const col2 = [];
    if (rightSection) {
      const videoImg = rightSection.querySelector(".tile-popup-vidyard, .vidyard-add-play-icon img, img");
      if (videoImg) {
        const uuid = videoImg.getAttribute("data-uuid") || videoImg.getAttribute("data-video-url");
        if (uuid) {
          const thumbImg = document.createElement("img");
          thumbImg.src = `https://play.vidyard.com/${uuid}.jpg`;
          thumbImg.alt = "";
          col2.push(thumbImg);
          const videoUrl = `https://play.vidyard.com/${uuid}`;
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = videoUrl;
          a.textContent = videoUrl;
          p.append(a);
          col2.push(p);
        } else {
          col2.push(videoImg);
        }
      }
    }
    const cells = [
      [col1.length > 0 ? col1 : "", col2.length > 0 ? col2 : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse3(element, { document }) {
    const marketsHeading = element.querySelector(".mrvll-features-nav h3, h3.color-white-rebranding");
    let headingEl = null;
    if (marketsHeading) {
      headingEl = document.createElement("h3");
      headingEl.textContent = marketsHeading.textContent.trim();
    }
    const tabButtons = element.querySelectorAll(".mrvll-features-nav li button, .rebranding-nav-tab-carousel li button");
    const tabPanels = element.querySelectorAll(".carousel-inner > .item");
    const cells = [];
    const panelCount = Math.max(tabButtons.length, tabPanels.length);
    for (let i = 0; i < panelCount; i += 1) {
      const tabLabel = tabButtons[i] ? tabButtons[i].textContent.trim() : `Tab ${i + 1}`;
      const imageCell = [];
      const contentCell = [];
      const panel = tabPanels[i];
      if (panel) {
        const bgStyle = panel.style.backgroundImage;
        if (bgStyle) {
          const urlMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch) {
            let bgUrl = urlMatch[1];
            if (bgUrl.startsWith("/")) {
              bgUrl = `https://www.marvell.com${bgUrl}`;
            }
            const bgImg = document.createElement("img");
            bgImg.src = bgUrl;
            bgImg.alt = "";
            imageCell.push(bgImg);
          }
        }
        const heading = panel.querySelector(".mrvll-feature-text h3, .item-wrapper h3");
        if (heading) {
          const h3 = document.createElement("h3");
          h3.textContent = heading.textContent.trim();
          contentCell.push(h3);
        }
        const paragraphs = panel.querySelectorAll(".mrvll-feature-text p");
        paragraphs.forEach((p) => {
          const text = p.textContent.trim();
          if (text && !p.classList.contains("d-none") && !p.classList.contains("d-md-block")) {
            const desc = document.createElement("p");
            desc.textContent = text;
            contentCell.push(desc);
          }
        });
        const ctaLink = panel.querySelector(".mrvll-feature-text a.mrvll-text-link, .mrvll-feature-text a[href]");
        if (ctaLink) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = ctaLink.href;
          a.textContent = ctaLink.textContent.trim();
          p.append(a);
          contentCell.push(p);
        }
      }
      const row = [tabLabel];
      if (imageCell.length > 0) row.push(imageCell);
      row.push(contentCell.length > 0 ? contentCell : "");
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    if (headingEl) {
      element.replaceWith(headingEl, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards.js
  function parse4(element, { document }) {
    const tiles = element.querySelectorAll(".tile .marvell-tile, .marvell-tile, .tile a");
    const cells = [];
    tiles.forEach((tile) => {
      var _a;
      const imageCell = [];
      const bgImage = tile.style.backgroundImage;
      if (bgImage) {
        const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          const img = document.createElement("img");
          img.src = urlMatch[1];
          img.alt = "";
          imageCell.push(img);
        }
      }
      const contentCell = [];
      const titleEl = tile.querySelector(".subsection-title, .richtext-content h3, h3");
      if (titleEl) {
        const h3 = document.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        contentCell.push(h3);
      }
      const ctaEl = tile.querySelector(".mrvll-text-link, .btn-link");
      if (ctaEl) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = tile.href || ((_a = tile.closest("a")) == null ? void 0 : _a.href) || "#";
        a.textContent = ctaEl.textContent.trim();
        p.append(a);
        contentCell.push(p);
      }
      if (contentCell.length > 0) {
        if (imageCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else {
          cells.push([contentCell]);
        }
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/marvell-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".container.youtube",
        "#featurenews-video-model"
      ]);
      WebImporter.DOMUtils.remove(element, [".addinlinecss"]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        '[class*="ot-sdk"]',
        '[class*="cookie"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.mrvll-navigation",
        ".header.aem-GridColumn"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".footer.aem-GridColumn",
        ".mrvll-footer"
      ]);
      WebImporter.DOMUtils.remove(element, ["#searchboxContainer"]);
      WebImporter.DOMUtils.remove(element, [
        "link",
        "noscript",
        "iframe"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
        el.removeAttribute("data-cmp-hook-carousel");
      });
    }
  }

  // tools/importer/transformers/marvell-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel": parse,
    "columns": parse2,
    "tabs": parse3,
    "cards": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    urls: [
      "https://www.marvell.com/"
    ],
    description: "Marvell corporate homepage with hero carousel, AI infrastructure section, markets tabs, and explore cards",
    blocks: [
      {
        name: "carousel",
        instances: [".rebrandingcarousel"]
      },
      {
        name: "columns",
        instances: [".tile-with-video"]
      },
      {
        name: "tabs",
        instances: [".rebrandingtabscarousel"]
      },
      {
        name: "cards",
        instances: [".colctrl"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Carousel",
        selector: ".rebrandingcarousel",
        style: "dark",
        blocks: ["carousel"],
        defaultContent: []
      },
      {
        id: "section-2-ai-infrastructure",
        name: "AI Infrastructure",
        selector: ".tile-with-video",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-3-markets-tabs",
        name: "Markets Tabs",
        selector: ".rebrandingtabscarousel",
        style: "dark",
        blocks: ["tabs"],
        defaultContent: []
      },
      {
        id: "section-4-explore",
        name: "More to Explore",
        selector: [".richtext.rebrand-marvll-rictext-center", ".colctrl"],
        style: null,
        blocks: ["cards"],
        defaultContent: [".richtext.rebrand-marvll-rictext-center h3"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
