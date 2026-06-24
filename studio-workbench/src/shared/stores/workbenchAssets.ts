import emptyFilesImage from '../../assets/jianyue/empty-files.png'
import productIdcardImage from '../../assets/jianyue/product-idcard.svg'
import productPortraitImage from '../../assets/jianyue/product-portrait.svg'
import sampleIdcard01Image from '../../assets/jianyue/sample-idcard-01.svg'
import sampleIdcard02Image from '../../assets/jianyue/sample-idcard-02.svg'
import samplePortrait01Image from '../../assets/jianyue/sample-portrait-01.svg'
import samplePortrait02Image from '../../assets/jianyue/sample-portrait-02.svg'
import storeFrontImage from '../../assets/jianyue/store-front.svg'

export const workbenchImages = {
  emptyFiles: emptyFilesImage,
  storeFront: storeFrontImage,
  products: {
    idcard: productIdcardImage,
    portrait: productPortraitImage,
  },
  samples: [
    sampleIdcard01Image,
    sampleIdcard02Image,
    samplePortrait01Image,
    samplePortrait02Image,
  ],
} as const

export const productFallbackImages = [
  workbenchImages.products.idcard,
  workbenchImages.products.portrait,
] as const

export const getProductFallbackImage = (index = 0) =>
  productFallbackImages[index % productFallbackImages.length]

export const getSamplePhotoImage = (index: number) =>
  workbenchImages.samples[index % workbenchImages.samples.length]

export const isWorkbenchFallbackImage = (value: string | null | undefined) =>
  Boolean(value && [
    workbenchImages.emptyFiles,
    workbenchImages.storeFront,
    ...productFallbackImages,
    ...workbenchImages.samples,
  ].includes(value as any))
