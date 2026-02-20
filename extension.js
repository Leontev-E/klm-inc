const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");
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
    name: "jQuery Masked Input",
    type: "script",
    slug: "jquery.maskedinput",
    defaultVersion: "1.4.1",
    file: "jquery.maskedinput.min.js",
    patterns: [/jquery\.maskedinput(?:\.min)?\.js|maskedinput(?:\.min)?\.js/i]
  },
  {
    name: "jQuery blockUI",
    type: "script",
    slug: "jquery.blockUI",
    defaultVersion: "2.70",
    file: "jquery.blockUI.min.js",
    patterns: [/jquery\.blockui(?:\.min)?\.js|blockui(?:\.min)?\.js/i]
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

const EXTRA_LIBRARY_RULES = [
  {
    name: "jQuery UI JS",
    type: "script",
    slug: "jqueryui",
    defaultVersion: "1.13.3",
    file: "jquery-ui.min.js",
    patterns: [new RegExp("jquery\\.?ui(?:\\.min)?\\.js|jquery-ui(?:\\.min)?\\.js", "i")]
  },
  {
    name: "jQuery UI CSS",
    type: "style",
    slug: "jqueryui",
    defaultVersion: "1.13.3",
    file: "jquery-ui.min.css",
    patterns: [new RegExp("jquery\\.?ui(?:\\.min)?\\.css|jquery-ui(?:\\.min)?\\.css", "i")]
  },
  {
    name: "jQuery Migrate",
    type: "script",
    slug: "jquery-migrate",
    defaultVersion: "3.5.2",
    file: "jquery-migrate.min.js",
    patterns: [new RegExp("jquery\\-migrate(?:\\.min)?\\.js", "i")]
  },
  {
    name: "jQuery Cookie",
    type: "script",
    slug: "jquery-cookie",
    defaultVersion: "1.4.1",
    file: "jquery.cookie.min.js",
    patterns: [new RegExp("jquery\\.cookie(?:\\.min)?\\.js", "i")]
  },
  {
    name: "jQuery Form",
    type: "script",
    slug: "jquery.form",
    defaultVersion: "4.3.0",
    file: "jquery.form.min.js",
    patterns: [new RegExp("jquery\\.form(?:\\.min)?\\.js", "i")]
  },
  {
    name: "jQuery Validation",
    type: "script",
    slug: "jquery-validate",
    defaultVersion: "1.20.0",
    file: "jquery.validate.min.js",
    patterns: [new RegExp("jquery\\.validate(?:\\.min)?\\.js|jquery\\-validate(?:\\.min)?\\.js", "i")]
  },
  {
    name: "jQuery Validation Unobtrusive",
    type: "script",
    slug: "jquery-validation-unobtrusive",
    defaultVersion: "4.0.0",
    file: "jquery.validate.unobtrusive.min.js",
    patterns: [new RegExp("validate\\.unobtrusive(?:\\.min)?\\.js|jquery-validation-unobtrusive", "i")]
  },
  {
    name: "jQuery Lazy",
    type: "script",
    slug: "jquery.lazy",
    defaultVersion: "1.7.11",
    file: "jquery.lazy.min.js",
    patterns: [new RegExp("jquery\\.lazy(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Bootstrap Select JS",
    type: "script",
    slug: "bootstrap-select",
    defaultVersion: "1.13.18",
    file: "js/bootstrap-select.min.js",
    patterns: [new RegExp("bootstrap\\-select(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Bootstrap Select CSS",
    type: "style",
    slug: "bootstrap-select",
    defaultVersion: "1.13.18",
    file: "css/bootstrap-select.min.css",
    patterns: [new RegExp("bootstrap\\-select(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Bootstrap Table JS",
    type: "script",
    slug: "bootstrap-table",
    defaultVersion: "1.22.4",
    file: "bootstrap-table.min.js",
    patterns: [new RegExp("bootstrap\\-table(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Bootstrap Table CSS",
    type: "style",
    slug: "bootstrap-table",
    defaultVersion: "1.22.4",
    file: "bootstrap-table.min.css",
    patterns: [new RegExp("bootstrap\\-table(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Date Range Picker JS",
    type: "script",
    slug: "bootstrap-daterangepicker",
    defaultVersion: "3.1",
    file: "daterangepicker.min.js",
    patterns: [new RegExp("daterangepicker(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Date Range Picker CSS",
    type: "style",
    slug: "bootstrap-daterangepicker",
    defaultVersion: "3.1",
    file: "daterangepicker.min.css",
    patterns: [new RegExp("daterangepicker(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Bootstrap Datepicker JS",
    type: "script",
    slug: "bootstrap-datepicker",
    defaultVersion: "1.10.0",
    file: "js/bootstrap-datepicker.min.js",
    patterns: [new RegExp("bootstrap\\-datepicker(?:\\.min)?\\.js|datepicker(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Bootstrap Datepicker CSS",
    type: "style",
    slug: "bootstrap-datepicker",
    defaultVersion: "1.10.0",
    file: "css/bootstrap-datepicker.min.css",
    patterns: [new RegExp("bootstrap\\-datepicker(?:\\.min)?\\.css|datepicker(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Tempus Dominus JS",
    type: "script",
    slug: "tempusdominus-bootstrap-4",
    defaultVersion: "5.39.2",
    file: "js/tempusdominus-bootstrap-4.min.js",
    patterns: [new RegExp("tempusdominus(?:\\-bootstrap\\-4)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Tempus Dominus CSS",
    type: "style",
    slug: "tempusdominus-bootstrap-4",
    defaultVersion: "5.39.2",
    file: "css/tempusdominus-bootstrap-4.min.css",
    patterns: [new RegExp("tempusdominus(?:\\-bootstrap\\-4)?(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Foundation JS",
    type: "script",
    slug: "foundation",
    defaultVersion: "6.8.1",
    file: "js/foundation.min.js",
    patterns: [new RegExp("foundation(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Foundation CSS",
    type: "style",
    slug: "foundation",
    defaultVersion: "6.8.1",
    file: "css/foundation.min.css",
    patterns: [new RegExp("foundation(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Bulma CSS",
    type: "style",
    slug: "bulma",
    defaultVersion: "1.0.0",
    file: "css/bulma.min.css",
    patterns: [new RegExp("bulma(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Semantic UI JS",
    type: "script",
    slug: "semantic-ui",
    defaultVersion: "2.5.0",
    file: "semantic.min.js",
    patterns: [new RegExp("semantic(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Semantic UI CSS",
    type: "style",
    slug: "semantic-ui",
    defaultVersion: "2.5.0",
    file: "semantic.min.css",
    patterns: [new RegExp("semantic(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Materialize JS",
    type: "script",
    slug: "materialize",
    defaultVersion: "1.0.0",
    file: "js/materialize.min.js",
    patterns: [new RegExp("materialize(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Materialize CSS",
    type: "style",
    slug: "materialize",
    defaultVersion: "1.0.0",
    file: "css/materialize.min.css",
    patterns: [new RegExp("materialize(?:\\.min)?\\.css", "i")]
  },
  {
    name: "UIKit JS",
    type: "script",
    slug: "uikit",
    defaultVersion: "3.19.0",
    file: "js/uikit.min.js",
    patterns: [new RegExp("uikit(?:\\.min)?\\.js", "i")]
  },
  {
    name: "UIKit CSS",
    type: "style",
    slug: "uikit",
    defaultVersion: "3.19.0",
    file: "css/uikit.min.css",
    patterns: [new RegExp("uikit(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Tailwind CSS",
    type: "style",
    slug: "tailwindcss",
    defaultVersion: "2.2.19",
    file: "tailwind.min.css",
    patterns: [new RegExp("tailwind(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Pure CSS",
    type: "style",
    slug: "pure",
    defaultVersion: "3.0.0",
    file: "pure-min.css",
    patterns: [new RegExp("pure(?:\\-min)?\\.css", "i")]
  },
  {
    name: "Spectre CSS",
    type: "style",
    slug: "spectre.css",
    defaultVersion: "0.5.9",
    file: "spectre.min.css",
    patterns: [new RegExp("spectre(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Milligram CSS",
    type: "style",
    slug: "milligram",
    defaultVersion: "1.4.1",
    file: "milligram.min.css",
    patterns: [new RegExp("milligram(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Primer CSS",
    type: "style",
    slug: "primer",
    defaultVersion: "21.0.7",
    file: "primer.min.css",
    patterns: [new RegExp("primer(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Tachyons CSS",
    type: "style",
    slug: "tachyons",
    defaultVersion: "4.12.0",
    file: "tachyons.min.css",
    patterns: [new RegExp("tachyons(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Material Design Icons CSS",
    type: "style",
    slug: "material-design-icons",
    defaultVersion: "4.0.0",
    file: "iconfont/material-icons.css",
    patterns: [new RegExp("material\\-icons\\.css|material\\-design\\-icons", "i")]
  },
  {
    name: "Flag Icon CSS",
    type: "style",
    slug: "flag-icon-css",
    defaultVersion: "4.1.7",
    file: "css/flag-icons.min.css",
    patterns: [new RegExp("flag\\-icon(?:s)?(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Hover.css",
    type: "style",
    slug: "hover.css",
    defaultVersion: "2.3.2",
    file: "css/hover-min.css",
    patterns: [new RegExp("hover(?:\\-min)?\\.css", "i")]
  },
  {
    name: "Splide JS",
    type: "script",
    slug: "Splide",
    defaultVersion: "4.1.4",
    file: "js/splide.min.js",
    patterns: [new RegExp("splide(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Splide CSS",
    type: "style",
    slug: "Splide",
    defaultVersion: "4.1.4",
    file: "css/splide.min.css",
    patterns: [new RegExp("splide(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Tiny Slider JS",
    type: "script",
    slug: "tiny-slider",
    defaultVersion: "2.9.4",
    file: "min/tiny-slider.js",
    patterns: [new RegExp("tiny\\-slider(?:\\.min)?\\.js|tns\\.js", "i")]
  },
  {
    name: "Tiny Slider CSS",
    type: "style",
    slug: "tiny-slider",
    defaultVersion: "2.9.4",
    file: "tiny-slider.css",
    patterns: [new RegExp("tiny\\-slider(?:\\.min)?\\.css|tiny\\-slider\\.css", "i")]
  },
  {
    name: "Flickity JS",
    type: "script",
    slug: "flickity",
    defaultVersion: "2.3.0",
    file: "flickity.pkgd.min.js",
    patterns: [new RegExp("flickity(?:\\.pkgd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Flickity CSS",
    type: "style",
    slug: "flickity",
    defaultVersion: "2.3.0",
    file: "flickity.min.css",
    patterns: [new RegExp("flickity(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Glide.js JS",
    type: "script",
    slug: "Glide.js",
    defaultVersion: "3.6.0",
    file: "glide.min.js",
    patterns: [new RegExp("glide(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Glide.js CSS",
    type: "style",
    slug: "Glide.js",
    defaultVersion: "3.6.0",
    file: "css/glide.core.min.css",
    patterns: [new RegExp("glide(?:\\.core)?(?:\\.min)?\\.css", "i")]
  },
  {
    name: "bxSlider JS",
    type: "script",
    slug: "bxslider",
    defaultVersion: "4.2.17",
    file: "jquery.bxslider.min.js",
    patterns: [new RegExp("bxslider|jquery\\.bxslider(?:\\.min)?\\.js", "i")]
  },
  {
    name: "bxSlider CSS",
    type: "style",
    slug: "bxslider",
    defaultVersion: "4.2.17",
    file: "jquery.bxslider.min.css",
    patterns: [new RegExp("bxslider|jquery\\.bxslider(?:\\.min)?\\.css", "i")]
  },
  {
    name: "lightGallery JS",
    type: "script",
    slug: "lightgallery-js",
    defaultVersion: "1.4.0",
    file: "js/lightgallery.min.js",
    patterns: [new RegExp("lightgallery(?:\\.min)?\\.js", "i")]
  },
  {
    name: "lightGallery CSS",
    type: "style",
    slug: "lightgallery-js",
    defaultVersion: "1.4.0",
    file: "css/lightgallery.min.css",
    patterns: [new RegExp("lightgallery(?:\\.min)?\\.css", "i")]
  },
  {
    name: "GLightbox JS",
    type: "script",
    slug: "glightbox",
    defaultVersion: "3.3.0",
    file: "js/glightbox.min.js",
    patterns: [new RegExp("glightbox(?:\\.min)?\\.js", "i")]
  },
  {
    name: "GLightbox CSS",
    type: "style",
    slug: "glightbox",
    defaultVersion: "3.3.0",
    file: "css/glightbox.min.css",
    patterns: [new RegExp("glightbox(?:\\.min)?\\.css", "i")]
  },
  {
    name: "PhotoSwipe JS",
    type: "script",
    slug: "photoswipe",
    defaultVersion: "5.4.4",
    file: "photoswipe.umd.min.js",
    patterns: [new RegExp("photoswipe(?:\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "PhotoSwipe CSS",
    type: "style",
    slug: "photoswipe",
    defaultVersion: "5.4.4",
    file: "photoswipe.min.css",
    patterns: [new RegExp("photoswipe(?:\\.min)?\\.css", "i")]
  },
  {
    name: "baguetteBox.js",
    type: "script",
    slug: "baguettebox.js",
    defaultVersion: "1.12.0",
    file: "baguetteBox.min.js",
    patterns: [new RegExp("baguettebox(?:\\.min)?\\.js", "i")]
  },
  {
    name: "baguetteBox.css",
    type: "style",
    slug: "baguettebox.js",
    defaultVersion: "1.12.0",
    file: "baguetteBox.min.css",
    patterns: [new RegExp("baguettebox(?:\\.min)?\\.css", "i")]
  },
  {
    name: "VenoBox JS",
    type: "script",
    slug: "venobox",
    defaultVersion: "2.1.8",
    file: "venobox/venobox.min.js",
    patterns: [new RegExp("venobox(?:\\.min)?\\.js", "i")]
  },
  {
    name: "VenoBox CSS",
    type: "style",
    slug: "venobox",
    defaultVersion: "2.1.8",
    file: "venobox/venobox.min.css",
    patterns: [new RegExp("venobox(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Remodal JS",
    type: "script",
    slug: "remodal",
    defaultVersion: "1.1.1",
    file: "remodal.min.js",
    patterns: [new RegExp("remodal(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Remodal CSS",
    type: "style",
    slug: "remodal",
    defaultVersion: "1.1.1",
    file: "remodal.min.css",
    patterns: [new RegExp("remodal(?:\\.min)?\\.css", "i")]
  },
  {
    name: "MicroModal",
    type: "script",
    slug: "micromodal",
    defaultVersion: "0.4.10",
    file: "micromodal.min.js",
    patterns: [new RegExp("micromodal(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Tippy.js JS",
    type: "script",
    slug: "tippy.js",
    defaultVersion: "6.3.7",
    file: "tippy-bundle.umd.min.js",
    patterns: [new RegExp("tippy(?:\\-bundle\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Tippy.js CSS",
    type: "style",
    slug: "tippy.js",
    defaultVersion: "6.3.7",
    file: "tippy.min.css",
    patterns: [new RegExp("tippy(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Intro.js JS",
    type: "script",
    slug: "intro.js",
    defaultVersion: "7.2.0",
    file: "intro.min.js",
    patterns: [new RegExp("intro(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Intro.js CSS",
    type: "style",
    slug: "intro.js",
    defaultVersion: "7.2.0",
    file: "introjs.min.css",
    patterns: [new RegExp("introjs(?:\\.min)?\\.css|intro(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Shepherd.js JS",
    type: "script",
    slug: "shepherd",
    defaultVersion: "11.2.0",
    file: "js/shepherd.min.js",
    patterns: [new RegExp("shepherd(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Shepherd.js CSS",
    type: "style",
    slug: "shepherd",
    defaultVersion: "11.2.0",
    file: "css/shepherd.css",
    patterns: [new RegExp("shepherd(?:\\.min)?\\.css|shepherd\\.css", "i")]
  },
  {
    name: "Driver.js JS",
    type: "script",
    slug: "driver.js",
    defaultVersion: "1.3.5",
    file: "driver.min.js",
    patterns: [new RegExp("driver(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Driver.js CSS",
    type: "style",
    slug: "driver.js",
    defaultVersion: "1.3.5",
    file: "driver.min.css",
    patterns: [new RegExp("driver(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Chartist JS",
    type: "script",
    slug: "chartist",
    defaultVersion: "0.11.4",
    file: "chartist.min.js",
    patterns: [new RegExp("chartist(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Chartist CSS",
    type: "style",
    slug: "chartist",
    defaultVersion: "0.11.4",
    file: "chartist.min.css",
    patterns: [new RegExp("chartist(?:\\.min)?\\.css", "i")]
  },
  {
    name: "C3 JS",
    type: "script",
    slug: "c3",
    defaultVersion: "0.7.20",
    file: "c3.min.js",
    patterns: [new RegExp("c3(?:\\.min)?\\.js", "i")]
  },
  {
    name: "C3 CSS",
    type: "style",
    slug: "c3",
    defaultVersion: "0.7.20",
    file: "c3.min.css",
    patterns: [new RegExp("c3(?:\\.min)?\\.css", "i")]
  },
  {
    name: "billboard.js JS",
    type: "script",
    slug: "billboard.js",
    defaultVersion: "3.12.1",
    file: "billboard.min.js",
    patterns: [new RegExp("billboard(?:\\.min)?\\.js", "i")]
  },
  {
    name: "billboard.js CSS",
    type: "style",
    slug: "billboard.js",
    defaultVersion: "3.12.1",
    file: "billboard.min.css",
    patterns: [new RegExp("billboard(?:\\.min)?\\.css", "i")]
  },
  {
    name: "ApexCharts",
    type: "script",
    slug: "apexcharts",
    defaultVersion: "3.49.1",
    file: "apexcharts.min.js",
    patterns: [new RegExp("apexcharts(?:\\.min)?\\.js", "i")]
  },
  {
    name: "ECharts",
    type: "script",
    slug: "echarts",
    defaultVersion: "5.5.1",
    file: "echarts.min.js",
    patterns: [new RegExp("echarts(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Highcharts",
    type: "script",
    slug: "highcharts",
    defaultVersion: "11.4.1",
    file: "highcharts.min.js",
    patterns: [new RegExp("highcharts(?:\\.min)?\\.js", "i")]
  },
  {
    name: "amCharts 4",
    type: "script",
    slug: "amcharts4",
    defaultVersion: "4.10.38",
    file: "core.js",
    patterns: [new RegExp("amcharts4|amcharts(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Plotly",
    type: "script",
    slug: "plotly.js",
    defaultVersion: "2.32.0",
    file: "plotly.min.js",
    patterns: [new RegExp("plotly(?:\\.min)?\\.js", "i")]
  },
  {
    name: "vis-network",
    type: "script",
    slug: "vis-network",
    defaultVersion: "9.1.9",
    file: "vis-network.min.js",
    patterns: [new RegExp("vis\\-network(?:\\.min)?\\.js|vis-network", "i")]
  },
  {
    name: "Cytoscape",
    type: "script",
    slug: "cytoscape",
    defaultVersion: "3.29.2",
    file: "cytoscape.min.js",
    patterns: [new RegExp("cytoscape(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Sigma.js",
    type: "script",
    slug: "sigma.js",
    defaultVersion: "2.4.0",
    file: "sigma.min.js",
    patterns: [new RegExp("sigma(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Mermaid",
    type: "script",
    slug: "mermaid",
    defaultVersion: "10.9.1",
    file: "mermaid.min.js",
    patterns: [new RegExp("mermaid(?:\\.min)?\\.js", "i")]
  },
  {
    name: "FullCalendar JS",
    type: "script",
    slug: "fullcalendar",
    defaultVersion: "6.1.11",
    file: "index.global.min.js",
    patterns: [new RegExp("fullcalendar|index\\.global\\.min\\.js", "i")]
  },
  {
    name: "FullCalendar CSS",
    type: "style",
    slug: "fullcalendar",
    defaultVersion: "6.1.11",
    file: "main.min.css",
    patterns: [new RegExp("fullcalendar|main(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Flatpickr JS",
    type: "script",
    slug: "flatpickr",
    defaultVersion: "4.6.13",
    file: "flatpickr.min.js",
    patterns: [new RegExp("flatpickr(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Flatpickr CSS",
    type: "style",
    slug: "flatpickr",
    defaultVersion: "4.6.13",
    file: "flatpickr.min.css",
    patterns: [new RegExp("flatpickr(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Pikaday JS",
    type: "script",
    slug: "pikaday",
    defaultVersion: "1.8.2",
    file: "pikaday.min.js",
    patterns: [new RegExp("pikaday(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Pikaday CSS",
    type: "style",
    slug: "pikaday",
    defaultVersion: "1.8.2",
    file: "css/pikaday.min.css",
    patterns: [new RegExp("pikaday(?:\\.min)?\\.css", "i")]
  },
  {
    name: "IMask",
    type: "script",
    slug: "imask",
    defaultVersion: "7.6.0",
    file: "imask.min.js",
    patterns: [new RegExp("imask(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Vanilla Masker",
    type: "script",
    slug: "vanilla-masker",
    defaultVersion: "1.2.0",
    file: "vanilla-masker.min.js",
    patterns: [new RegExp("vanilla\\-masker(?:\\.min)?\\.js", "i")]
  },
  {
    name: "noUiSlider JS",
    type: "script",
    slug: "nouislider",
    defaultVersion: "15.7.1",
    file: "nouislider.min.js",
    patterns: [new RegExp("nouislider(?:\\.min)?\\.js", "i")]
  },
  {
    name: "noUiSlider CSS",
    type: "style",
    slug: "nouislider",
    defaultVersion: "15.7.1",
    file: "nouislider.min.css",
    patterns: [new RegExp("nouislider(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Ion.RangeSlider JS",
    type: "script",
    slug: "ion-rangeslider",
    defaultVersion: "2.3.1",
    file: "js/ion.rangeSlider.min.js",
    patterns: [new RegExp("ion\\.rangeSlider(?:\\.min)?\\.js|ion-rangeslider", "i")]
  },
  {
    name: "Ion.RangeSlider CSS",
    type: "style",
    slug: "ion-rangeslider",
    defaultVersion: "2.3.1",
    file: "css/ion.rangeSlider.min.css",
    patterns: [new RegExp("ion\\.rangeSlider(?:\\.min)?\\.css|ion-rangeslider", "i")]
  },
  {
    name: "Autosize",
    type: "script",
    slug: "autosize.js",
    defaultVersion: "6.0.1",
    file: "autosize.min.js",
    patterns: [new RegExp("autosize(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Clipboard.js",
    type: "script",
    slug: "clipboard.js",
    defaultVersion: "2.0.11",
    file: "clipboard.min.js",
    patterns: [new RegExp("clipboard(?:\\.min)?\\.js", "i")]
  },
  {
    name: "SortableJS",
    type: "script",
    slug: "Sortable",
    defaultVersion: "1.15.2",
    file: "Sortable.min.js",
    patterns: [new RegExp("sortable(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Dragula JS",
    type: "script",
    slug: "dragula",
    defaultVersion: "3.7.3",
    file: "dragula.min.js",
    patterns: [new RegExp("dragula(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Dragula CSS",
    type: "style",
    slug: "dragula",
    defaultVersion: "3.7.3",
    file: "dragula.min.css",
    patterns: [new RegExp("dragula(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Interact.js",
    type: "script",
    slug: "interact.js",
    defaultVersion: "1.10.27",
    file: "interact.min.js",
    patterns: [new RegExp("interact(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Hammer.js",
    type: "script",
    slug: "hammer.js",
    defaultVersion: "2.0.8",
    file: "hammer.min.js",
    patterns: [new RegExp("hammer(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Mousetrap",
    type: "script",
    slug: "mousetrap",
    defaultVersion: "1.6.5",
    file: "mousetrap.min.js",
    patterns: [new RegExp("mousetrap(?:\\.min)?\\.js", "i")]
  },
  {
    name: "KeyboardJS",
    type: "script",
    slug: "keyboardjs",
    defaultVersion: "2.7.0",
    file: "keyboard.min.js",
    patterns: [new RegExp("keyboard(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Waypoints",
    type: "script",
    slug: "waypoints",
    defaultVersion: "4.0.1",
    file: "jquery.waypoints.min.js",
    patterns: [new RegExp("waypoints|jquery\\.waypoints(?:\\.min)?\\.js", "i")]
  },
  {
    name: "jQuery Easing",
    type: "script",
    slug: "jquery-easing",
    defaultVersion: "1.4.1",
    file: "jquery.easing.min.js",
    patterns: [new RegExp("jquery\\.easing(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Velocity.js",
    type: "script",
    slug: "velocity",
    defaultVersion: "2.0.6",
    file: "velocity.min.js",
    patterns: [new RegExp("velocity(?:\\.min)?\\.js", "i")]
  },
  {
    name: "ScrollReveal",
    type: "script",
    slug: "scrollReveal.js",
    defaultVersion: "4.0.9",
    file: "scrollreveal.min.js",
    patterns: [new RegExp("scrollreveal(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Typed.js",
    type: "script",
    slug: "typed.js",
    defaultVersion: "2.1.0",
    file: "typed.umd.js",
    patterns: [new RegExp("typed(?:\\.umd)?(?:\\.min)?\\.js|typed\\.js", "i")]
  },
  {
    name: "CountUp.js",
    type: "script",
    slug: "countup.js",
    defaultVersion: "2.8.0",
    file: "countUp.umd.js",
    patterns: [new RegExp("countup|countUp(?:\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Odometer JS",
    type: "script",
    slug: "odometer.js",
    defaultVersion: "0.4.8",
    file: "odometer.min.js",
    patterns: [new RegExp("odometer(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Odometer CSS",
    type: "style",
    slug: "odometer.js",
    defaultVersion: "0.4.8",
    file: "themes/odometer-theme-default.min.css",
    patterns: [new RegExp("odometer(?:\\.min)?\\.css|odometer\\-theme", "i")]
  },
  {
    name: "Pace JS",
    type: "script",
    slug: "pace",
    defaultVersion: "1.2.4",
    file: "pace.min.js",
    patterns: [new RegExp("pace(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Pace CSS",
    type: "style",
    slug: "pace",
    defaultVersion: "1.2.4",
    file: "themes/blue/pace-theme-minimal.min.css",
    patterns: [new RegExp("pace\\-theme|pace(?:\\.min)?\\.css", "i")]
  },
  {
    name: "NProgress JS",
    type: "script",
    slug: "nprogress",
    defaultVersion: "0.2.0",
    file: "nprogress.min.js",
    patterns: [new RegExp("nprogress(?:\\.min)?\\.js", "i")]
  },
  {
    name: "NProgress CSS",
    type: "style",
    slug: "nprogress",
    defaultVersion: "0.2.0",
    file: "nprogress.min.css",
    patterns: [new RegExp("nprogress(?:\\.min)?\\.css", "i")]
  },
  {
    name: "ProgressBar.js",
    type: "script",
    slug: "progressbar.js",
    defaultVersion: "1.1.1",
    file: "progressbar.min.js",
    patterns: [new RegExp("progressbar(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Lottie Web",
    type: "script",
    slug: "lottie-web",
    defaultVersion: "5.12.2",
    file: "lottie.min.js",
    patterns: [new RegExp("lottie(?:\\.min)?\\.js|lottie-web", "i")]
  },
  {
    name: "Three.js",
    type: "script",
    slug: "three.js",
    defaultVersion: "0.165.0",
    file: "three.min.js",
    patterns: [new RegExp("three(?:\\.min)?\\.js", "i")]
  },
  {
    name: "PixiJS",
    type: "script",
    slug: "pixi.js",
    defaultVersion: "8.1.5",
    file: "pixi.min.js",
    patterns: [new RegExp("pixi(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Babylon.js",
    type: "script",
    slug: "babylonjs",
    defaultVersion: "7.4.0",
    file: "babylon.js",
    patterns: [new RegExp("babylon(?:\\.min)?\\.js|babylonjs", "i")]
  },
  {
    name: "Fabric.js",
    type: "script",
    slug: "fabric.js",
    defaultVersion: "5.3.0",
    file: "fabric.min.js",
    patterns: [new RegExp("fabric(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Konva",
    type: "script",
    slug: "konva",
    defaultVersion: "9.3.12",
    file: "konva.min.js",
    patterns: [new RegExp("konva(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Two.js",
    type: "script",
    slug: "two.js",
    defaultVersion: "0.8.16",
    file: "two.min.js",
    patterns: [new RegExp("two(?:\\.min)?\\.js", "i")]
  },
  {
    name: "particles.js",
    type: "script",
    slug: "particles.js",
    defaultVersion: "2.0.0",
    file: "particles.min.js",
    patterns: [new RegExp("particles(?:\\.min)?\\.js", "i")]
  },
  {
    name: "tsParticles",
    type: "script",
    slug: "tsparticles",
    defaultVersion: "3.4.0",
    file: "tsparticles.bundle.min.js",
    patterns: [new RegExp("tsparticles|ts\\-particles(?:\\.min)?\\.js", "i")]
  },
  {
    name: "PDF.js",
    type: "script",
    slug: "pdf.js",
    defaultVersion: "4.4.168",
    file: "pdf.min.mjs",
    patterns: [new RegExp("pdf(?:\\.min)?\\.(?:js|mjs)|pdfjs", "i")]
  },
  {
    name: "jsPDF",
    type: "script",
    slug: "jspdf",
    defaultVersion: "2.5.1",
    file: "jspdf.umd.min.js",
    patterns: [new RegExp("jspdf(?:\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "pdf-lib",
    type: "script",
    slug: "pdf-lib",
    defaultVersion: "1.17.1",
    file: "pdf-lib.min.js",
    patterns: [new RegExp("pdf\\-lib(?:\\.min)?\\.js", "i")]
  },
  {
    name: "html2canvas",
    type: "script",
    slug: "html2canvas",
    defaultVersion: "1.4.1",
    file: "html2canvas.min.js",
    patterns: [new RegExp("html2canvas(?:\\.min)?\\.js", "i")]
  },
  {
    name: "DOMPurify",
    type: "script",
    slug: "dompurify",
    defaultVersion: "3.1.5",
    file: "purify.min.js",
    patterns: [new RegExp("dompurify|purify(?:\\.min)?\\.js", "i")]
  },
  {
    name: "sanitize-html",
    type: "script",
    slug: "sanitize-html",
    defaultVersion: "2.13.0",
    file: "sanitize-html.min.js",
    patterns: [new RegExp("sanitize\\-html(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Marked",
    type: "script",
    slug: "marked",
    defaultVersion: "12.0.2",
    file: "marked.min.js",
    patterns: [new RegExp("marked(?:\\.min)?\\.js", "i")]
  },
  {
    name: "markdown-it",
    type: "script",
    slug: "markdown-it",
    defaultVersion: "14.1.0",
    file: "markdown-it.min.js",
    patterns: [new RegExp("markdown\\-it(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Showdown",
    type: "script",
    slug: "showdown",
    defaultVersion: "2.1.0",
    file: "showdown.min.js",
    patterns: [new RegExp("showdown(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Mustache",
    type: "script",
    slug: "mustache.js",
    defaultVersion: "4.2.0",
    file: "mustache.min.js",
    patterns: [new RegExp("mustache(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Handlebars",
    type: "script",
    slug: "handlebars.js",
    defaultVersion: "4.7.8",
    file: "handlebars.min.js",
    patterns: [new RegExp("handlebars(?:\\.min)?\\.js", "i")]
  },
  {
    name: "EJS",
    type: "script",
    slug: "ejs",
    defaultVersion: "3.1.10",
    file: "ejs.min.js",
    patterns: [new RegExp("ejs(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Nunjucks",
    type: "script",
    slug: "nunjucks",
    defaultVersion: "3.2.4",
    file: "nunjucks.min.js",
    patterns: [new RegExp("nunjucks(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Ky",
    type: "script",
    slug: "ky",
    defaultVersion: "1.4.0",
    file: "index.min.js",
    patterns: [new RegExp("(?:^|/)ky(?:\\.min)?\\.js$", "i")]
  },
  {
    name: "SuperAgent",
    type: "script",
    slug: "superagent",
    defaultVersion: "8.1.2",
    file: "superagent.min.js",
    patterns: [new RegExp("superagent(?:\\.min)?\\.js", "i")]
  },
  {
    name: "RxJS",
    type: "script",
    slug: "rxjs",
    defaultVersion: "7.8.1",
    file: "rxjs.umd.min.js",
    patterns: [new RegExp("rxjs(?:\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Zone.js",
    type: "script",
    slug: "zone.js",
    defaultVersion: "0.14.7",
    file: "zone.min.js",
    patterns: [new RegExp("zone(?:\\.min)?\\.js", "i")]
  },
  {
    name: "core-js",
    type: "script",
    slug: "core-js",
    defaultVersion: "3.37.1",
    file: "minified.js",
    patterns: [new RegExp("core\\-js|minified\\.js", "i")]
  },
  {
    name: "Bluebird",
    type: "script",
    slug: "bluebird",
    defaultVersion: "3.7.2",
    file: "bluebird.min.js",
    patterns: [new RegExp("bluebird(?:\\.min)?\\.js", "i")]
  },
  {
    name: "qs",
    type: "script",
    slug: "qs",
    defaultVersion: "6.12.1",
    file: "qs.min.js",
    patterns: [new RegExp("(?:^|/)qs(?:\\.min)?\\.js$", "i")]
  },
  {
    name: "uuid",
    type: "script",
    slug: "uuid",
    defaultVersion: "9.0.1",
    file: "uuidv4.min.js",
    patterns: [new RegExp("uuid(?:v4)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "localForage",
    type: "script",
    slug: "localforage",
    defaultVersion: "1.10.0",
    file: "localforage.min.js",
    patterns: [new RegExp("localforage(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Dexie",
    type: "script",
    slug: "dexie",
    defaultVersion: "4.0.8",
    file: "dexie.min.js",
    patterns: [new RegExp("dexie(?:\\.min)?\\.js", "i")]
  },
  {
    name: "idb",
    type: "script",
    slug: "idb",
    defaultVersion: "8.0.0",
    file: "idb-minified.js",
    patterns: [new RegExp("idb(?:\\-minified)?\\.js", "i")]
  },
  {
    name: "Pako",
    type: "script",
    slug: "pako",
    defaultVersion: "2.1.0",
    file: "pako.min.js",
    patterns: [new RegExp("pako(?:\\.min)?\\.js", "i")]
  },
  {
    name: "JSZip",
    type: "script",
    slug: "jszip",
    defaultVersion: "3.10.1",
    file: "jszip.min.js",
    patterns: [new RegExp("jszip(?:\\.min)?\\.js", "i")]
  },
  {
    name: "CryptoJS",
    type: "script",
    slug: "crypto-js",
    defaultVersion: "4.2.0",
    file: "crypto-js.min.js",
    patterns: [new RegExp("crypto(?:\\-js)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Luxon",
    type: "script",
    slug: "luxon",
    defaultVersion: "3.5.0",
    file: "luxon.min.js",
    patterns: [new RegExp("luxon(?:\\.min)?\\.js", "i")]
  },
  {
    name: "date-fns",
    type: "script",
    slug: "date-fns",
    defaultVersion: "3.6.0",
    file: "cdn.min.js",
    patterns: [new RegExp("date\\-fns|cdn\\.min\\.js", "i")]
  },
  {
    name: "Moment Timezone",
    type: "script",
    slug: "moment-timezone",
    defaultVersion: "0.5.45",
    file: "moment-timezone-with-data-10-year-range.min.js",
    patterns: [new RegExp("moment\\-timezone(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Numeral.js",
    type: "script",
    slug: "numeral.js",
    defaultVersion: "2.0.6",
    file: "numeral.min.js",
    patterns: [new RegExp("numeral(?:\\.min)?\\.js", "i")]
  },
  {
    name: "accounting.js",
    type: "script",
    slug: "accounting.js",
    defaultVersion: "0.4.2",
    file: "accounting.min.js",
    patterns: [new RegExp("accounting(?:\\.min)?\\.js", "i")]
  },
  {
    name: "decimal.js",
    type: "script",
    slug: "decimal.js",
    defaultVersion: "10.4.3",
    file: "decimal.min.js",
    patterns: [new RegExp("decimal(?:\\.min)?\\.js", "i")]
  },
  {
    name: "big.js",
    type: "script",
    slug: "big.js",
    defaultVersion: "6.2.1",
    file: "big.min.js",
    patterns: [new RegExp("(?:^|/)big(?:\\.min)?\\.js$", "i")]
  },
  {
    name: "validator.js",
    type: "script",
    slug: "validator",
    defaultVersion: "13.12.0",
    file: "validator.min.js",
    patterns: [new RegExp("validator(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Yup",
    type: "script",
    slug: "yup",
    defaultVersion: "1.4.0",
    file: "yup.min.js",
    patterns: [new RegExp("(?:^|/)yup(?:\\.min)?\\.js$", "i")]
  },
  {
    name: "AJV",
    type: "script",
    slug: "ajv",
    defaultVersion: "8.17.1",
    file: "ajv7.min.js",
    patterns: [new RegExp("ajv(?:7)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "PapaParse",
    type: "script",
    slug: "PapaParse",
    defaultVersion: "5.4.1",
    file: "papaparse.min.js",
    patterns: [new RegExp("papaparse(?:\\.min)?\\.js", "i")]
  },
  {
    name: "SheetJS xlsx",
    type: "script",
    slug: "xlsx",
    defaultVersion: "0.18.5",
    file: "xlsx.full.min.js",
    patterns: [new RegExp("xlsx(?:\\.full)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "AlaSQL",
    type: "script",
    slug: "alasql",
    defaultVersion: "4.5.1",
    file: "alasql.min.js",
    patterns: [new RegExp("alasql(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Socket.IO",
    type: "script",
    slug: "socket.io",
    defaultVersion: "4.7.5",
    file: "socket.io.min.js",
    patterns: [new RegExp("socket\\.io(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Pusher",
    type: "script",
    slug: "pusher",
    defaultVersion: "8.4.0",
    file: "pusher.min.js",
    patterns: [new RegExp("pusher(?:\\.min)?\\.js", "i")]
  },
  {
    name: "SignalR",
    type: "script",
    slug: "microsoft-signalr",
    defaultVersion: "8.0.7",
    file: "signalr.min.js",
    patterns: [new RegExp("signalr(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Algolia Search",
    type: "script",
    slug: "algoliasearch",
    defaultVersion: "4.23.3",
    file: "algoliasearch-lite.umd.js",
    patterns: [new RegExp("algoliasearch(?:\\-lite\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "InstantSearch.js JS",
    type: "script",
    slug: "instantsearch.js",
    defaultVersion: "4.73.0",
    file: "instantsearch.production.min.js",
    patterns: [new RegExp("instantsearch(?:\\.production)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "InstantSearch.js CSS",
    type: "style",
    slug: "instantsearch.css",
    defaultVersion: "8.5.1",
    file: "themes/satellite-min.css",
    patterns: [new RegExp("instantsearch|satellite\\-min\\.css", "i")]
  },
  {
    name: "Firebase",
    type: "script",
    slug: "firebase",
    defaultVersion: "10.12.2",
    file: "firebase-app.js",
    patterns: [new RegExp("firebase(?:\\-app)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "AWS Amplify",
    type: "script",
    slug: "aws-amplify",
    defaultVersion: "6.3.1",
    file: "aws-amplify.min.js",
    patterns: [new RegExp("aws\\-amplify(?:\\.min)?\\.js", "i")]
  },
  {
    name: "OverlayScrollbars JS",
    type: "script",
    slug: "overlayscrollbars",
    defaultVersion: "2.8.0",
    file: "browser/overlayscrollbars.browser.es6.min.js",
    patterns: [new RegExp("overlayscrollbars(?:\\.browser)?(?:\\.es6)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "OverlayScrollbars CSS",
    type: "style",
    slug: "overlayscrollbars",
    defaultVersion: "2.8.0",
    file: "styles/overlayscrollbars.min.css",
    patterns: [new RegExp("overlayscrollbars(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Perfect Scrollbar JS",
    type: "script",
    slug: "perfect-scrollbar",
    defaultVersion: "1.5.5",
    file: "perfect-scrollbar.min.js",
    patterns: [new RegExp("perfect\\-scrollbar(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Perfect Scrollbar CSS",
    type: "style",
    slug: "perfect-scrollbar",
    defaultVersion: "1.5.5",
    file: "perfect-scrollbar.min.css",
    patterns: [new RegExp("perfect\\-scrollbar(?:\\.min)?\\.css", "i")]
  },
  {
    name: "SimpleBar JS",
    type: "script",
    slug: "simplebar",
    defaultVersion: "6.2.5",
    file: "simplebar.min.js",
    patterns: [new RegExp("simplebar(?:\\.min)?\\.js", "i")]
  },
  {
    name: "SimpleBar CSS",
    type: "style",
    slug: "simplebar",
    defaultVersion: "6.2.5",
    file: "simplebar.min.css",
    patterns: [new RegExp("simplebar(?:\\.min)?\\.css", "i")]
  },
  {
    name: "FilePond JS",
    type: "script",
    slug: "filepond",
    defaultVersion: "4.31.4",
    file: "filepond.min.js",
    patterns: [new RegExp("filepond(?:\\.min)?\\.js", "i")]
  },
  {
    name: "FilePond CSS",
    type: "style",
    slug: "filepond",
    defaultVersion: "4.31.4",
    file: "filepond.min.css",
    patterns: [new RegExp("filepond(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Dropzone JS",
    type: "script",
    slug: "dropzone",
    defaultVersion: "5.9.3",
    file: "min/dropzone.min.js",
    patterns: [new RegExp("dropzone(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Dropzone CSS",
    type: "style",
    slug: "dropzone",
    defaultVersion: "5.9.3",
    file: "min/dropzone.min.css",
    patterns: [new RegExp("dropzone(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Uppy JS",
    type: "script",
    slug: "uppy",
    defaultVersion: "3.26.1",
    file: "uppy.min.js",
    patterns: [new RegExp("uppy(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Uppy CSS",
    type: "style",
    slug: "uppy",
    defaultVersion: "3.26.1",
    file: "uppy.min.css",
    patterns: [new RegExp("uppy(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Cropper.js JS",
    type: "script",
    slug: "cropperjs",
    defaultVersion: "1.6.2",
    file: "cropper.min.js",
    patterns: [new RegExp("cropper(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Cropper.js CSS",
    type: "style",
    slug: "cropperjs",
    defaultVersion: "1.6.2",
    file: "cropper.min.css",
    patterns: [new RegExp("cropper(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Quill JS",
    type: "script",
    slug: "quill",
    defaultVersion: "1.3.7",
    file: "quill.min.js",
    patterns: [new RegExp("quill(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Quill CSS",
    type: "style",
    slug: "quill",
    defaultVersion: "1.3.7",
    file: "quill.snow.min.css",
    patterns: [new RegExp("quill(?:\\.snow)?(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Trix JS",
    type: "script",
    slug: "trix",
    defaultVersion: "2.1.0",
    file: "trix.umd.min.js",
    patterns: [new RegExp("trix(?:\\.umd)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Trix CSS",
    type: "style",
    slug: "trix",
    defaultVersion: "2.1.0",
    file: "trix.min.css",
    patterns: [new RegExp("trix(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Summernote JS",
    type: "script",
    slug: "summernote",
    defaultVersion: "0.9.0",
    file: "summernote-lite.min.js",
    patterns: [new RegExp("summernote(?:\\-lite)?(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Summernote CSS",
    type: "style",
    slug: "summernote",
    defaultVersion: "0.9.0",
    file: "summernote-lite.min.css",
    patterns: [new RegExp("summernote(?:\\-lite)?(?:\\.min)?\\.css", "i")]
  },
  {
    name: "TinyMCE",
    type: "script",
    slug: "tinymce",
    defaultVersion: "7.2.1",
    file: "tinymce.min.js",
    patterns: [new RegExp("tinymce(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Prism JS",
    type: "script",
    slug: "prism",
    defaultVersion: "1.29.0",
    file: "prism.min.js",
    patterns: [new RegExp("prism(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Prism CSS",
    type: "style",
    slug: "prism",
    defaultVersion: "1.29.0",
    file: "themes/prism.min.css",
    patterns: [new RegExp("prism(?:\\.min)?\\.css", "i")]
  },
  {
    name: "highlight.js JS",
    type: "script",
    slug: "highlight.js",
    defaultVersion: "11.9.0",
    file: "highlight.min.js",
    patterns: [new RegExp("highlight(?:\\.min)?\\.js|highlight\\.js", "i")]
  },
  {
    name: "highlight.js CSS",
    type: "style",
    slug: "highlight.js",
    defaultVersion: "11.9.0",
    file: "styles/default.min.css",
    patterns: [new RegExp("highlight|default(?:\\.min)?\\.css", "i")]
  },
  {
    name: "CodeMirror JS",
    type: "script",
    slug: "codemirror",
    defaultVersion: "6.65.7",
    file: "codemirror.min.js",
    patterns: [new RegExp("codemirror(?:\\.min)?\\.js", "i")]
  },
  {
    name: "CodeMirror CSS",
    type: "style",
    slug: "codemirror",
    defaultVersion: "6.65.7",
    file: "codemirror.min.css",
    patterns: [new RegExp("codemirror(?:\\.min)?\\.css", "i")]
  },
  {
    name: "Ace Editor",
    type: "script",
    slug: "ace",
    defaultVersion: "1.33.2",
    file: "ace.js",
    patterns: [new RegExp("ace(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Feather Icons",
    type: "script",
    slug: "feather-icons",
    defaultVersion: "4.29.2",
    file: "feather.min.js",
    patterns: [new RegExp("feather(?:\\.min)?\\.js", "i")]
  },
  {
    name: "Hero Slider Slick Theme CSS",
    type: "style",
    slug: "slick-carousel",
    defaultVersion: "1.8.1",
    file: "slick/slick-theme.min.css",
    patterns: [new RegExp("slick\\-theme(?:\\.min)?\\.css", "i")]
  }
];

const ALL_LIBRARY_RULES = LIBRARY_RULES.concat(EXTRA_LIBRARY_RULES);

const SCRIPT_TAG_RE =
  /<script\b[^>]*\bsrc\s*=\s*(['"])([^"']+)\1[^>]*>\s*<\/script>/gi;
const LINK_TAG_RE = /<link\b[^>]*\bhref\s*=\s*(['"])([^"']+)\1[^>]*>/gi;
const DOMONETKA_INIT_BLOCK_RE =
  /<script\b[^>]*>\s*const\s+domonetkaRaw\s*=\s*['"]\{domonetka\}['"];\s*const\s+domonetka\s*=\s*decodeURIComponent\(domonetkaRaw\);\s*<\/script>/gi;
const LEADING_PHP_BLOCK_RE = /^\s*<\?php[\s\S]*?\?>\s*/i;

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
  return ALL_LIBRARY_RULES.find((rule) => {
    if (rule.type !== type) {
      return false;
    }
    return rule.patterns.some((pattern) => pattern.test(normalized));
  });
}

function detectPxlFile(normalizedResource) {
  const hasPxlSource =
    normalizedResource.includes("leontev-e/pxl/") ||
    normalizedResource.includes("leontev-e.github.io/pxl/") ||
    normalizedResource.includes("raw.githubusercontent.com/leontev-e/pxl/");

  if (!hasPxlSource) {
    return null;
  }

  if (normalizedResource.includes("indexpxl.js")) {
    return "indexPxl.js";
  }
  if (/(^|\/)pxl\.js$/i.test(normalizedResource) || normalizedResource.includes("/pxl.js")) {
    return "pxl.js";
  }
  return null;
}

function buildPxlScriptUrl(fileName) {
  return `https://cdn.jsdelivr.net/gh/Leontev-E/pxl/${fileName}`;
}

function hasPxlScript(content) {
  let found = false;
  content.replace(SCRIPT_TAG_RE, (fullTag, quote, src) => {
    if (detectPxlFile(normalizeForMatch(src))) {
      found = true;
    }
    return fullTag;
  });
  return found;
}

function buildGoogleFontsUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch (error) {
    try {
      url = new URL(href, "https://fonts.googleapis.com");
    } catch (innerError) {
      return null;
    }
  }

  const pathname = url.pathname || "";
  if (!/^\/css2?$/i.test(pathname)) {
    return null;
  }
  if (!url.searchParams.has("family")) {
    return null;
  }

  return `https://fonts.googleapis.com${pathname}${url.search}`;
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
    const googleFontsUrl = buildGoogleFontsUrl(href);
    if (googleFontsUrl) {
      const replacement = `<link rel="stylesheet" href="${googleFontsUrl}">`;
      const key = `style:google-fonts:${normalizeForMatch(googleFontsUrl)}`;

      if (seenLibraries.has(key)) {
        report.removedDuplicateLibraries += 1;
        return "";
      }
      seenLibraries.add(key);

      if (normalizeForMatch(href) === normalizeForMatch(googleFontsUrl)) {
        return fullTag;
      }

      report.replacedLibraries.push({ name: "Google Fonts", from: href, to: googleFontsUrl });
      return replacement;
    }

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

  const leadingPhpMatch = content.match(LEADING_PHP_BLOCK_RE);
  if (leadingPhpMatch) {
    const leadingPhpBlock = leadingPhpMatch[0];
    const hasRawClickCheck = /!isset\(\s*\$rawClick\s*\)/i.test(leadingPhpBlock);
    const hasSubidCheck = /empty\(\s*\$_COOKIE\[['"]_subid['"]\]\s*\)/i.test(leadingPhpBlock);
    if (hasRawClickCheck && !hasSubidCheck) {
      report.replacedLegacyPhpBlock = true;
      const rest = content.slice(leadingPhpBlock.length).replace(/^\s+/, "");
      return `${PHP_SNIPPET}\n${rest}`;
    }
  }

  report.addedPhpBlock = true;
  return `${PHP_SNIPPET}\n${content}`;
}

function ensureDomonetkaSnippet(content, report) {
  const initExists = hasDomonetkaInit(content);
  const pxlScriptExists = hasPxlScript(content);

  if (initExists && pxlScriptExists) {
    return content;
  }

  if (!initExists && pxlScriptExists) {
    let inserted = false;
    const withInsertedInit = content.replace(SCRIPT_TAG_RE, (fullTag, quote, src) => {
      if (!inserted && detectPxlFile(normalizeForMatch(src))) {
        inserted = true;
        return `${DOMONETKA_INIT_SNIPPET}\n${fullTag}`;
      }
      return fullTag;
    });

    if (inserted) {
      report.addedDomonetkaBlock = true;
      return withInsertedInit;
    }
  }

  if (initExists && !pxlScriptExists) {
    let inserted = false;
    const withInsertedScript = content.replace(DOMONETKA_INIT_BLOCK_RE, (match) => {
      if (!inserted) {
        inserted = true;
        return `${DOMONETKA_INIT_SNIPPET}\n${DOMONETKA_SCRIPT_SNIPPET}`;
      }
      return match;
    });

    if (inserted) {
      report.addedDomonetkaBlock = true;
      return withInsertedScript;
    }
  }

  if (/<\/title>/i.test(content)) {
    report.addedDomonetkaBlock = true;
    return content.replace(
      /<\/title>/i,
      (match) => `${match}\n${DOMONETKA_INIT_SNIPPET}\n${DOMONETKA_SCRIPT_SNIPPET}`
    );
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

function isSupportedIndexFile(filePath) {
  const base = path.basename(filePath).toLowerCase();
  return base === "index.html" || base === "index.php";
}

async function getIndexDocument() {
  const active = vscode.window.activeTextEditor?.document;
  if (active && isSupportedIndexFile(active.uri.fsPath)) {
    return active;
  }

  const indexHtmlFiles = await vscode.workspace.findFiles(
    "**/index.html",
    "**/{node_modules,.git,dist,build}/**",
    1
  );
  if (indexHtmlFiles.length) {
    return vscode.workspace.openTextDocument(indexHtmlFiles[0]);
  }

  const indexPhpFiles = await vscode.workspace.findFiles(
    "**/index.php",
    "**/{node_modules,.git,dist,build}/**",
    1
  );
  if (indexPhpFiles.length) {
    return vscode.workspace.openTextDocument(indexPhpFiles[0]);
  }

  return null;
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

  const document = await getIndexDocument();
  const report = {
    addedPhpBlock: false,
    replacedLegacyPhpBlock: false,
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
    report.warnings.push("index.html/index.php not found, skipped page normalization.");
  }

  await syncSitePhpFiles(siteRoot, extensionRoot, report);
  await ensureApiPhp(siteRoot, report);

  const changed = Boolean(
    report.addedPhpBlock ||
      report.replacedLegacyPhpBlock ||
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
    report.replacedLegacyPhpBlock
      ? "legacy php block replaced"
      : report.addedPhpBlock
        ? "php block added"
        : "php block already present",
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
      vscode.window.showErrorMessage(`KLM inc: failed to process index file: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
