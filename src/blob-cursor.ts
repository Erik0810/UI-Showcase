import gsap from 'gsap';

interface BlobCursorOptions {
  blobType?: 'circle' | 'square';
  fillColor?: string;
  trailCount?: number;
  sizes?: number[];
  innerSizes?: number[];
  innerColor?: string;
  opacities?: number[];
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  filterId?: string;
  filterStdDeviation?: number;
  filterColorMatrixValues?: string;
  useFilter?: boolean;
  fastDuration?: number;
  slowDuration?: number;
  fastEase?: string;
  slowEase?: string;
  zIndex?: number;
}

export class BlobCursor {
  private container: HTMLDivElement;
  private blobs: HTMLDivElement[] = [];
  private options: Required<BlobCursorOptions>;

  constructor(options: BlobCursorOptions = {}) {
    this.options = {
      blobType: options.blobType || 'circle',
      fillColor: options.fillColor || '#5227FF',
      trailCount: options.trailCount || 3,
      sizes: options.sizes || [60, 125, 75],
      innerSizes: options.innerSizes || [20, 35, 25],
      innerColor: options.innerColor || 'rgba(255,255,255,0.8)',
      opacities: options.opacities || [0.6, 0.6, 0.6],
      shadowColor: options.shadowColor || 'rgba(0,0,0,0.75)',
      shadowBlur: options.shadowBlur || 5,
      shadowOffsetX: options.shadowOffsetX || 10,
      shadowOffsetY: options.shadowOffsetY || 10,
      filterId: options.filterId || 'blob',
      filterStdDeviation: options.filterStdDeviation || 30,
      filterColorMatrixValues: options.filterColorMatrixValues || '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
      useFilter: options.useFilter !== undefined ? options.useFilter : true,
      fastDuration: options.fastDuration || 0.1,
      slowDuration: options.slowDuration || 0.5,
      fastEase: options.fastEase || 'power3.out',
      slowEase: options.slowEase || 'power1.out',
      zIndex: options.zIndex || 100,
    };

    this.container = this.createContainer();
    this.init();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'blob-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${this.options.zIndex};
    `;
    return container;
  }

  private init(): void {
    // Create SVG filter if needed
    if (this.options.useFilter) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.cssText = 'position: absolute; width: 0; height: 0;';
      
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', this.options.filterId);
      
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('in', 'SourceGraphic');
      blur.setAttribute('result', 'blur');
      blur.setAttribute('stdDeviation', String(this.options.filterStdDeviation));
      
      const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      colorMatrix.setAttribute('in', 'blur');
      colorMatrix.setAttribute('values', this.options.filterColorMatrixValues);
      
      filter.appendChild(blur);
      filter.appendChild(colorMatrix);
      svg.appendChild(filter);
      this.container.appendChild(svg);
    }

    // Create blob main container
    const blobMain = document.createElement('div');
    blobMain.className = 'blob-main';
    blobMain.style.cssText = `
      pointer-events: none;
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      user-select: none;
      cursor: default;
      ${this.options.useFilter ? `filter: url(#${this.options.filterId});` : ''}
    `;

    // Create blobs
    for (let i = 0; i < this.options.trailCount; i++) {
      const blob = document.createElement('div');
      blob.className = 'blob';
      blob.style.cssText = `
        position: absolute;
        will-change: transform;
        transform: translate(-50%, -50%);
        width: ${this.options.sizes[i]}px;
        height: ${this.options.sizes[i]}px;
        border-radius: ${this.options.blobType === 'circle' ? '50%' : '0%'};
        background-color: ${this.options.fillColor};
        opacity: ${this.options.opacities[i]};
        box-shadow: ${this.options.shadowOffsetX}px ${this.options.shadowOffsetY}px ${this.options.shadowBlur}px 0 ${this.options.shadowColor};
      `;

      const innerDot = document.createElement('div');
      innerDot.className = 'inner-dot';
      innerDot.style.cssText = `
        position: absolute;
        width: ${this.options.innerSizes[i]}px;
        height: ${this.options.innerSizes[i]}px;
        top: ${(this.options.sizes[i] - this.options.innerSizes[i]) / 2}px;
        left: ${(this.options.sizes[i] - this.options.innerSizes[i]) / 2}px;
        background-color: ${this.options.innerColor};
        border-radius: ${this.options.blobType === 'circle' ? '50%' : '0%'};
      `;

      blob.appendChild(innerDot);
      blobMain.appendChild(blob);
      this.blobs.push(blob);
    }

    this.container.appendChild(blobMain);
    document.body.appendChild(this.container);

    // Add event listeners
    this.addEventListeners();
  }

  private addEventListeners(): void {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;

      this.blobs.forEach((el, i) => {
        const isLead = i === 0;
        gsap.to(el, {
          x: x,
          y: y,
          duration: isLead ? this.options.fastDuration : this.options.slowDuration,
          ease: isLead ? this.options.fastEase : this.options.slowEase,
        });
      });
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
  }

  public destroy(): void {
    this.container.remove();
  }
}
