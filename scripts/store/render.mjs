import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CAPTURES = join(ROOT, 'store', 'captures');
const OUTPUT = join(ROOT, 'store', 'screenshots');
const LOGO = join(ROOT, 'docs', 'assets', 'logo.png');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DEVICES = {
  'iphone-6.9': {
    width: 1320,
    height: 2868,
    padTop: 130,
    header: 470,
    gap: 70,
    bottom: 110,
    maxScreen: 980,
    band: 7,
    bezel: 22,
    screenRadius: 0.125,
    type: { overline: 34, logo: 64, title: 98, subtitle: 44, measure: 1100 },
  },
};

const THEMES = {
  light: {
    background: `radial-gradient(110% 55% at 50% 0%, rgba(61, 213, 243, 0.30) 0%, rgba(61, 213, 243, 0) 62%),
      radial-gradient(80% 40% at 100% 100%, rgba(7, 117, 137, 0.10) 0%, rgba(7, 117, 137, 0) 70%),
      linear-gradient(180deg, #E8F5F9 0%, #F5F6F8 48%, #EDF0F4 100%)`,
    title: '#0B1220',
    subtitle: '#4B5566',
    accent: '#077589',
    overline: '#0B1220',
    shadow: '0 70px 140px rgba(12, 44, 64, 0.26), 0 18px 40px rgba(12, 44, 64, 0.14)',
  },
  dark: {
    background: `radial-gradient(85% 45% at 50% 64%, rgba(61, 213, 243, 0.20) 0%, rgba(61, 213, 243, 0) 72%),
      radial-gradient(110% 50% at 50% 0%, rgba(24, 117, 142, 0.35) 0%, rgba(24, 117, 142, 0) 60%),
      linear-gradient(180deg, #0F1822 0%, #0B0E13 55%, #080A0E 100%)`,
    title: '#F3F7FB',
    subtitle: '#A5B0BE',
    accent: '#3DD5F3',
    overline: '#F3F7FB',
    shadow: '0 70px 160px rgba(0, 0, 0, 0.60), 0 0 120px rgba(61, 213, 243, 0.12)',
  },
};

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlight = (text) =>
  escapeHtml(text).replace(/\[\[(.+?)\]\]/g, (_, words) => `<span class="accent">${words}</span>`);

function pageHtml({ device, theme, title, subtitle, capture, logo }) {
  const d = DEVICES[device];
  const t = THEMES[theme];
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${d.width}px; height: ${d.height}px; overflow: hidden; }
  body {
    background: ${t.background};
    font-family: -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  header {
    margin: ${d.padTop}px auto 0;
    width: ${d.type.measure}px;
    height: ${d.header}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .overline {
    display: flex;
    align-items: center;
    gap: ${Math.round(d.type.overline * 0.6)}px;
    font-size: ${d.type.overline}px;
    font-weight: 650;
    letter-spacing: 0.02em;
    color: ${t.overline};
    margin-bottom: ${Math.round(d.type.title * 0.42)}px;
  }
  .overline img {
    width: ${d.type.logo}px;
    height: ${d.type.logo}px;
    border-radius: ${Math.round(d.type.logo * 0.2237)}px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  }
  h1 {
    font-size: ${d.type.title}px;
    line-height: 1.04;
    font-weight: 800;
    letter-spacing: -0.028em;
    color: ${t.title};
    text-wrap: balance;
  }
  .accent { color: ${t.accent}; }
  p {
    margin-top: ${Math.round(d.type.title * 0.36)}px;
    font-size: ${d.type.subtitle}px;
    line-height: 1.36;
    font-weight: 500;
    letter-spacing: -0.005em;
    color: ${t.subtitle};
    text-wrap: balance;
  }
  .device {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: ${d.band}px;
    background: linear-gradient(150deg, #4A4D54 0%, #1B1D21 35%, #2E3137 70%, #121316 100%);
    box-shadow: ${t.shadow};
  }
  .bezel { width: 100%; height: 100%; padding: ${d.bezel}px; background: #050506; }
  .screen { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
  .screen img { display: block; width: 100%; height: 100%; }
  .island { position: absolute; left: 50%; transform: translateX(-50%); background: #000; border-radius: 999px; }
</style>
</head>
<body>
  <header>
    <div class="overline"><img src="${logo}" alt="">Lighthouse Guard</div>
    <h1>${highlight(title)}</h1>
    <p>${escapeHtml(subtitle)}</p>
  </header>
  <div class="device"><div class="bezel"><div class="screen"><img id="shot" src="${capture}" alt=""><div class="island"></div></div></div></div>
  <script>
    const config = ${JSON.stringify({ ...d, type: undefined })};
    const shot = document.getElementById('shot');
    const layout = () => {
      const ratio = shot.naturalHeight / shot.naturalWidth;
      const top = config.padTop + config.header + config.gap;
      const frame = config.band + config.bezel;
      const available = config.height - top - config.bottom - frame * 2;
      const screenWidth = Math.min(config.maxScreen, available / ratio);
      const screenHeight = screenWidth * ratio;
      const screenRadius = screenWidth * config.screenRadius;
      const device = document.querySelector('.device');
      device.style.top = top + 'px';
      device.style.width = screenWidth + frame * 2 + 'px';
      device.style.height = screenHeight + frame * 2 + 'px';
      device.style.borderRadius = screenRadius + frame + 'px';
      document.querySelector('.bezel').style.borderRadius = screenRadius + config.bezel + 'px';
      document.querySelector('.screen').style.borderRadius = screenRadius + 'px';
      const island = document.querySelector('.island');
      island.style.top = screenWidth * 0.026 + 'px';
      island.style.width = screenWidth * 0.285 + 'px';
      island.style.height = screenWidth * 0.084 + 'px';
      document.body.dataset.ready = 'true';
    };
    if (shot.complete) layout();
    else shot.addEventListener('load', layout);
  </script>
</body>
</html>`;
}

function render({ device, locale, slide, text, workdir }) {
  const d = DEVICES[device];
  const capture = join(CAPTURES, locale, device, `${slide.capture}.png`);
  if (!existsSync(capture)) throw new Error(`Missing capture ${capture}`);
  const html = join(workdir, `${locale}-${device}-${slide.id}.html`);
  writeFileSync(
    html,
    pageHtml({
      device,
      theme: slide.theme,
      title: text.title,
      subtitle: text.subtitle,
      capture: pathToFileURL(capture).href,
      logo: pathToFileURL(LOGO).href,
    }),
  );
  const target = join(OUTPUT, locale, device, `${slide.id}.png`);
  mkdirSync(dirname(target), { recursive: true });
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${d.width},${d.height}`,
      '--virtual-time-budget=4000',
      '--allow-file-access-from-files',
      `--screenshot=${target}`,
      pathToFileURL(html).href,
    ],
    { stdio: 'ignore' },
  );
  execFileSync('magick', [target, '-alpha', 'off', '-strip', '-define', 'png:color-type=2', target]);
  const size = execFileSync('magick', ['identify', '-format', '%wx%h', target]).toString();
  if (size !== `${d.width}x${d.height}`) throw new Error(`${target} is ${size}, expected ${d.width}x${d.height}`);
  return target;
}

const { slides, copy } = JSON.parse(readFileSync(join(ROOT, 'scripts', 'store', 'slides.json'), 'utf8'));
const [onlyLocale, onlyDevice] = process.argv.slice(2);
const workdir = mkdtempSync(join(tmpdir(), 'store-screenshots-'));
try {
  for (const locale of Object.keys(copy).filter((name) => !onlyLocale || name === onlyLocale)) {
    for (const device of Object.keys(DEVICES).filter((name) => !onlyDevice || name === onlyDevice)) {
      for (const slide of slides) {
        const target = render({ device, locale, slide, text: copy[locale][slide.id], workdir });
        console.log(target.replace(`${ROOT}/`, ''));
      }
    }
  }
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
