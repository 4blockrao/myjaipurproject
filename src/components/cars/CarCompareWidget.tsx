import { Link } from 'react-router-dom';
import { Scale, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const popularComparisons = [
  { 
    car1: 'Tata Nexon', 
    car2: 'Hyundai Venue',
    slug: 'tata-nexon-vs-hyundai-venue'
  },
  { 
    car1: 'Mahindra XUV700', 
    car2: 'Tata Safari',
    slug: 'mahindra-xuv700-vs-tata-safari'
  },
  { 
    car1: 'Maruti Swift', 
    car2: 'Hyundai i20',
    slug: 'maruti-swift-vs-hyundai-i20'
  },
  { 
    car1: 'Kia Seltos', 
    car2: 'Hyundai Creta',
    slug: 'kia-seltos-vs-hyundai-creta'
  },
];

const CarCompareWidget = () => {
  return (
    <section className="py-10 container px-4">
      <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Compare Cars</h2>
              <p className="text-sm text-muted-foreground">Side-by-side comparison to find your best match</p>
            </div>
          </div>
          <Link to="/cars/compare">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Start Comparison
            </Button>
          </Link>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Comparisons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularComparisons.map((comparison) => (
              <Link key={comparison.slug} to={`/cars/compare/${comparison.slug}`}>
                <Card className="group hover:shadow-md hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{comparison.car1}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-medium text-foreground">{comparison.car2}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarCompareWidget;
