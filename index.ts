import { BlobCursor } from './src/blob-cursor';

const body = document.querySelector('body') as HTMLBodyElement;
body.style.display = 'flex';
body.style.flexDirection = 'column';
body.style.alignItems = 'center';
body.style.justifyContent = 'center';
body.style.height = '100vh';
body.style.margin = '0';
body.style.boxSizing = 'border-box';
body.style.padding = '0';
body.style.overflow = 'hidden';

// Resize canvases
for (const canvas of document.querySelectorAll('canvas')) {
  if ('width' in canvas.attributes || 'height' in canvas.attributes) {
    continue; // custom canvas, not replacing with resizable
  }

  const container = document.createElement('div');
  const frame = document.createElement('div');

  canvas.parentElement?.replaceChild(container, canvas);

  frame.appendChild(canvas);
  container.appendChild(frame);

  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.width = '100%';
  container.style.height = '100%';

  container.style.containerType = 'size';

  frame.style.position = 'relative';

  if (canvas.dataset.fitToContainer !== undefined) {
    frame.style.width = '100%';
    frame.style.height = '100%';
  } else {
    const aspectRatio = canvas.dataset.aspectRatio ?? '1';
    frame.style.aspectRatio = aspectRatio;
    frame.style.height =
      `min(calc(min(100cqw, 100cqh)/(${aspectRatio})), min(100cqw, 100cqh))`;
  }

  canvas.style.position = 'absolute';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const onResize = () => {
    canvas.width = frame.clientWidth * window.devicePixelRatio;
    canvas.height = frame.clientHeight * window.devicePixelRatio;
  };

  onResize();
  new ResizeObserver(onResize).observe(container);
}

// Initialize blob cursor
new BlobCursor({
  blobType: 'circle',
  fillColor: '#5227FF',
  trailCount: 3,
  sizes: [60, 125, 75],
  innerSizes: [20, 35, 25],
  innerColor: 'rgba(255,255,255,0.8)',
  opacities: [0.6, 0.6, 0.6],
  shadowColor: 'rgba(0,0,0,0.75)',
  shadowBlur: 5,
  shadowOffsetX: 10,
  shadowOffsetY: 10,
  filterStdDeviation: 30,
  useFilter: true,
  fastDuration: 0.1,
  slowDuration: 0.5,
  zIndex: 100,
});

// Execute example
// @ts-expect-error
const example = await import('./src/index.ts');

// No controls panel needed for the landing page
