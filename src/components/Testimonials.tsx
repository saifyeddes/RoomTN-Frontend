import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aymen Gharbi',
    role: 'Client fidèle',
    comment: 'Qualité incroyable et designs super originaux. Je recommande vivement Room.tn, c\'est devenu ma boutique préférée pour les t-shirts !',
    rating: 5,
  },
  {
    id: 2,
    name: 'Fatma Ben Ali',
    role: 'Nouvelle cliente',
    comment: 'J\'ai commandé pour la première fois et je suis très satisfaite. La livraison a été rapide et le t-shirt est encore plus beau en vrai.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Karim Mansour',
    role: 'Passionné de mode',
    comment: 'Enfin une marque tunisienne qui ose ! Les motifs sont audacieux et la coupe est parfaite. Continuez comme ça !',
    rating: 4,
  },
  {
    id: 4,
    name: 'Salma Khemir',
    role: 'Cliente régulière',
    comment: 'Le service client est au top. Ils sont très réactifs et à l\'écoute. Les produits sont toujours conformes à mes attentes.',
    rating: 5,
  },
    {
    id: 5,
    name: 'Mehdi Jouini',
    role: 'Client satisfait',
    comment: 'Un excellent rapport qualité/prix. Les t-shirts ne bougent pas au lavage. Je suis vraiment impressionné.',
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const { current } = scrollContainer;
      const scrollAmount = current.offsetWidth * 0.8; // Scroll by 80% of the container width
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La satisfaction de nos clients est notre plus grande fierté.
          </p>
        </div>

        <div className="relative">
          <div
            ref={scrollContainer}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-8 pb-8 scrollbar-hide"
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="snap-center flex-shrink-0 w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/4 bg-white rounded-lg shadow-lg p-8 flex flex-col"
              >
                <div className="flex-grow">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-6 flex-grow">"{testimonial.comment}"</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('left')}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors z-10 hidden md:flex"
            aria-label="Avis précédent"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors z-10 hidden md:flex"
            aria-label="Avis suivant"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;