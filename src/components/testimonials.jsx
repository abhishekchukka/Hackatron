import Image from "next/image"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Professional Athlete",
      image: "/placeholder.svg?height=100&width=100",
      quote: "This platform transformed my athletic career. The coaching connections and guidance were invaluable.",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "College Athlete",
      image: "/placeholder.svg?height=100&width=100",
      quote: "The personalized training programs and career advice helped me secure a college scholarship.",
      rating: 5,
    },
    {
      name: "Coach Mike Wilson",
      role: "Certified Coach",
      image: "/placeholder.svg?height=100&width=100",
      quote: "An excellent platform for connecting with talented athletes and helping them reach their potential.",
      rating: 5,
    },
  ]

  return (
    (<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Success Stories</h2>
            <p
              className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from athletes and coaches who've achieved success with our platform
            </p>
          </div>
        </div>
        <div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg">
              <Image
                src={testimonial.image || "/placeholder.svg"}
                alt={testimonial.name}
                width={100}
                height={100}
                className="rounded-full" />
              <div className="flex space-x-1">
                {Array(testimonial.rating)
                  .fill()
                  .map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
              </div>
              <p className="text-center italic text-gray-600">&quot;{testimonial.quote}&quot;</p>
              <div className="text-center">
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>)
  );
}

