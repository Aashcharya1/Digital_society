import { SutradharGame } from '@/components/kathputli-game';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const backgroundImage = PlaceHolderImages.find(img => img.id === 'hawa-mahal-background');

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4 sm:p-6 md:p-8"
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage.imageUrl})` : 'none' }}
      data-ai-hint={backgroundImage?.imageHint}
    >
      <SutradharGame />
    </main>
  );
}
