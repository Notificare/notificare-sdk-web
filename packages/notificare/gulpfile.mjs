import gulp from "gulp";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import replace from "gulp-replace";
import sourcemaps from "gulp-sourcemaps";
import s3Upload from "gulp-s3-upload";
import pkg from "./package.json" assert { type: "json" };

const s3 = s3Upload();

const NOTIFICARE_CORE_URL = `https://cdn.notifica.re/libs/web/v4/${pkg.version}/notificare-core.js`;
const NOTIFICARE_LATEST_CORE_URL = `https://cdn.notifica.re/libs/web/v4/latest/notificare-core.js`;
const NOTIFICARE_INTERNAL_CORE_URL = `https://cdn.notifica.re/libs/web/internal/${pkg.version}/notificare-core.js`;
const STABLE_VERSION_REGEX = /^\d+\.\d+\.\d+$/;

function bundleSources(variant) {
  const { coreUrl, destination } = getVariantInfo(variant);

  const files = pkg.components.map((component) => {
    const componentName = component.replace("/", "-");
    return `.build/min/notificare-${componentName}.js`;
  });

  return gulp.src(files)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(replace(/(['"])@notificare\/web-core(['"])/g, `$1${coreUrl}$2`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(destination));
}

function bundleCss(variant) {
  const { destination } = getVariantInfo(variant);

  const files = [
    "in-app-messaging/in-app-messaging.css",
    "push/push.css",
    "push-ui/push-ui.css"
  ];

  return gulp.src(files)
    .pipe(postcss())
    .pipe(rename(function(path) {
      path.basename = `notificare-${path.basename}`;
    }))
    .pipe(gulp.dest(destination));
}

function getVariantInfo(variant) {
  switch (variant) {
    case "version":
      return {
        coreUrl: NOTIFICARE_CORE_URL,
        destination: ".build/cdn-version"
      };
    case "latest":
      return {
        coreUrl: NOTIFICARE_LATEST_CORE_URL,
        destination: ".build/cdn-latest"
      };
    case "internal":
      return {
        coreUrl: NOTIFICARE_INTERNAL_CORE_URL,
        destination: ".build/cdn-internal"
      };
    default:
      throw new Error(`Unknown variant '${variant}'.`);
  }
}

export function buildVersionRelease(done) {
  return gulp.parallel(
    function bundleVersionReleaseSources() {
      return bundleSources("version");
    },
    function bundleVersionReleaseStyles() {
      return bundleCss("version");
    }
  )(done);
}

export function buildLatestRelease(done) {
  return gulp.parallel(
    function bundleLatestReleaseSources() {
      return bundleSources("latest");
    },
    function bundleLatestReleaseStyles() {
      return bundleCss("latest");
    }
  )(done);
}

export function buildInternalRelease(done) {
  return gulp.parallel(
    function bundleInternalReleaseSources() {
      return bundleSources("internal");
    },
    function bundleInternalReleaseStyles() {
      return bundleCss("internal");
    }
  )(done);
}

export function build(done) {
  const tasks = [
    buildVersionRelease,
    buildInternalRelease
  ];

  if (pkg.version.match(STABLE_VERSION_REGEX)) {
    tasks.push(buildLatestRelease);
  }

  return gulp.series(tasks)(done);
}

export function uploadVersionRelease() {
  const { destination } = getVariantInfo("version");

  return gulp.src(`${destination}/**`)
    .pipe(s3({
      Bucket: "cdn.notifica.re",
      ACL: "public-read",
      keyTransform: (filename) => `libs/web/v4/${pkg.version}/${filename}`
    }));
}

export function uploadLatestRelease() {
  const { destination } = getVariantInfo("latest");

  return gulp.src(`${destination}/**`)
    .pipe(s3({
      Bucket: "cdn.notifica.re",
      ACL: "public-read",
      keyTransform: (filename) => `libs/web/v4/latest/${filename}`
    }));
}

export function uploadInternalRelease() {
  const { destination } = getVariantInfo("internal");

  return gulp.src(`${destination}/**`)
    .pipe(s3({
      Bucket: "cdn.notifica.re",
      ACL: "public-read",
      CacheControl: "max-age=0, no-cache, no-store, must-revalidate",
      keyTransform: (filename) => `libs/web/internal/${pkg.version}/${filename}`
    }));
}

export function publish(done) {
  const tasks = [
    build,
    uploadVersionRelease,
    uploadInternalRelease
  ];

  if (pkg.version.match(STABLE_VERSION_REGEX)) {
    tasks.push(uploadLatestRelease);
  }

  return gulp.series(tasks)(done);
}

export default build;
