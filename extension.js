const fs = require("fs/promises");
const path = require("path");
const vscode = require("vscode");

const PHP_SNIPPET = `<?php
if (!isset($rawClick) && empty($_COOKIE['_subid'])) {
    header("Location: https://1chart.ru");
    exit();
}
?>`;

const DOMONETKA_INIT_SNIPPET = `<script>
const domonetkaRaw = '{domonetka}';
const domonetka = decodeURIComponent(domonetkaRaw);
</script>`;
const DOMONETKA_SCRIPT_SNIPPET =
  '<script src="https://cdn.jsdelivr.net/gh/Leontev-E/pxl/indexPxl.js"></script>';
const TEMPLATE_PHP_FILES = ["success.php", "error.php"];
const API_FILENAME = "api.php";

const LIBRARY_RULES = [
  {
    name: "jQuery",
    type: "script",
    slug: "jquery",
    defaultVersion: "3.7.1",
    file: "jquery.min.js",
    patterns: [/jquery(?:\.min)?(?:[-.]\d[\w.-]*)?\.js/i]
  },
  {
    name: "Bootstrap JS",
    type: "script",
    slug: "bootstrap",
    defaultVersion: "5.3.3",
    file: "js/bootstrap.bundle.min.js",
    patterns: [/bootstrap(?:\.bundle)?(?:\.min)?\.js/i]
  },
  {
    name: "Bootstrap CSS",
    type: "style",
    slug: "bootstrap",
    defaultVersion: "5.3.3",
    file: "css/bootstrap.min.css",
    patterns: [/bootstrap(?:\.min)?\.css/i]
  },
  {
    name: "Font Awesome",
    type: "style",
    slug: "font-awesome",
    defaultVersion: "6.5.2",
    file: "css/all.min.css",
    patterns: [/font-?awesome|fontawesome|all\.min\.css/i]
  },
  {
    name: "intl-tel-input JS",
    type: "script",
    slug: "intl-tel-input",
    defaultVersion: "17.0.19",
    file: "js/intlTelInput.min.js",
    patterns: [/intl-?tel-?input|intlTelInput/i]
  },
  {
    name: "intl-tel-input CSS",
    type: "style",
    slug: "intl-tel-input",
    defaultVersion: "17.0.19",
    file: "css/intlTelInput.min.css",
    patterns: [/intl-?tel-?input|intlTelInput/i]
  },
  {
    name: "Vue",
    type: "script",
    slug: "vue",
    defaultVersion: "2.7.16",
    file: "vue.min.js",
    patterns: [/vue(?:\.global)?(?:\.runtime)?(?:\.prod)?(?:\.min)?\.js/i]
  },
  {
    name: "React",
    type: "script",
    slug: "react",
    defaultVersion: "18.2.0",
    file: "umd/react.production.min.js",
    patterns: [/react(?:\.production)?(?:\.min)?\.js/i]
  },
  {
    name: "React DOM",
    type: "script",
    slug: "react-dom",
    defaultVersion: "18.2.0",
    file: "umd/react-dom.production.min.js",
    patterns: [/react-dom(?:\.production)?(?:\.min)?\.js/i]
  },
  {
    name: "AngularJS",
    type: "script",
    slug: "angular.js",
    defaultVersion: "1.8.3",
    file: "angular.min.js",
    patterns: [/angular(?:\.min)?\.js/i]
  },
  {
    name: "Lodash",
    type: "script",
    slug: "lodash.js",
    defaultVersion: "4.17.21",
    file: "lodash.min.js",
    patterns: [/lodash(?:\.min)?\.js/i]
  },
  {
    name: "Underscore",
    type: "script",
    slug: "underscore.js",
    defaultVersion: "1.13.6",
    file: "underscore-min.js",
    patterns: [/underscore(?:-min)?\.js/i]
  },
  {
    name: "Moment",
    type: "script",
    slug: "moment.js",
    defaultVersion: "2.30.1",
    file: "moment.min.js",
    patterns: [/moment(?:\.min)?\.js/i]
  },
  {
    name: "Day.js",
    type: "script",
    slug: "dayjs",
    defaultVersion: "1.11.10",
    file: "dayjs.min.js",
    patterns: [/dayjs(?:\.min)?\.js/i]
  },
  {
    name: "Axios",
    type: "script",
    slug: "axios",
    defaultVersion: "1.6.8",
    file: "axios.min.js",
    patterns: [/axios(?:\.min)?\.js/i]
  },
  {
    name: "Chart.js",
    type: "script",
    slug: "Chart.js",
    defaultVersion: "4.4.1",
    file: "chart.umd.min.js",
    patterns: [/chart(?:\.umd)?(?:\.min)?\.js/i]
  },
  {
    name: "D3",
    type: "script",
    slug: "d3",
    defaultVersion: "7.9.0",
    file: "d3.min.js",
    patterns: [/d3(?:\.min)?\.js/i]
  },
  {
    name: "GSAP",
    type: "script",
    slug: "gsap",
    defaultVersion: "3.12.5",
    file: "gsap.min.js",
    patterns: [/gsap(?:\.min)?\.js/i]
  },
  {
    name: "anime.js",
    type: "script",
    slug: "animejs",
    defaultVersion: "3.2.2",
    file: "anime.min.js",
    patterns: [/anime(?:\.min)?\.js/i]
  },
  {
    name: "Slick JS",
    type: "script",
    slug: "slick-carousel",
    defaultVersion: "1.8.1",
    file: "slick/slick.min.js",
    patterns: [/slick(?:\.min)?\.js/i]
  },
  {
    name: "Slick CSS",
    type: "style",
    slug: "slick-carousel",
    defaultVersion: "1.8.1",
    file: "slick/slick.min.css",
    patterns: [/slick(?:\.min)?\.css/i]
  },
  {
    name: "Swiper JS",
    type: "script",
    slug: "Swiper",
    defaultVersion: "11.1.4",
    file: "swiper-bundle.min.js",
    patterns: [/swiper(?:-bundle)?(?:\.min)?\.js/i]
  },
  {
    name: "Swiper CSS",
    type: "style",
    slug: "Swiper",
    defaultVersion: "11.1.4",
    file: "swiper-bundle.min.css",
    patterns: [/swiper(?:-bundle)?(?:\.min)?\.css/i]
  },
  {
    name: "Owl Carousel JS",
    type: "script",
    slug: "OwlCarousel2",
    defaultVersion: "2.3.4",
    file: "owl.carousel.min.js",
    patterns: [/owl\.?carousel(?:\.min)?\.js/i]
  },
  {
    name: "Owl Carousel CSS",
    type: "style",
    slug: "OwlCarousel2",
    defaultVersion: "2.3.4",
    file: "assets/owl.carousel.min.css",
    patterns: [/owl\.?carousel(?:\.min)?\.css/i]
  },
  {
    name: "AOS JS",
    type: "script",
    slug: "aos",
    defaultVersion: "2.3.4",
    file: "aos.js",
    patterns: [/aos(?:\.min)?\.js/i]
  },
  {
    name: "AOS CSS",
    type: "style",
    slug: "aos",
    defaultVersion: "2.3.4",
    file: "aos.css",
    patterns: [/aos(?:\.min)?\.css/i]
  },
  {
    name: "WOW.js",
    type: "script",
    slug: "wow",
    defaultVersion: "1.1.2",
    file: "wow.min.js",
    patterns: [/wow(?:\.min)?\.js/i]
  },
  {
    name: "Select2 JS",
    type: "script",
    slug: "select2",
    defaultVersion: "4.1.0-rc.0",
    file: "js/select2.min.js",
    patterns: [/select2(?:\.min)?\.js/i]
  },
  {
    name: "Select2 CSS",
    type: "style",
    slug: "select2",
    defaultVersion: "4.1.0-rc.0",
    file: "css/select2.min.css",
    patterns: [/select2(?:\.min)?\.css/i]
  },
  {
    name: "Toastr JS",
    type: "script",
    slug: "toastr.js",
    defaultVersion: "2.1.4",
    file: "toastr.min.js",
    patterns: [/toastr(?:\.min)?\.js/i]
  },
  {
    name: "Toastr CSS",
    type: "style",
    slug: "toastr.js",
    defaultVersion: "2.1.4",
    file: "toastr.min.css",
    patterns: [/toastr(?:\.min)?\.css/i]
  },
  {
    name: "SweetAlert2 JS",
    type: "script",
    slug: "sweetalert2",
    defaultVersion: "11.10.8",
    file: "sweetalert2.all.min.js",
    patterns: [/sweetalert2(?:\.all)?(?:\.min)?\.js|swal/i]
  },
  {
    name: "SweetAlert2 CSS",
    type: "style",
    slug: "sweetalert2",
    defaultVersion: "11.10.8",
    file: "sweetalert2.min.css",
    patterns: [/sweetalert2(?:\.min)?\.css/i]
  },
  {
    name: "DataTables JS",
    type: "script",
    slug: "datatables",
    defaultVersion: "1.13.8",
    file: "js/jquery.dataTables.min.js",
    patterns: [/datatables|jquery\.dataTables(?:\.min)?\.js/i]
  },
  {
    name: "DataTables CSS",
    type: "style",
    slug: "datatables",
    defaultVersion: "1.13.8",
    file: "css/jquery.dataTables.min.css",
    patterns: [/datatables|jquery\.dataTables(?:\.min)?\.css/i]
  },
  {
    name: "Magnific Popup JS",
    type: "script",
    slug: "magnific-popup.js",
    defaultVersion: "1.1.0",
    file: "jquery.magnific-popup.min.js",
    patterns: [/magnific(?:-popup)?(?:\.min)?\.js/i]
  },
  {
    name: "Magnific Popup CSS",
    type: "style",
    slug: "magnific-popup.js",
    defaultVersion: "1.1.0",
    file: "magnific-popup.min.css",
    patterns: [/magnific(?:-popup)?(?:\.min)?\.css/i]
  },
  {
    name: "Fancybox JS",
    type: "script",
    slug: "fancybox",
    defaultVersion: "3.5.7",
    file: "jquery.fancybox.min.js",
    patterns: [/fancybox(?:\.min)?\.js/i]
  },
  {
    name: "Fancybox CSS",
    type: "style",
    slug: "fancybox",
    defaultVersion: "3.5.7",
    file: "jquery.fancybox.min.css",
    patterns: [/fancybox(?:\.min)?\.css/i]
  },
  {
    name: "Lightbox2 JS",
    type: "script",
    slug: "lightbox2",
    defaultVersion: "2.11.4",
    file: "js/lightbox.min.js",
    patterns: [/lightbox(?:\.min)?\.js/i]
  },
  {
    name: "Lightbox2 CSS",
    type: "style",
    slug: "lightbox2",
    defaultVersion: "2.11.4",
    file: "css/lightbox.min.css",
    patterns: [/lightbox(?:\.min)?\.css/i]
  },
  {
    name: "Leaflet JS",
    type: "script",
    slug: "leaflet",
    defaultVersion: "1.9.4",
    file: "leaflet.min.js",
    patterns: [/leaflet(?:\.min)?\.js/i]
  },
  {
    name: "Leaflet CSS",
    type: "style",
    slug: "leaflet",
    defaultVersion: "1.9.4",
    file: "leaflet.min.css",
    patterns: [/leaflet(?:\.min)?\.css/i]
  },
  {
    name: "video.js JS",
    type: "script",
    slug: "video.js",
    defaultVersion: "8.10.0",
    file: "video.min.js",
    patterns: [/video(?:\.min)?\.js/i]
  },
  {
    name: "video.js CSS",
    type: "style",
    slug: "video.js",
    defaultVersion: "8.10.0",
    file: "video-js.min.css",
    patterns: [/video(?:-js)?(?:\.min)?\.css/i]
  },
  {
    name: "Masonry",
    type: "script",
    slug: "masonry",
    defaultVersion: "4.2.2",
    file: "masonry.pkgd.min.js",
    patterns: [/masonry(?:\.pkgd)?(?:\.min)?\.js/i]
  },
  {
    name: "Isotope",
    type: "script",
    slug: "isotope",
    defaultVersion: "3.0.6",
    file: "isotope.pkgd.min.js",
    patterns: [/isotope(?:\.pkgd)?(?:\.min)?\.js/i]
  },
  {
    name: "Popper",
    type: "script",
    slug: "popper.js",
    defaultVersion: "2.11.8",
    file: "umd/popper.min.js",
    patterns: [/popper(?:\.min)?\.js/i]
  },
  {
    name: "Normalize.css",
    type: "style",
    slug: "normalize",
    defaultVersion: "8.0.1",
    file: "normalize.min.css",
    patterns: [/normalize(?:\.min)?\.css/i]
  },
  {
    name: "animate.css",
    type: "style",
    slug: "animate.css",
    defaultVersion: "4.1.1",
    file: "animate.min.css",
    patterns: [/animate(?:\.min)?\.css/i]
  },
  {
    name: "Inputmask",
    type: "script",
    slug: "inputmask",
    defaultVersion: "5.0.9",
    file: "inputmask.min.js",
    patterns: [/inputmask(?:\.min)?\.js/i]
  },
  {
    name: "Noty JS",
    type: "script",
    slug: "noty",
    defaultVersion: "3.2.0-beta",
    file: "noty.min.js",
    patterns: [/noty(?:\.min)?\.js/i]
  },
  {
    name: "Noty CSS",
    type: "style",
    slug: "noty",
    defaultVersion: "3.2.0-beta",
    file: "noty.min.css",
    patterns: [/noty(?:\.min)?\.css/i]
  }
];

const SCRIPT_TAG_RE =
  /<script\b[^>]*\bsrc\s*=\s*(['"])([^"']+)\1[^>]*>\s*<\/script>/gi;
const LINK_TAG_RE = /<link\b[^>]*\bhref\s*=\s*(['"])([^"']+)\1[^>]*>/gi;
const DOMONETKA_INIT_BLOCK_RE =
  /<script\b[^>]*>\s*const\s+domonetkaRaw\s*=\s*['"]\{domonetka\}['"];\s*const\s+domonetka\s*=\s*decodeURIComponent\(domonetkaRaw\);\s*<\/script>/gi;

function buildCdnUrl(rule) {
  return `https://cdnjs.cloudflare.com/ajax/libs/${rule.slug}/${rule.defaultVersion}/${rule.file}`;
}

function stripQueryAndHash(value) {
  return value.split(/[?#]/, 1)[0];
}

function isLocalResource(value) {
  return !/^(?:[a-z]+:)?\/\//i.test(value) && !/^data:/i.test(value);
}

function normalizeForMatch(value) {
  const raw = stripQueryAndHash(value);
  try {
    return decodeURIComponent(raw).toLowerCase();
  } catch (error) {
    return raw.toLowerCase();
  }
}

function detectRule(type, value) {
  const normalized = normalizeForMatch(value);
  return LIBRARY_RULES.find((rule) => {
    if (rule.type !== type) {
      return false;
    }
    return rule.patterns.some((pattern) => pattern.test(normalized));
  });
}

function detectPxlFile(normalizedResource) {
  if (!normalizedResource.includes("leontev-e/pxl")) {
    return null;
  }
  if (normalizedResource.includes("indexpxl.js")) {
    return "indexPxl.js";
  }
  if (normalizedResource.includes("/pxl.js")) {
    return "pxl.js";
  }
  return null;
}

function buildPxlScriptUrl(fileName) {
  return `https://cdn.jsdelivr.net/gh/Leontev-E/pxl/${fileName}`;
}

function normalizePxlScripts(content, report) {
  let keptPxlScript = false;

  return content.replace(SCRIPT_TAG_RE, (fullTag, quote, src) => {
    const normalized = normalizeForMatch(src);
    const fileName = detectPxlFile(normalized);
    if (!fileName) {
      return fullTag;
    }

    if (keptPxlScript) {
      report.removedDuplicateDomonetkaBlocks += 1;
      return "";
    }
    keptPxlScript = true;

    const canonical = buildPxlScriptUrl(fileName);
    if (normalizeForMatch(src) !== normalizeForMatch(canonical)) {
      report.normalizedPxlScripts += 1;
    }
    return `<script src="${canonical}"></script>`;
  });
}

function dedupeDomonetkaInitBlocks(content, report) {
  let seen = false;
  return content.replace(DOMONETKA_INIT_BLOCK_RE, () => {
    if (seen) {
      report.removedDuplicateDomonetkaBlocks += 1;
      return "";
    }
    seen = true;
    return DOMONETKA_INIT_SNIPPET;
  });
}

function hasDomonetkaInit(content) {
  return (
    /const\s+domonetkaRaw\s*=\s*['"]\{domonetka\}['"]\s*;/i.test(content) &&
    /decodeURIComponent\s*\(\s*domonetkaRaw\s*\)/i.test(content)
  );
}

function resolveLocalPath(resource, htmlDir, workspaceFolders) {
  if (!isLocalResource(resource)) {
    return null;
  }

  const clean = stripQueryAndHash(resource);
  if (!clean) {
    return null;
  }

  if (clean.startsWith("/")) {
    if (!workspaceFolders.length) {
      return null;
    }
    return path.resolve(workspaceFolders[0].uri.fsPath, clean.slice(1));
  }

  return path.resolve(htmlDir, clean);
}

function isInsideWorkspace(filePath, workspaceFolders) {
  const normalizedTarget = path.resolve(filePath).toLowerCase();
  return workspaceFolders.some((folder) => {
    const root = path.resolve(folder.uri.fsPath).toLowerCase();
    return normalizedTarget === root || normalizedTarget.startsWith(`${root}${path.sep}`);
  });
}

function replaceScriptAndLinks(content, htmlDir, workspaceFolders, report) {
  const localFiles = new Set();
  const seenLibraries = new Set();

  const withScripts = content.replace(SCRIPT_TAG_RE, (fullTag, quote, src) => {
    const rule = detectRule("script", src);
    if (!rule) {
      return fullTag;
    }

    const cdnUrl = buildCdnUrl(rule);
    const replacement = `<script src="${cdnUrl}"></script>`;
    const key = `${rule.type}:${rule.slug}:${rule.file}`.toLowerCase();

    if (isLocalResource(src)) {
      const resolved = resolveLocalPath(src, htmlDir, workspaceFolders);
      if (resolved && isInsideWorkspace(resolved, workspaceFolders)) {
        localFiles.add(resolved);
      }
    }

    if (seenLibraries.has(key)) {
      report.removedDuplicateLibraries += 1;
      return "";
    }
    seenLibraries.add(key);

    if (normalizeForMatch(src) === normalizeForMatch(cdnUrl)) {
      return fullTag;
    }

    report.replacedLibraries.push({ name: rule.name, from: src, to: cdnUrl });
    return replacement;
  });

  const withLinks = withScripts.replace(LINK_TAG_RE, (fullTag, quote, href) => {
    const rule = detectRule("style", href);
    if (!rule) {
      return fullTag;
    }

    const cdnUrl = buildCdnUrl(rule);
    const replacement = `<link rel="stylesheet" href="${cdnUrl}">`;
    const key = `${rule.type}:${rule.slug}:${rule.file}`.toLowerCase();

    if (isLocalResource(href)) {
      const resolved = resolveLocalPath(href, htmlDir, workspaceFolders);
      if (resolved && isInsideWorkspace(resolved, workspaceFolders)) {
        localFiles.add(resolved);
      }
    }

    if (seenLibraries.has(key)) {
      report.removedDuplicateLibraries += 1;
      return "";
    }
    seenLibraries.add(key);

    if (normalizeForMatch(href) === normalizeForMatch(cdnUrl)) {
      return fullTag;
    }

    report.replacedLibraries.push({ name: rule.name, from: href, to: cdnUrl });
    return replacement;
  });

  return { content: withLinks, localFiles };
}

function ensurePhpSnippet(content, report) {
  if (content.includes("https://1chart.ru") || content.includes("empty($_COOKIE['_subid'])")) {
    return content;
  }
  report.addedPhpBlock = true;
  return `${PHP_SNIPPET}\n${content}`;
}

function ensureDomonetkaSnippet(content, report) {
  const initExists = hasDomonetkaInit(content);
  const pxlScriptExists = /leontev-e\/pxl\/(?:indexpxl|pxl)\.js/i.test(content.toLowerCase());

  if (initExists && pxlScriptExists) {
    return content;
  }

  if (/<\/title>/i.test(content)) {
    report.addedDomonetkaBlock = true;
    const blocksToInsert = [];
    if (!initExists) {
      blocksToInsert.push(DOMONETKA_INIT_SNIPPET);
    }
    if (!pxlScriptExists) {
      blocksToInsert.push(DOMONETKA_SCRIPT_SNIPPET);
    }
    return content.replace(/<\/title>/i, (match) => `${match}\n${blocksToInsert.join("\n")}`);
  }

  report.warnings.push("</title> not found, domonetka block was not inserted.");
  return content;
}

async function deleteLocalLibraries(filesToDelete, workspaceFolders, report) {
  for (const filePath of filesToDelete) {
    try {
      if (!isInsideWorkspace(filePath, workspaceFolders)) {
        continue;
      }

      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        continue;
      }

      await fs.rm(filePath);
      report.deletedLocalFiles.push(filePath);
    } catch (error) {
      // Ignore absent files or permission issues and continue processing.
    }
  }
}

async function getIndexHtmlDocument() {
  const active = vscode.window.activeTextEditor?.document;
  if (active && path.basename(active.uri.fsPath).toLowerCase() === "index.html") {
    return active;
  }

  const indexFiles = await vscode.workspace.findFiles(
    "**/index.html",
    "**/{node_modules,.git,dist,build}/**",
    1
  );

  if (!indexFiles.length) {
    return null;
  }

  return vscode.workspace.openTextDocument(indexFiles[0]);
}

async function applyFullDocumentEdit(document, nextContent) {
  const lastLine = document.lineAt(document.lineCount - 1);
  const fullRange = new vscode.Range(0, 0, lastLine.range.end.line, lastLine.range.end.character);
  const edit = new vscode.WorkspaceEdit();
  edit.replace(document.uri, fullRange, nextContent);
  await vscode.workspace.applyEdit(edit);
  await document.save();
}

function getSiteRoot(document, workspaceFolders) {
  const workspaceForDocument = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspaceForDocument) {
    return workspaceForDocument.uri.fsPath;
  }
  return workspaceFolders[0].uri.fsPath;
}

async function syncSitePhpFiles(siteRoot, extensionRoot, report) {
  for (const templateFileName of TEMPLATE_PHP_FILES) {
    const sourcePath = path.join(extensionRoot, templateFileName);
    const targetPath = path.join(siteRoot, templateFileName);

    try {
      const templateContent = await fs.readFile(sourcePath, "utf8");
      let existed = true;
      try {
        const stat = await fs.stat(targetPath);
        existed = stat.isFile();
      } catch (error) {
        existed = false;
      }

      await fs.writeFile(targetPath, templateContent, "utf8");
      report.syncedPhpPages.push({
        file: templateFileName,
        action: existed ? "replaced" : "created"
      });
    } catch (error) {
      report.warnings.push(`Cannot sync ${templateFileName}: ${error.message}`);
    }
  }
}

async function ensureApiPhp(siteRoot, report) {
  const apiPath = path.join(siteRoot, API_FILENAME);
  try {
    const stat = await fs.stat(apiPath);
    if (stat.isFile()) {
      return;
    }
    report.warnings.push(`${API_FILENAME} exists but is not a file.`);
    return;
  } catch (error) {
    // File does not exist, create an empty one.
  }

  await fs.writeFile(apiPath, "", "utf8");
  report.createdApiFile = true;
}

async function processIndexHtml(extensionRoot) {
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  if (!workspaceFolders.length) {
    vscode.window.showErrorMessage("KLM inc: open a project folder in VS Code.");
    return;
  }

  const document = await getIndexHtmlDocument();
  const report = {
    addedPhpBlock: false,
    addedDomonetkaBlock: false,
    normalizedPxlScripts: 0,
    removedDuplicateDomonetkaBlocks: 0,
    replacedLibraries: [],
    removedDuplicateLibraries: 0,
    deletedLocalFiles: [],
    syncedPhpPages: [],
    createdApiFile: false,
    warnings: []
  };

  const siteRoot = document
    ? getSiteRoot(document, workspaceFolders)
    : workspaceFolders[0].uri.fsPath;

  if (document) {
    const original = document.getText();
    const htmlDir = path.dirname(document.uri.fsPath);

    let next = ensurePhpSnippet(original, report);
    next = normalizePxlScripts(next, report);
    next = dedupeDomonetkaInitBlocks(next, report);
    next = ensureDomonetkaSnippet(next, report);
    const replacements = replaceScriptAndLinks(next, htmlDir, workspaceFolders, report);
    next = replacements.content;

    if (next !== original) {
      await applyFullDocumentEdit(document, next);
    }

    await deleteLocalLibraries(replacements.localFiles, workspaceFolders, report);
  } else {
    report.warnings.push("index.html not found, skipped HTML normalization.");
  }

  await syncSitePhpFiles(siteRoot, extensionRoot, report);
  await ensureApiPhp(siteRoot, report);

  const changed = Boolean(
    report.addedPhpBlock ||
      report.addedDomonetkaBlock ||
      report.normalizedPxlScripts > 0 ||
      report.removedDuplicateDomonetkaBlocks > 0 ||
      report.replacedLibraries.length > 0 ||
      report.removedDuplicateLibraries > 0 ||
      report.syncedPhpPages.length > 0 ||
      report.createdApiFile
  );
  if (!changed) {
    vscode.window.showInformationMessage("KLM inc: no changes required.");
    return;
  }

  const phpPagesSummary =
    report.syncedPhpPages.length > 0
      ? `synced php pages: ${report.syncedPhpPages
          .map((item) => `${item.file} (${item.action})`)
          .join(", ")}`
      : "synced php pages: 0";

  const summary = [
    report.addedPhpBlock ? "php block added" : "php block already present",
    report.addedDomonetkaBlock
      ? "domonetka block added"
      : "domonetka block already present or skipped",
    `pxl links normalized: ${report.normalizedPxlScripts}`,
    `duplicate domonetka blocks removed: ${report.removedDuplicateDomonetkaBlocks}`,
    `libraries replaced: ${report.replacedLibraries.length}`,
    `duplicate libraries removed: ${report.removedDuplicateLibraries}`,
    `local files deleted: ${report.deletedLocalFiles.length}`,
    phpPagesSummary,
    report.createdApiFile ? `${API_FILENAME} created` : `${API_FILENAME} already exists`
  ].join(", ");

  if (report.warnings.length) {
    vscode.window.showWarningMessage(`KLM inc: ${summary}. ${report.warnings.join(" ")}`);
  } else {
    vscode.window.showInformationMessage(`KLM inc: ${summary}.`);
  }
}

function activate(context) {
  const disposable = vscode.commands.registerCommand("klmInc.processIndexHtml", async () => {
    try {
      await processIndexHtml(context.extensionPath);
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      vscode.window.showErrorMessage(`KLM inc: failed to process index.html: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
