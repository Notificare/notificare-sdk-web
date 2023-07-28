import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import replace from 'gulp-replace';
import pkg from './package.json' assert { type: 'json' };

const NOTIFICARE_CORE_URL = `https://cdn.notifica.re/libs/html5/v3/${pkg.version}/notificare-core.js`;
const NOTIFICARE_INTERNAL_CORE_URL = `https://cdn.notifica.re/libs/html5/internal/${pkg.version}/notificare-core.js`;

const files = pkg.components.map((component) => {
  const componentName = component.replace('/', '-');
  return `.build/min/notificare-${componentName}.js`;
});

function replaceCdnUrl() {
  return gulp.src(files)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(replace(/(['"])@notificare\/core(['"])/g, `$1${NOTIFICARE_CORE_URL}$2`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.build/cdn'));
}

function replaceCdnInternalUrl() {
  return gulp.src(files)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(replace(/(['"])@notificare\/core(['"])/g, `$1${NOTIFICARE_INTERNAL_CORE_URL}$2`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.build/cdn-internal'));
}

export { replaceCdnUrl };
