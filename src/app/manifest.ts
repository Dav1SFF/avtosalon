import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VIDKRYTYI Автосалон',
    short_name: 'VIDKRYTYI',
    description: 'Відкрито про автомобілі. Автосалон перевірених автомобілів у Дніпрі.',
    start_url: '/',
    display: 'standalone',
    background_color: '#071E1A',
    theme_color: '#FFD400',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      // Here you would normally add 192x192 and 512x512 PNGs
    ],
  }
}
