import { Link } from 'react-router-dom';
import { Car, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const bodyTypes = [
  { 
    name: 'SUV', 
    slug: 'suv', 
    icon: '🚙', 
    description: 'Spacious & commanding',
    gradient: 'from-orange-500/20 to-amber-500/20'
  },
  { 
    name: 'Hatchback', 
    slug: 'hatchback', 
    icon: '🚗', 
    description: 'Compact & fuel-efficient',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  { 
    name: 'Sedan', 
    slug: 'sedan', 
    icon: '🚘', 
    description: 'Elegant & comfortable',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  { 
    name: 'MUV/MPV', 
    slug: 'muv', 
    icon: '🚐', 
    description: 'Family-friendly',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  { 
    name: 'Compact SUV', 
    slug: 'compact-suv', 
    icon: '🚙', 
    description: 'City SUV comfort',
    gradient: 'from-rose-500/20 to-red-500/20'
  },
  { 
    name: 'Luxury', 
    slug: 'luxury', 
    icon: '✨', 
    description: 'Premium experience',
    gradient: 'from-yellow-500/20 to-amber-500/20'
  },
];

const CarsByBodyType = () => {
  return (
    <section className="py-10 container px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Browse by Body Type
          </h2>
          <p className="text-muted-foreground mt-1">Find the perfect style for your needs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {bodyTypes.map((type) => (
          <Link key={type.slug} to={`/cars/body-type/${type.slug}`}>
            <Card className={`group hover:shadow-xl transition-all h-full bg-gradient-to-br ${type.gradient} border-0`}>
              <CardContent className="p-5 flex flex-col items-center text-center">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {type.icon}
                </span>
                <h3 className="font-semibold text-foreground">{type.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CarsByBodyType;
