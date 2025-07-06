
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  savings: string;
}

interface MembershipTestimonialsProps {
  testimonials: Testimonial[];
}

const MembershipTestimonials = ({ testimonials }: MembershipTestimonialsProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">What Our Pro Members Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-3">"{testimonial.text}"</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-600">{testimonial.location}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Saved {testimonial.savings}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MembershipTestimonials;
