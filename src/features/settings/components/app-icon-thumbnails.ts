import type { ImageSource } from 'expo-image';

import aquaVioletIcon from '@/assets/images/app-icons/thumbnails/aqua-violet.png';
import blueIcon from '@/assets/images/app-icons/thumbnails/blue.png';
import cyanIcon from '@/assets/images/app-icons/thumbnails/cyan.png';
import graphiteIcon from '@/assets/images/app-icons/thumbnails/graphite.png';
import indigoIcon from '@/assets/images/app-icons/thumbnails/indigo.png';
import mintIcon from '@/assets/images/app-icons/thumbnails/mint.png';
import roseIcon from '@/assets/images/app-icons/thumbnails/rose.png';
import skyIcon from '@/assets/images/app-icons/thumbnails/sky.png';
import sunsetIcon from '@/assets/images/app-icons/thumbnails/sunset.png';
import violetIcon from '@/assets/images/app-icons/thumbnails/violet.png';
import type { AppIconName } from '@/core/app-icon';

const THUMBNAIL_ASSETS = {
  graphite: graphiteIcon,
  sky: skyIcon,
  cyan: cyanIcon,
  blue: blueIcon,
  indigo: indigoIcon,
  violet: violetIcon,
  rose: roseIcon,
  sunset: sunsetIcon,
  mint: mintIcon,
  aquaViolet: aquaVioletIcon,
} satisfies Record<AppIconName, unknown>;

export const THUMBNAILS = THUMBNAIL_ASSETS as Record<AppIconName, ImageSource | number>;
