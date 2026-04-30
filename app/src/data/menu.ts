import type { MenuCategory, MenuItem } from '@/types/domain'

// Categorías ordenadas como aparecen en el PDF oficial.
export const categories: MenuCategory[] = [
  { id: 'appetizers',    slug: 'appetizers',    order: 1,  name: { es: 'Botanas',          en: 'Appetizers' } },
  { id: 'sides',         slug: 'sides',         order: 2,  name: { es: 'Acompañamientos', en: 'Sides' } },
  { id: 'a-la-carte',    slug: 'a-la-carte',    order: 3,  name: { es: 'A la carte',       en: 'À la Carte' } },
  { id: 'healthy',       slug: 'healthy',       order: 4,  name: { es: 'Saludables',       en: 'Healthy Style' } },
  { id: 'specialties',   slug: 'specialties',   order: 5,  name: { es: 'Especialidades',   en: 'House Specialties' } },
  { id: 'soups',         slug: 'soups',         order: 6,  name: { es: 'Sopas',            en: 'Soups' } },
  { id: 'tacos',         slug: 'tacos',         order: 7,  name: { es: 'Tacos',            en: 'Tacos' } },
  { id: 'burritos',      slug: 'burritos',      order: 8,  name: { es: 'Burritos',         en: 'Burritos' } },
  { id: 'small-combos',  slug: 'small-combos',  order: 9,  name: { es: 'Combos pequeños', en: 'Small Combos' } },
  { id: 'large-combos',  slug: 'large-combos',  order: 10, name: { es: 'Combos grandes',   en: 'Large Combos' } },
  { id: 'seafood-combos',slug: 'seafood-combos',order: 11, name: { es: 'Combos de mariscos',en: 'Seafood Combos' } },
  { id: 'meats',         slug: 'meats',         order: 12, name: { es: 'Carnes',           en: 'Steak & Meats' } },
  { id: 'seafood',       slug: 'seafood',       order: 13, name: { es: 'Mariscos',         en: 'Seafood' } },
  { id: 'breakfast',     slug: 'breakfast',     order: 14, name: { es: 'Desayunos',        en: 'Breakfast' } },
  { id: 'kids',          slug: 'kids',          order: 15, name: { es: 'Niños',           en: 'Kids' } },
  { id: 'desserts',      slug: 'desserts',      order: 16, name: { es: 'Postres',          en: 'Desserts' } }
]

// Helper para crear items con ergonomía
const I = (
  id: string, categoryId: string, nameEs: string, nameEn: string, price: number | null,
  descEs?: string, descEn?: string, tags: MenuItem['tags'] = [], photo?: string
): MenuItem => ({
  id, slug: id, categoryId,
  name: { es: nameEs, en: nameEn },
  description: descEs || descEn ? { es: descEs ?? nameEs, en: descEn ?? nameEn } : undefined,
  price, photo, tags
})

export const menuItems: MenuItem[] = [
  // ============ APPETIZERS ============
  I('cheese-quesadilla',         'appetizers', 'Quesadilla de queso',           'Cheese Quesadilla',         11.00, 'Con guacamole al lado', 'Served with side of guacamole', ['vegetarian']),
  I('meat-quesadilla',           'appetizers', 'Quesadilla con carne',          'Meat Quesadilla',           15.50, 'Con guacamole al lado', 'Served with side of guacamole'),
  I('cheese-quesadilla-plate',   'appetizers', 'Plato de quesadilla de queso',  'Cheese Quesadilla Plate',   18.75, 'Con arroz y frijoles refritos, sin carne', 'With rice and refried beans, no meat', ['vegetarian']),
  I('meat-quesadilla-plate',     'appetizers', 'Plato de quesadilla con carne', 'Meat Quesadilla Plate',     21.75, 'Con arroz y frijoles refritos', 'With rice and refried beans'),
  I('super-quesadilla-cheese',   'appetizers', 'Súper quesadilla de queso',     'Super Quesadilla with Cheese',15.00, undefined, undefined, ['vegetarian']),
  I('super-quesadilla-meat',     'appetizers', 'Súper quesadilla con carne',    'Super Quesadilla with Meat', 19.75),
  I('regular-nachos',            'appetizers', 'Nachos regulares',              'Regular Nachos',            12.00, 'Chips, frijoles refritos, queso, pico de gallo', 'Chips, refried beans, cheese, pico de gallo', ['vegetarian']),
  I('regular-nachos-meat',       'appetizers', 'Nachos regulares con carne',    'Regular Nachos with Meat',  14.75, 'Chips, frijoles refritos, queso, pico de gallo', 'Chips, refried beans, cheese, pico de gallo'),
  I('super-nachos',              'appetizers', 'Súper nachos',                  'Super Nachos',              16.25, undefined, undefined, ['popular','vegetarian'], '/assets/gallery/super-nachos.webp'),
  I('super-nachos-meat',         'appetizers', 'Súper nachos con carne',        'Super Nachos with Meat',    18.75, undefined, undefined, ['popular']),
  I('california-nachos',         'appetizers', 'California nachos',             'California Nachos',         19.75, 'Con papas fritas y carne', 'With french fries and meat'),
  I('chile-con-queso',           'appetizers', 'Chile con queso',               'Chile con Queso',           17.25, 'Queso fundido con chorizo y jalapeño', 'Melted cheese with chorizo and jalapeño', ['spicy']),
  I('queso-fundido',             'appetizers', 'Queso fundido',                 'Queso Fundido',             14.75, 'Queso fundido con champiñones y jalapeño', 'Melted cheese with mushrooms and jalapeño', ['vegetarian']),
  I('chimichanguitas',           'appetizers', 'Chimichanguitas (6 pzas)',      'Chimichanguitas (6 pcs)',   15.50),
  I('sample-platter',            'appetizers', 'Botana variada',                'Sample Platter',            24.00, 'Quesadilla, 4 taquitos enrollados y nachos', 'Quesadilla, 4 rolled taquitos and nachos'),

  // ============ SIDES ============
  I('table-side-guac',  'sides', 'Guacamole en mesa', 'Table Side Guacamole', 20.00, undefined, undefined, ['vegetarian']),
  I('small-guac',       'sides', 'Guacamole chico',   'Small Guacamole',       8.50, undefined, undefined, ['vegetarian']),
  I('large-guac',       'sides', 'Guacamole grande',  'Large Guacamole',      12.75, undefined, undefined, ['vegetarian']),
  I('cheese-sour-cream','sides', 'Queso o crema',     'Cheese or Sour Cream',  3.00),
  I('corn-tortilla',    'sides', 'Tortillas de maíz (4)', 'Corn Tortillas (4)', 3.50, undefined, undefined, ['vegetarian']),
  I('flour-tortilla',   'sides', 'Tortillas de harina (4)', 'Flour Tortillas (4)', 3.50, undefined, undefined, ['vegetarian']),
  I('any-extra',        'sides', 'Cualquier extra',   'Any Extra',             2.50),

  // ============ A LA CARTE ============
  I('enchilada',        'a-la-carte', 'Enchilada (queso o carne)',  'Enchilada (Cheese or Meat)',   7.75),
  I('tostada-meat',     'a-la-carte', 'Tostada (cualquier carne)',  'Tostada (Any Meat)',          10.75),
  I('tostada-mexicana', 'a-la-carte', 'Tostada mexicana',           'Tostada Mexicana',            11.75),
  I('chile-relleno',    'a-la-carte', 'Chile relleno',              'Chile Relleno',               10.25, undefined, undefined, ['vegetarian'], '/assets/gallery/chile-relleno.webp'),
  I('rice-beans',       'a-la-carte', 'Arroz y frijoles',           'Rice & Beans',                 9.50, undefined, undefined, ['vegetarian']),
  I('taquitos',         'a-la-carte', 'Taquitos (pollo o res)',     'Taquitos (Chicken or Beef)',  14.50),
  I('tamal',            'a-la-carte', 'Tamal (pollo o cerdo)',      'Tamale (Chicken or Pork)',     7.00),
  I('sope',             'a-la-carte', 'Sope (cualquier carne)',     'Sope (Any Meat)',              9.00),

  // ============ HEALTHY ============
  I('house-salad',          'healthy', 'Ensalada de la casa',       'House Salad',                       9.50, undefined, undefined, ['vegetarian']),
  I('house-salad-chicken',  'healthy', 'Ensalada con pollo',        'House Salad with Chicken Breast',  19.75),
  I('veggie-quesadilla',    'healthy', 'Quesadilla vegetariana',    'Veggie Quesadilla',                15.50, 'Queso, vegetales asados, guacamole al lado', 'Cheese, grilled veggies, side of guacamole', ['vegetarian']),
  I('shrimp-burrito-wrap',  'healthy', 'Wrap de camarón',           'Shrimp Burrito Wrap',              19.75, 'Wrap de lechuga (sin tortilla), camarón, arroz, frijoles, guacamole, crema y queso', 'Lettuce wrap, shrimp, rice, beans, guacamole, sour cream and cheese', ['seafood','gluten_free']),
  I('meat-burrito-wrap',    'healthy', 'Wrap de carne',             'Meat Burrito Wrap',                16.75, 'Wrap de lechuga, cualquier carne, arroz, frijoles, guacamole, crema y queso', 'Lettuce wrap, any meat, rice, beans, guacamole, sour cream and cheese', ['gluten_free']),
  I('cici-special',         'healthy', 'Cici Special',              'Cici Special',                     19.75, 'Lechuga, camarón, frijoles enteros y guacamole', 'Lettuce, shrimp, whole beans and guacamole', ['seafood','gluten_free']),
  I('ensalada-apache',      'healthy', 'Ensalada Apache',           'Apache Salad',                     19.99, 'Pechuga de pollo asada, lechuga, espinaca, jitomate, aguacate, zanahoria y tortilla strips', 'Grilled chicken breast, lettuce, spinach, tomato, avocado, carrot and tortilla strips'),
  I('vegan-burrito-bowl',   'healthy', 'Vegan burrito bowl',        'Vegan Burrito Bowl',               18.75, 'Arroz integral, frijoles negros, vegetales asados, fajita veggies, lechuga, espinaca, guacamole y jitomate', 'Brown rice, black beans, roasted veggies, fajita veggies, lettuce, spinach, guacamole and tomato', ['vegetarian','new']),

  // ============ HOUSE SPECIALTIES ============
  I('trio-enchiladas',      'specialties', 'Trío de enchiladas',          'Trio Enchiladas',         21.75, 'Mole, roja y verde con queso, lechuga y aguacate', 'Mole, red and green with cheese, lettuce and avocado', ['popular']),
  I('torta',                'specialties', 'Torta',                        'Torta',                   16.00, 'Carne a elección en pan mexicano', 'Choice of meat on Mexican bread'),
  I('torta-milanesa',       'specialties', 'Torta de milanesa',           'Torta Milanesa',           19.25),
  I('taco-salad',           'specialties', 'Ensalada de taco',            'Taco Salad',               18.75, 'Arroz, frijoles, lechuga, jitomate, queso, crema, guacamole', 'Rice, beans, lettuce, tomato, cheese, sour cream, guacamole', ['popular'], '/assets/gallery/taco-salad-served.webp'),
  I('shrimp-taco-salad',    'specialties', 'Ensalada de taco con camarón','Shrimp Taco Salad',        20.75, undefined, undefined, ['seafood']),
  I('rajas-con-crema',      'specialties', 'Rajas con crema',             'Rajas con Crema',          25.50, 'Pechuga de pollo en crema, champiñones, cebolla, chile poblano', 'Chicken breast in cream, mushrooms, onion, poblano pepper'),
  I('tbone-mexican',        'specialties', 'T-Bone estilo mexicano',      'T-Bone Mexican Style',     36.00, 'Con cebolla asada y champiñones', 'With grilled onion and mushrooms'),
  I('tostada-raspada',      'specialties', 'Tostada raspada grande',      'Big Tostada Raspada',      25.99, 'Tostada grande con carne, frijoles, lechuga, queso, jitomate y aguacate', 'Big tostada with meat, beans, lettuce, cheese, tomato and avocado', ['popular'], '/assets/gallery/tostada-raspada.webp'),

  // ============ SOUPS ============
  I('albondigas',     'soups', 'Albóndigas',     'Meatball Soup', 19.50, 'Albóndigas y vegetales', 'Meatballs and vegetables'),
  I('menudo',         'soups', 'Menudo',         'Menudo',        19.50, 'Sólo sábado y domingo', 'Saturday and Sunday only'),
  I('tortilla-soup',  'soups', 'Sopa de tortilla','Tortilla Soup', 19.75, 'Tortilla strips, pollo, zanahoria, aguacate, papa y queso', 'Tortilla strips, chicken, carrot, avocado, potato and cheese'),
  I('birria-soup',    'soups', 'Birria',         'Birria',        27.00, 'Con arroz y frijoles. Sólo sábado y domingo', 'With rice and beans. Saturday and Sunday only'),
  I('siete-mares-soup','soups','Sopa siete mares','Siete Mares Soup', 33.50, 'Pulpo, camarón, almejas, callo, pescado, cangrejo, papa y zanahoria', 'Octopus, shrimp, clams, scallops, fish, crab, potato and carrot', ['seafood'], '/assets/gallery/siete-mares-soup.webp'),

  // ============ TACOS ============
  I('taco-meat',      'tacos', 'Taco (cualquier carne)', 'Taco (any meat)',  5.75),
  I('taco-wrap',      'tacos', 'Taco wrap',              'Taco Wrap',         7.00),
  I('fish-taco',      'tacos', 'Taco de pescado',        'Fish Taco (Swai)',  6.75, undefined, undefined, ['seafood']),
  I('fish-taco-wrap', 'tacos', 'Wrap de pescado',        'Fish Taco Wrap',    7.50, undefined, undefined, ['seafood']),
  I('shrimp-taco',    'tacos', 'Taco de camarón',        'Shrimp Taco',       8.00, undefined, undefined, ['seafood']),
  I('shrimp-taco-wrap','tacos','Wrap de camarón',        'Shrimp Taco Wrap',  8.75, undefined, undefined, ['seafood']),
  I('baja-fish-taco', 'tacos', 'Baja fish taco',         'Baja Fish Taco',    8.75, 'Pescado empanizado, tortilla de maíz, coleslaw, mil islas, pico de gallo', 'Breaded fish, corn tortilla, coleslaw, thousand island, pico de gallo', ['seafood']),

  // ============ BURRITOS ============
  I('burrito-basic',     'burritos', 'Burrito básico',        'Basic Burrito',         11.00, 'Frijoles, arroz y queso', 'Beans, rice and cheese', ['vegetarian']),
  I('burrito-regular',   'burritos', 'Burrito regular',       'Regular Burrito',       14.75, 'Carne, arroz, frijoles enteros, salsa de burrito', 'Meat, rice, whole beans, burrito sauce'),
  I('burrito-super',     'burritos', 'Burrito súper',         'Super Burrito',         16.25, '+ queso, crema y guacamole', '+ cheese, sour cream and guacamole', ['popular'], '/assets/gallery/burrito-served.webp'),
  I('burrito-super-shrimp','burritos','Burrito súper de camarón','Super Shrimp Burrito',21.50, 'Camarón, arroz, frijoles, queso, crema, guacamole y salsa', 'Shrimp, rice, beans, cheese, sour cream, guacamole and sauce', ['seafood']),
  I('burrito-macho',     'burritos', 'Burrito Macho',         'Macho Burrito',         19.00, 'Carne, frijoles, arroz, queso, guacamole, crema, jitomate, cebolla, cilantro, salsa', 'Meat, beans, rice, cheese, guacamole, sour cream, tomato, onion, cilantro, salsa', ['popular']),
  I('burrito-padre',     'burritos', 'Burrito Padre Macho',   'Padre Macho Burrito',   25.00, 'Doble cantidad del Macho', 'Double size of Macho'),
  I('burrito-gordo',     'burritos', 'Burrito Gordo Macho',   'Gordo Macho Burrito',   54.00, 'Triple cantidad del Macho', 'Triple size of Macho'),
  I('burrito-veg',       'burritos', 'Burrito vegetariano',   'Vegetarian Burrito',    14.00, 'Arroz, frijoles, lechuga, queso, crema, guacamole, salsa', 'Rice, beans, lettuce, cheese, sour cream, guacamole, salsa', ['vegetarian']),
  I('burrito-veg-mas',   'burritos', 'Burrito vegetariano más','Vegetarian Plus Burrito',15.75, '+ brócoli, coliflor, calabacita, zanahoria', '+ broccoli, cauliflower, zucchini, carrot', ['vegetarian']),
  I('burrito-relleno',   'burritos', 'Burrito relleno',       'Stuffed Burrito',       16.75, 'Chile relleno + arroz, frijoles, queso, crema, guacamole', 'Chile relleno + rice, beans, cheese, sour cream, guacamole'),
  I('burrito-california','burritos', 'California burrito',    'California Burrito',    16.75, 'Carne, papas fritas, arroz, frijoles, crema, guacamole, queso', 'Meat, french fries, rice, beans, sour cream, guacamole, cheese'),
  I('burrito-bowl',      'burritos', 'Burrito bowl',          'Burrito Bowl',          16.75, 'Arroz, frijoles, jitomate, lechuga, carne, queso, crema, guacamole, pico de gallo', 'Rice, beans, tomato, lettuce, meat, cheese, sour cream, guacamole, pico de gallo'),
  I('burrito-fajita',    'burritos', 'Fajita burrito',        'Fajita Burrito',        16.00, 'Pimiento, cebolla, jitomate, champiñones, frijoles, arroz, queso, crema, guacamole', 'Bell pepper, onion, tomato, mushrooms, beans, rice, cheese, sour cream, guacamole'),
  I('chimichanga',       'burritos', 'Chimichanga',           'Chimichanga',           17.50),

  // ============ SMALL COMBOS ============
  I('combo-1', 'small-combos', 'Combo #1 · Enchilada',     'Combo #1 · Enchilada',     17.75),
  I('combo-2', 'small-combos', 'Combo #2 · Taco',          'Combo #2 · Taco',          17.75),
  I('combo-3', 'small-combos', 'Combo #3 · Chile relleno', 'Combo #3 · Chile Relleno', 18.75),
  I('combo-4', 'small-combos', 'Combo #4 · Tostada',       'Combo #4 · Tostada',       18.75),

  // ============ LARGE COMBOS ============
  I('combo-5',  'large-combos', 'Combo #5 · Dos enchiladas',          'Combo #5 · Two Enchiladas',         21.50),
  I('combo-6',  'large-combos', 'Combo #6 · Enchilada y chile relleno','Combo #6 · Enchilada & Chile Relleno',22.50),
  I('combo-7',  'large-combos', 'Combo #7 · Enchilada y taco',         'Combo #7 · Enchilada & Taco',       21.50),
  I('combo-8',  'large-combos', 'Combo #8 · Dos tacos',                'Combo #8 · Two Tacos',              21.00),
  I('combo-9',  'large-combos', 'Combo #9 · Carne asada',              'Combo #9 · Carne Asada',            22.99),
  I('combo-10', 'large-combos', 'Combo #10 · Steak picado',            'Combo #10 · Steak Picado',          28.00),
  I('combo-11', 'large-combos', 'Combo #11 · Súper burrito',           'Combo #11 · Super Burrito',         22.75),
  I('combo-12', 'large-combos', 'Combo #12 · Taco y chile relleno',    'Combo #12 · Taco & Chile Relleno',  22.00),
  I('combo-13', 'large-combos', 'Combo #13 · Enchilada y tostada',     'Combo #13 · Enchilada & Tostada',   22.50),
  I('combo-14', 'large-combos', 'Combo #14 · Dos tamales',             'Combo #14 · Two Tamales',           21.50),
  I('combo-15', 'large-combos', 'Combo #15 · Chile verde',             'Combo #15 · Chile Verde',           27.00, undefined, undefined, ['spicy']),
  I('combo-16', 'large-combos', 'Combo #16 · Carnitas',                'Combo #16 · Carnitas Plate',        24.75),
  I('combo-17', 'large-combos', 'Combo #17 · Dos flautas',             'Combo #17 · Two Flautas',           22.50),
  I('combo-18', 'large-combos', 'Combo #18 · Chimichanga',             'Combo #18 · Chimichanga',           22.50),
  I('combo-19', 'large-combos', 'Combo #19 · Enchilada de mole',       'Combo #19 · Mole Enchilada',        18.75),
  I('combo-20', 'large-combos', 'Combo #20 · Dos enchiladas mole',     'Combo #20 · Two Mole Enchiladas',   23.75),
  I('combo-21', 'large-combos', 'Combo #21 · Tamal',                   'Combo #21 · Tamale Combo',          18.50),
  I('combo-22', 'large-combos', 'Combo #22 · Chimichanga macho',       'Combo #22 · Macho Chimichanga',     25.50),
  I('combo-23', 'large-combos', 'Combo #23 · Dos enchiladas Mi Pueblo','Combo #23 · Two Enchiladas Mi Pueblo',23.75),
  I('combo-24', 'large-combos', 'Combo #24 · Tamal y enchilada',       'Combo #24 · Tamale & Enchilada',    22.75),
  I('combo-25', 'large-combos', 'Combo #25 · Tres en uno',             'Combo #25 · Three Item Combo',      25.00, 'Taco + enchilada + tamal', 'Taco + enchilada + tamale'),
  I('combo-26', 'large-combos', 'Combo #26 · Sope',                    'Combo #26 · Sope Combo',            19.75),
  I('combo-27', 'large-combos', 'Combo #27 · Dos chiles rellenos',     'Combo #27 · Two Chiles Rellenos',   23.75),
  I('combo-28', 'large-combos', 'Combo #28 · Tamal y chile relleno',   'Combo #28 · Tamale & Chile Relleno',22.75),
  I('combo-29', 'large-combos', 'Combo #29 · Taquitos',                'Combo #29 · Taquitos Combo',        22.75),
  I('combo-30', 'large-combos', 'Combo #30 · Dos sopes',               'Combo #30 · Two Sopes',             22.75),
  I('combo-31', 'large-combos', 'Combo #31 · Taco y tamal',            'Combo #31 · Taco & Tamale',         21.50),
  I('combo-32', 'large-combos', 'Combo #32 · Tres item combo',         'Combo #32 · Three Item Combo',      25.75, 'Taco + enchilada + chile relleno', 'Taco + enchilada + chile relleno'),

  // ============ SEAFOOD COMBOS ============
  I('seafood-combo-33','seafood-combos','Un platillo de mariscos',     'One Seafood Item',  18.00, undefined, undefined, ['seafood']),
  I('seafood-combo-34','seafood-combos','Dos platillos de mariscos',    'Two Seafood Items', 23.75, undefined, undefined, ['seafood']),
  I('seafood-combo-35','seafood-combos','Tres platillos de mariscos',   'Three Seafood Items',26.75,undefined, undefined, ['seafood']),
  I('seafood-combo-36','seafood-combos','5 street tacos de mariscos',   'Five Street Tacos', 22.75, undefined, undefined, ['seafood']),

  // ============ MEATS ============
  I('carne-azteca',         'meats', 'Carne Azteca',          'Carne Azteca',         30.75, 'Arrachera, jitomate, queso mexicano, champiñones, cebolla, nopal asado', 'Skirt steak, tomato, Mexican cheese, mushrooms, onion, grilled cactus'),
  I('molcajete',            'meats', 'Molcajete',             'Molcajete',            36.00, 'Arrachera, camarón, pollo, queso fresco, cebolla, chorizo, jitomate, champiñones, nopal en molcajete', 'Skirt steak, shrimp, chicken, queso fresco, onion, chorizo, tomato, mushrooms, cactus in stone bowl', ['popular','seafood'], '/assets/gallery/molcajete-bowl.webp'),
  I('fajitas-mix',          'meats', 'Fajitas mixtas',        'Fajitas Mix',          31.50, 'Arrachera, pollo, camarón, cebolla cambray, jitomate, pimientos, champiñones, guacamole, crema', 'Skirt steak, chicken, shrimp, scallions, tomato, peppers, mushrooms, guacamole, sour cream', ['popular','seafood'], '/assets/gallery/alambre-meal.webp'),
  I('fajitas-shrimp',       'meats', 'Fajitas de camarón',    'Shrimp Fajitas',       28.75, undefined, undefined, ['seafood']),
  I('fajitas-chx-beef',     'meats', 'Fajitas de pollo o res','Chicken or Beef Fajitas',28.00),
  I('arrachera',            'meats', 'Arrachera',             'Arrachera',            31.75, 'BBQ steak arrachera + 1 enchilada, arroz, frijoles, pimiento, cebolla', 'BBQ skirt steak + 1 enchilada, rice, beans, peppers, onion'),
  I('carne-asada-mp',       'meats', 'Carne asada Mi Pueblo', 'Carne Asada Mi Pueblo',28.00, 'Arrachera con pimientos asados, cebollas y jalapeños', 'Skirt steak with grilled peppers, onions and jalapeños', ['popular']),
  I('steak-ranchero',       'meats', 'Steak ranchero',        'Steak Ranchero',       27.75, 'Jalapeño, cebolla, jitomate, champiñones y cilantro', 'Jalapeño, onion, tomato, mushrooms and cilantro', ['spicy']),
  I('arroz-con-pollo',      'meats', 'Arroz con pollo',       'Arroz con Pollo',      27.75, 'Pollo sobre arroz con queso fundido', 'Chicken over rice with melted cheese'),
  I('alambre',              'meats', 'Alambre',               'Alambre',              28.75, 'Arrachera y chorizo con cebolla, jitomate, pimiento, champiñones y queso', 'Skirt steak and chorizo with onion, tomato, peppers, mushrooms and cheese', undefined, '/assets/gallery/alambre-meal.webp'),
  I('chile-colorado',       'meats', 'Chile colorado',        'Chile Colorado',       27.75, 'Cerdo en salsa roja', 'Pork in red sauce', ['spicy']),
  I('pollo-plancha',        'meats', 'Pollo a la plancha',    'Grilled Chicken',      25.75, 'Pechuga de pollo asada, pimiento y cebolla', 'Grilled chicken breast, pepper and onion'),
  I('milanesa',             'meats', 'Milanesa',              'Milanesa',             26.50, 'Milanesa de res, arroz y frijoles', 'Beef milanesa, rice and beans'),
  I('pollo-con-crema',      'meats', 'Pollo con crema',       'Pollo con Crema',      25.75, 'Pechuga de pollo en crema', 'Chicken breast in cream sauce', undefined, '/assets/gallery/pollo-con-crema.webp'),

  // ============ SEAFOOD ============
  I('tampiquena',         'seafood', 'Tampiqueña',           'Tampiqueña',            31.00, 'Arrachera y camarón con jitomate, champiñones y cebolla cambray', 'Skirt steak and shrimp with tomato, mushrooms and scallions', ['seafood']),
  I('camarones-steak',    'seafood', 'Camarones con steak',  'Shrimp with Steak',     28.50, 'Arrachera y camarón con pimiento, cebolla y champiñones', 'Skirt steak and shrimp with peppers, onion and mushrooms', ['seafood','popular'], '/assets/gallery/camarones-con-steak.webp'),
  I('camarones-diabla',   'seafood', 'Camarones a la diabla','Camarones a la Diabla', 27.75, 'Camarón con pimiento, cebolla, champiñones y salsa diabla', 'Shrimp with peppers, onion, mushrooms and diabla sauce', ['seafood','spicy']),
  I('camarones-mp',       'seafood', 'Camarones Mi Pueblo',  'Camarones Mi Pueblo',   27.75, undefined, undefined, ['seafood']),
  I('camarones-crema',    'seafood', 'Camarones con crema',  'Shrimp in Cream',       27.75, undefined, undefined, ['seafood']),
  I('camarones-mojo-ajo', 'seafood', 'Camarones al mojo de ajo','Garlic Shrimp',       27.75, undefined, undefined, ['seafood']),
  I('filete-pescado',     'seafood', 'Filete de pescado',    'Fish Fillet',           27.75, 'Filete asado con arroz y frijoles', 'Grilled fillet with rice and beans', ['seafood']),
  I('burrito-marinero',   'seafood', 'Burrito marinero',     'Marinero Burrito',      25.75, undefined, undefined, ['seafood']),
  I('seafood-burrito',    'seafood', 'Seafood burrito',      'Seafood Burrito',       25.75, undefined, undefined, ['seafood']),
  I('seafood-quesadilla', 'seafood', 'Quesadilla de mariscos','Seafood Quesadilla',   24.00, undefined, undefined, ['seafood']),
  I('camarones-tocino',   'seafood', 'Camarones con tocino', 'Bacon-wrapped Shrimp',  27.75, undefined, undefined, ['seafood']),
  I('camarones-empanizados','seafood','Camarones empanizados','Breaded Shrimp',       27.75, undefined, undefined, ['seafood']),
  I('plato-cancun',       'seafood', 'Plato Cancún',        'Cancún Plate',          27.75, undefined, undefined, ['seafood']),
  I('mojarra-frita',      'seafood', 'Mojarra frita',        'Fried Mojarra',         27.50, 'Mojarra entera frita, arroz y frijoles', 'Whole fried tilapia, rice and beans', ['seafood']),
  I('camarones-rancheros','seafood', 'Camarones rancheros',  'Rancheros Shrimp',      27.75, undefined, undefined, ['seafood','spicy']),
  I('camarones-colima',   'seafood', 'Camarones Colima',     'Camarones Colima',      31.00, 'Camarón, pulpo, callo de hacha, cebolla, jitomate, jalapeños y cilantro', 'Shrimp, octopus, scallops, onion, tomato, jalapeños and cilantro', ['seafood','spicy']),
  I('caldo-camaron',      'seafood', 'Caldo de camarón',     'Shrimp Soup',           24.75, undefined, undefined, ['seafood']),
  I('siete-mares',        'seafood', 'Siete Mares',          'Siete Mares',           33.50, 'Sopa de mariscos surtidos', 'Mixed seafood soup', ['seafood','popular']),
  I('grilled-salmon',     'seafood', 'Salmón a la parrilla', 'Grilled Salmon',        27.50, 'Con vegetales al vapor y frijoles negros', 'With steamed veggies and black beans', ['seafood']),
  I('cocktail-camaron',   'seafood', 'Cóctel de camarón',    'Shrimp Cocktail',       23.75, undefined, undefined, ['seafood']),
  I('cocktail-campechana','seafood', 'Cóctel campechana',    'Campechana Cocktail',   24.75, 'Camarón y pulpo', 'Shrimp and octopus', ['seafood']),
  I('ceviche-cocktail',   'seafood', 'Cóctel de ceviche',    'Ceviche Cocktail',      23.75, 'Camarón marinado en limón', 'Shrimp marinated in lime', ['seafood']),
  I('tostada-ceviche',    'seafood', 'Tostada de ceviche',   'Ceviche Tostada',       10.75, undefined, undefined, ['seafood']),
  I('tostada-camaron',    'seafood', 'Tostada de camarón',   'Shrimp Tostada',         9.75, undefined, undefined, ['seafood']),

  // ============ BREAKFAST ============
  I('huevos-rancheros', 'breakfast', 'Huevos rancheros',       'Huevos Rancheros',     16.75),
  I('huevos-chorizo',   'breakfast', 'Huevos con chorizo',     'Eggs with Chorizo',    16.75),
  I('huevos-jamon',     'breakfast', 'Huevos con jamón',       'Eggs with Ham',        16.75),
  I('chilaquiles',      'breakfast', 'Chilaquiles',            'Chilaquiles',          16.75, 'Verdes o rojos', 'Green or red'),
  I('machaca',          'breakfast', 'Machaca con huevos',     'Machaca with Eggs',    16.75),
  I('breakfast-burrito','breakfast', 'Burrito de desayuno',    'Breakfast Burrito',    16.75),
  I('veggie-omelet',    'breakfast', 'Omelet vegetariano',     'Veggie Omelet',        16.00, 'Huevo, pimiento, cebolla, champiñón, jitomate, espinaca, queso fundido', 'Egg, pepper, onion, mushroom, tomato, spinach, melted cheese', ['vegetarian']),
  I('chorizo-omelet',   'breakfast', 'Omelet con chorizo',     'Chorizo Omelet',       18.00),

  // ============ KIDS ============
  I('kids-fun',         'kids', 'Kids Fun Meal',                'Kids Fun Meal',           11.99, undefined, undefined, ['kids']),
  I('kids-quesadilla',  'kids', 'Quesadilla',                   'Quesadilla',               9.00, undefined, undefined, ['kids','vegetarian']),
  I('kids-quesadilla-meat','kids','Quesadilla con carne',       'Quesadilla with Meat',    11.99, undefined, undefined, ['kids']),
  I('kids-rice-beans',  'kids', 'Arroz y frijoles',             'Rice and Beans',           9.75, undefined, undefined, ['kids','vegetarian']),
  I('kids-burrito-mini','kids', 'Burrito pequeño',              'Small Burrito',           10.50, undefined, undefined, ['kids']),
  I('kids-burrito-meat','kids', 'Burrito pequeño con carne',    'Small Burrito with Meat', 12.50, undefined, undefined, ['kids']),
  I('kids-mini-nachos', 'kids', 'Mini nachos',                  'Mini Nachos',             10.50, undefined, undefined, ['kids']),
  I('kids-mini-nachos-meat','kids','Mini nachos con carne',     'Mini Nachos with Meat',   12.50, undefined, undefined, ['kids']),
  I('kids-fries',       'kids', 'Papas fritas',                 'French Fries',             6.50, undefined, undefined, ['kids']),
  I('kids-taco',        'kids', 'Kids taco con arroz y frijoles','Kids Taco with Rice & Beans',11.99, undefined, undefined, ['kids']),
  I('kids-nuggets',     'kids', 'Chicken nuggets (6) con papas','Chicken Nuggets (6) with Fries',10.75, undefined, undefined, ['kids']),
  I('kids-burger',      'kids', 'Chico burger con papas',       'Chico Burger with Fries', 11.50, undefined, undefined, ['kids']),

  // ============ DESSERTS ============
  I('flan',          'desserts', 'Flan',                  'Flan',                   8.50, undefined, undefined, ['popular']),
  I('fried-icecream','desserts', 'Helado frito',          'Deep Fried Ice Cream',  13.99),
  I('churros',       'desserts', 'Churros',               'Churros',               15.99, undefined, undefined, ['popular']),
  I('sopapilla',     'desserts', 'Sopapilla',             'Sopapilla',             13.99),
  I('icecream',      'desserts', 'Helado',                'Ice Cream',              9.50)
]
