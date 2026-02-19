const fs = require("fs/promises");
const path = require("path");
const vscode = require("vscode");

const PHP_SNIPPET = `<?php
if (!isset($rawClick) && empty($_COOKIE['_subid'])) {
    header("Location: https://1chart.ru");
    exit();
}
?>`;

const DOMONETKA_SNIPPET = `<script>
const domonetkaRaw = '{domonetka}';
const domonetka = decodeURIComponent(domonetkaRaw);
</script>
<script src="https://cdn.jsdelivr.net/gh/Leontev-E/pxl/indexPxl.js"></script>`;

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
const VERSION_RE = /\/(\d+\.\d+(?:\.\d+)?(?:[-_][A-Za-z0-9.]+)?)\//;

function buildCdnUrl(rule, version) {
  const safeVersion = version || rule.defaultVersion;
  return `https://cdnjs.cloudflare.com/ajax/libs/${rule.slug}/${safeVersion}/${rule.file}`;
}

function detectVersion(resource) {
  const clean = stripQueryAndHash(resource);
  const match = clean.match(VERSION_RE);
  return match ? match[1] : null;
}

function stripQueryAndHash(value) {
  return value.split(/[?#]/, 1)[0];
}

function isLocalResource(value) {
  return !/^(?:[a-z]+:)?\/\//i.test(value) && !/^data:/i.test(value);
}

function normalizeForMatch(value) {
  return decodeURIComponent(stripQueryAndHash(value)).toLowerCase();
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

  const withScripts = content.replace(SCRIPT_TAG_RE, (fullTag, quote, src) => {
    const rule = detectRule("script", src);
    if (!rule) {
      return fullTag;
    }

    const version = detectVersion(src);
    const cdnUrl = buildCdnUrl(rule, version);
    const replacement = `<script src="${cdnUrl}"></script>`;

    if (normalizeForMatch(src) === normalizeForMatch(cdnUrl)) {
      return fullTag;
    }

    if (isLocalResource(src)) {
      const resolved = resolveLocalPath(src, htmlDir, workspaceFolders);
      if (resolved && isInsideWorkspace(resolved, workspaceFolders)) {
        localFiles.add(resolved);
      }
    }

    report.replacedLibraries.push({ name: rule.name, from: src, to: cdnUrl });
    return replacement;
  });

  const withLinks = withScripts.replace(LINK_TAG_RE, (fullTag, quote, href) => {
    const rule = detectRule("style", href);
    if (!rule) {
      return fullTag;
    }

    const version = detectVersion(href);
    const cdnUrl = buildCdnUrl(rule, version);
    const replacement = `<link rel="stylesheet" href="${cdnUrl}">`;

    if (normalizeForMatch(href) === normalizeForMatch(cdnUrl)) {
      return fullTag;
    }

    if (isLocalResource(href)) {
      const resolved = resolveLocalPath(href, htmlDir, workspaceFolders);
      if (resolved && isInsideWorkspace(resolved, workspaceFolders)) {
        localFiles.add(resolved);
      }
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
  if (
    content.includes("const domonetkaRaw = '{domonetka}';") ||
    content.includes("indexPxl.js")
  ) {
    return content;
  }

  if (/<\/title>/i.test(content)) {
    report.addedDomonetkaBlock = true;
    return content.replace(/<\/title>/i, (match) => `${match}\n${DOMONETKA_SNIPPET}`);
  }

  report.warnings.push("`</title>` не найден, блок domonetka не вставлен.");
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

async function processIndexHtml() {
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  if (!workspaceFolders.length) {
    vscode.window.showErrorMessage("KLM inc: откройте папку проекта в VS Code.");
    return;
  }

  const document = await getIndexHtmlDocument();
  if (!document) {
    vscode.window.showErrorMessage("KLM inc: файл index.html не найден.");
    return;
  }

  const report = {
    addedPhpBlock: false,
    addedDomonetkaBlock: false,
    replacedLibraries: [],
    deletedLocalFiles: [],
    warnings: []
  };

  const original = document.getText();
  const htmlDir = path.dirname(document.uri.fsPath);

  let next = ensurePhpSnippet(original, report);
  next = ensureDomonetkaSnippet(next, report);
  const replacements = replaceScriptAndLinks(next, htmlDir, workspaceFolders, report);
  next = replacements.content;

  if (next !== original) {
    await applyFullDocumentEdit(document, next);
  }

  await deleteLocalLibraries(replacements.localFiles, workspaceFolders, report);

  const changed =
    report.addedPhpBlock || report.addedDomonetkaBlock || report.replacedLibraries.length > 0;
  if (!changed) {
    vscode.window.showInformationMessage("KLM inc: изменений не требуется, файл уже нормализован.");
    return;
  }

  const summary = [
    report.addedPhpBlock ? "PHP-блок добавлен" : "PHP-блок уже был",
    report.addedDomonetkaBlock ? "domonetka-блок добавлен" : "domonetka-блок уже был/пропущен",
    `библиотек заменено: ${report.replacedLibraries.length}`,
    `локальных файлов удалено: ${report.deletedLocalFiles.length}`
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
      await processIndexHtml();
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      vscode.window.showErrorMessage(`KLM inc: ошибка обработки index.html: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
