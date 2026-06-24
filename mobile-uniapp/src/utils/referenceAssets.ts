const base = '/static/reference-assets/';

export const referenceAssets = {
  homeHeroSlides: [
    `${base}home-hero-01.jpg`,
    `${base}home-hero-02.jpg`,
  ],
  homeMosaic: {
    large: `${base}home-mosaic-large.jpg`,
    wideOne: `${base}home-mosaic-wide-01.jpg`,
    wideTwo: `${base}home-mosaic-wide-02.jpg`,
    squares: [
      `${base}home-mosaic-square-01.jpg`,
      `${base}home-mosaic-square-02.jpg`,
      `${base}home-mosaic-square-03.jpg`,
      `${base}home-mosaic-square-04.jpg`,
    ],
  },
  sampleLibrary: [
    {
      id: 'portrait',
      title: '形象照',
      subtitle: '干净职业形象，适合个人主页与职场资料',
      imageUrl: `${base}category-portrait-01.jpg`,
    },
    {
      id: 'family',
      title: '亲子照',
      subtitle: '自然生活光影，记录陪伴和亲密瞬间',
      imageUrl: `${base}sample-family-generated.png`,
    },
    {
      id: 'id',
      title: '证件照',
      subtitle: '标准蓝底头像，适合报名与资料提交',
      imageUrl: `${base}sample-id-generated.png`,
    },
    {
      id: 'couple',
      title: '情侣照',
      subtitle: '轻松户外氛围，保留真实互动表情',
      imageUrl: `${base}sample-couple-generated.png`,
    },
  ],
  seasonalHot: [
    `${base}seasonal-hot-01.jpg`,
    `${base}seasonal-hot-02.jpg`,
  ],
  categoryPortraits: [
    `${base}category-portrait-01.jpg`,
    `${base}sample-family-generated.png`,
    `${base}sample-id-generated.png`,
    `${base}sample-couple-generated.png`,
    `${base}home-mosaic-square-04.jpg`,
  ],
  strips: [
    `${base}section-strip-01.jpg`,
    `${base}section-strip-02.jpg`,
    `${base}brand-slogan-strip.jpg`,
  ],
  fallbackGalleryThumb: `${base}fallback-gallery-thumb.png`,
};

export function pickReferenceImage(list: string[], index: number) {
  return list[index % list.length] || referenceAssets.fallbackGalleryThumb;
}
