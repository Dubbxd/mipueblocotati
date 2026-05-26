import { db } from '../src/db/client'
import { reviews } from '../src/db/schema'

const newReviews = [
  {
    authorName: 'Irma Benavides',
    authorCity: 'Sonoma County, CA',
    rating: 5,
    bodyEs: 'Muy buen servicio. Los platillos en grandes porciones y en sabor buenísimos!! Regresaremos nuevamente a éste nuestro lugar favorito! Definitivamente es el mejor Restaurante Mexicano en ésta área de la bahía. Los dueños son muy amables.',
    bodyEn: 'Very good service. The dishes come in generous portions and the flavors are amazing!! We will definitely come back to our favorite spot! Definitely the best Mexican Restaurant in this area of the bay. The owners are very friendly.',
    source: 'google', status: 'approved', isFeatured: true, sortOrder: 10,
  },
  {
    authorName: 'Alfredo Cervantes',
    authorCity: 'Sonoma County, CA',
    rating: 5,
    bodyEs: 'Me gusta como son los trabajadores y dueños de este restaurante. La comida de verdad, estilo muy mexicano, el sabor y la cantidad son más que suficientes. Me encantan los SUPER NACHOS Y LAS MARGARITAS!!! El precio está entre lo esperado. Definitivamente es el mejor restaurante.',
    bodyEn: 'I love how the staff and owners of this restaurant are. Real food, very Mexican style, the flavor and portions are more than enough. I love the SUPER NACHOS AND THE MARGARITAS!!! The price is fair. Definitely the best restaurant.',
    source: 'google', status: 'approved', isFeatured: true, sortOrder: 9,
  },
  {
    authorName: 'blanca barajas',
    authorCity: 'Sonoma County, CA',
    rating: 5,
    bodyEs: 'Me gusta mucho éste restaurante. Lo recomiendo al 100%, el ambiente, la comida y el servicio son excelentes.',
    bodyEn: 'I really love this restaurant. I recommend it 100%, the atmosphere, the food and the service are excellent.',
    source: 'google', status: 'approved', isFeatured: true, sortOrder: 8,
  },
  {
    authorName: 'Luis Carmona',
    authorCity: 'Sonoma County, CA',
    rating: 5,
    bodyEs: 'Muy ordenado. Buen servicio, la comida deliciosa, la atención excelente, todo muy limpio. Lo único es el ruido adentro que se dispersa por todos lados. Necesitan poner aislantes de ruido en los techos.',
    bodyEn: 'Very organized. Great service, delicious food, excellent attention, everything very clean. The only thing is the noise inside that echoes everywhere. They need to add sound insulation to the ceilings.',
    source: 'google', status: 'approved', isFeatured: true, sortOrder: 7,
  },
  {
    authorName: 'Ana Anaya',
    authorCity: 'Sonoma County, CA',
    rating: 5,
    bodyEs: 'Excelente servicio de Flor, la mesera muy amable. Disfrutamos mucho la comida.',
    bodyEn: 'Excellent service from Flor, the waitress was very friendly. We really enjoyed the food.',
    source: 'google', status: 'approved', isFeatured: false, sortOrder: 6,
  },
  {
    authorName: 'Alejandra Gutierrez',
    authorCity: 'Sonoma County, CA',
    rating: 5,
    bodyEs: 'Muy buen servicio de parte de Flor, todo muy rico y muy rápido.',
    bodyEn: 'Great service from Flor, everything delicious and very fast.',
    source: 'google', status: 'approved', isFeatured: false, sortOrder: 5,
  },
]

let inserted = 0
for (const r of newReviews) {
  await db.insert(reviews).values(r)
  console.log('✅', r.authorName)
  inserted++
}
console.log(`\nListo — ${inserted} reseñas insertadas`)
process.exit(0)
