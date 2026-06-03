import type { MenuCategory, MenuItem } from '@/types/domain'

// Categorías ordenadas como aparecen en el menú físico del restaurante.
export const categories: MenuCategory[] = [
  { id: 'appetizers',    slug: 'appetizers',    order: 1,  name: { es: 'Botanas',           en: 'Appetizers' } },
  { id: 'sides',         slug: 'sides',         order: 2,  name: { es: 'Acompañamientos',   en: 'Sides' } },
  { id: 'a-la-carte',    slug: 'a-la-carte',    order: 3,  name: { es: 'A la carte',        en: 'À la Carte' } },
  { id: 'healthy',       slug: 'healthy',       order: 4,  name: { es: 'Saludables',        en: 'Healthy Style' } },
  { id: 'specialties',   slug: 'specialties',   order: 5,  name: { es: 'Especialidades',    en: 'House Specialties' } },
  { id: 'soups',         slug: 'soups',         order: 6,  name: { es: 'Sopas del día',     en: 'Soup of the Day' } },
  { id: 'tacos',         slug: 'tacos',         order: 7,  name: { es: 'Tacos',             en: 'Tacos' } },
  { id: 'burritos',      slug: 'burritos',      order: 8,  name: { es: 'Burritos',          en: 'Burritos' } },
  { id: 'small-combos',  slug: 'small-combos',  order: 9,  name: { es: 'Combos pequeños',   en: 'Small Combos' } },
  { id: 'large-combos',  slug: 'large-combos',  order: 10, name: { es: 'Combos grandes',    en: 'Large Combos' } },
  { id: 'seafood-combos',slug: 'seafood-combos',order: 11, name: { es: 'Combos de mariscos',en: 'Seafood Combos' } },
  { id: 'meats',         slug: 'meats',         order: 12, name: { es: 'Carnes',            en: 'Steak & Meats' } },
  { id: 'seafood',       slug: 'seafood',       order: 13, name: { es: 'Mariscos',          en: 'Seafood' } },
]

// Helper para crear items con ergonomía
const I = (
  id: string, categoryId: string, nameEs: string, nameEn: string, price: number | null,
  descEs?: string, descEn?: string, tags: MenuItem['tags'] = []
): MenuItem => ({
  id, slug: id, categoryId,
  name: { es: nameEs, en: nameEn },
  description: descEs || descEn ? { es: descEs ?? nameEs, en: descEn ?? nameEn } : undefined,
  price, tags
})

export const menuItems: MenuItem[] = [
  // ============ APPETIZERS ============
  I('cheese-quesadilla',         'appetizers', 'Quesadilla de queso',           'Cheese Quesadilla',         11.39, 'Con guacamole al lado', 'With Guacamole on the side'),
  I('meat-quesadilla',           'appetizers', 'Quesadilla con carne',          'Meat Quesadilla',           16.56, 'Con guacamole al lado', 'With Guacamole on the side'),
  I('cheese-quesadilla-plate',   'appetizers', 'Plato de quesadilla de queso',  'Cheese Quesadilla Plate',   19.67, 'Con arroz y frijoles refritos, sin carne', 'With Rice & Refried Beans, no meat'),
  I('meat-quesadilla-plate',     'appetizers', 'Plato de quesadilla con carne', 'Meat Quesadilla Plate',     22.77, 'Con arroz y frijoles refritos', 'With Rice & Refried Beans'),
  I('super-quesadilla-cheese',   'appetizers', 'Súper quesadilla de queso',     'Super Quesadilla with Cheese',16.04),
  I('super-quesadilla-meat',     'appetizers', 'Súper quesadilla con carne',    'Super Quesadilla with Meat', 24.76),
  I('regular-nachos',            'appetizers', 'Nachos regulares',              'Regular Nachos',            12.94, 'Chips, frijoles refritos, queso, pico de gallo', 'Chips, Refried Beans, Cheese, & Pico de Gallo'),
  I('regular-nachos-meat',       'appetizers', 'Nachos regulares con carne',    'Regular Nachos with Meat',  15.78, 'Chips, frijoles refritos, queso, pico de gallo', 'Chips, Refried Beans, Cheese, & Pico de Gallo'),
  I('super-nachos',              'appetizers', 'Súper nachos (sin carne)',       'Super Nachos (no meat)',    17.08),
  I('super-nachos-meat',         'appetizers', 'Súper nachos con carne',        'Super Nachos with Meat',    19.92, undefined, undefined, ['popular']),
  I('california-nachos',         'appetizers', 'California nachos',             'California Nachos',         20.70, 'Con papas fritas y carne', 'With Fries & Meat'),
  I('chile-con-queso',           'appetizers', 'Chile con queso',               'Chile con Queso',           18.11, 'Queso fundido con chorizo y jalapeño', 'Melted Cheese with Chorizo and Jalapeño', ['spicy']),
  I('queso-fundido',             'appetizers', 'Queso fundido',                 'Queso Fundido',             15.27, 'Queso fundido con champiñones y jalapeño', 'Melted Cheese with Mushrooms and Jalapeño'),
  I('chimichanguitas',           'appetizers', 'Chimichanguitas (6 pzas)',      'Chimichanguitas (6 pieces)',16.56),
  I('sample-platter',            'appetizers', 'Botana variada',                'Sample Platter',            25.00, 'Quesadilla, 4 taquitos enrollados y nachos', 'Quesadilla, 4 rolled Taquitos & Nachos'),

  // ============ SIDES ============
  I('table-side-guac',  'sides', 'Guacamole en mesa',       'Table Side Guacamole', 20.70),
  I('small-guac',       'sides', 'Guacamole chico',         'Small Guacamole',       8.80),
  I('large-guac',       'sides', 'Guacamole grande',        'Large Guacamole',      13.20),
  I('cheese-sour-cream','sides', 'Queso o crema',           'Cheese or Sour Cream',  3.11),
  I('corn-tortilla',    'sides', 'Tortillas de maíz (4)',   'Corn Tortilla (4)',     3.62),
  I('flour-tortilla',   'sides', 'Tortillas de harina (4)', 'Flour Tortilla (4)',    3.62),
  I('any-extra',        'sides', 'Cualquier extra',         'Any Extra',             2.59),

  // ============ A LA CARTE ============
  I('enchilada',        'a-la-carte', 'Enchilada (queso o carne)',  'Enchilada (Cheese or Meat)',   8.02),
  I('tostada-meat',     'a-la-carte', 'Tostada (cualquier carne)',  'Tostada (Any Meat)',          11.39),
  I('tostada-mexicana', 'a-la-carte', 'Tostada mexicana',           'Tostada Mexicana',            12.42),
  I('chile-relleno',    'a-la-carte', 'Chile relleno',              'Chile Relleno',               10.87),
  I('rice-beans',       'a-la-carte', 'Arroz y frijoles',           'Rice & Beans',                 9.83),
  I('taquitos',         'a-la-carte', 'Taquitos (pollo o res)',     'Taquitos (Chicken or Beef)',  15.53),
  I('tamal',            'a-la-carte', 'Tamal (pollo o cerdo)',      'Tamal (Chicken or Pork)',      7.50),
  I('sope',             'a-la-carte', 'Sope (cualquier carne)',     'Sope (Any Meat)',              9.32),

  // ============ HEALTHY ============
  I('house-salad',          'healthy', 'Ensalada de la casa',       'House Salad',                       9.83),
  I('house-salad-chicken',  'healthy', 'Ensalada con pollo',        'House Salad with Chicken Breast',  20.44),
  I('veggie-quesadilla',    'healthy', 'Quesadilla de vegetales',   'Veggie Quesadilla',                16.04, 'Queso, vegetales asados, guacamole al lado', 'Cheese, with grilled vegetables & guacamole on the side'),
  I('shrimp-burrito-wrap',  'healthy', 'Wrap de camarón',           'Shrimp Burrito Wrap',              20.70, 'Wrap de lechuga (sin tortilla), camarón, arroz, frijoles, guacamole, crema y queso', 'Lettuce wrap (no tortilla), Shrimp, Rice, Whole Beans, Guacamole, Sour Cream & Cheese', ['seafood']),
  I('meat-burrito-wrap',    'healthy', 'Wrap de carne',             'Meat Burrito Wrap',                17.60, 'Cualquier carne, wrap de lechuga (sin tortilla), arroz, frijoles, guacamole, crema y queso', 'Any Meat, Lettuce wrap (no tortilla), Rice, Whole Beans, Guacamole, Sour Cream & Cheese'),
  I('cici-special',         'healthy', 'Cici Special',              'Cici Special',                     20.44, 'Lechuga, camarón, frijoles enteros y guacamole', 'Lettuce, shrimp, whole beans & guacamole', ['seafood']),
  I('ensalada-apache',      'healthy', 'Ensalada Apache',           'Ensalada Apache',                  20.69, 'Pechuga de pollo asada, lechuga, espinaca, jitomate, aguacate, zanahoria y tortilla strips', 'Grilled Chicken Breast, Lettuce, Spinach, Tomato, Avocado, Carrot & Tortilla Strips'),
  I('vegan-burrito-bowl',   'healthy', 'Vegan Burrito Bowl',        'Vegan Burrito Bowl',               19.41, 'Arroz integral, frijoles negros, vegetales asados (brócoli, coliflor, zanahoria, calabacita amarilla), champiñones, pimiento, cebolla, lechuga, espinaca, guacamole y jitomate', 'Brown Rice, Black Beans, Grilled Veggies (Broccoli, Cauliflower, Carrots, Yellow Squash, Zucchini), Mushrooms, Bell Peppers, Onions, Lettuce, Spinach, Guacamole, and Tomatoes'),

  // ============ HOUSE SPECIALTIES ============
  I('trio-enchiladas',      'specialties', 'Trío de enchiladas',          'Trio Enchiladas',         22.34, 'Carne a elección: una de mole, una roja y una verde con queso, lechuga y aguacate (sin arroz, sin frijoles)', 'Choice of Meat, one Mole, one Red & one Green Enchilada Sauce with Cheese, Lettuce & Avocado on top (no rice, no beans)', ['popular']),
  I('torta',                'specialties', 'Torta',                        'Torta',                   17.60, 'Carne a elección, jitomate, lechuga, guacamole, crema y queso en pan mexicano', 'Choice of Meat, Tomato, Lettuce, Guacamole, Sour Cream and Cheese in a Mexican Bread'),
  I('torta-milanesa',       'specialties', 'Torta de milanesa',           'Torta Milanesa',           21.22),
  I('taco-salad',           'specialties', 'Ensalada de taco',            'Taco Salad',               19.00, 'Arroz, frijoles refritos, lechuga, jitomate, queso, crema y guacamole', 'Served with Rice, Refried Beans, Lettuce, Tomato, Cheese, Sour Cream and Guacamole', ['popular']),
  I('shrimp-taco-salad',    'specialties', 'Ensalada de taco con camarón','Shrimp Taco Salad',        21.74, 'Arroz, frijoles refritos, lechuga, jitomate, queso, crema y guacamole', 'Served with Rice, Refried Beans, Lettuce, Tomato, Cheese, Sour Cream, and Guacamole', ['seafood']),
  I('rajas-con-crema',      'specialties', 'Rajas con crema',             'Rajas con Crema',          26.91, 'Pechuga de pollo en crema, champiñones, cebolla, chile poblano. Con arroz y frijoles', 'Chicken breast with creamy sauce, mushrooms, onions, chile poblano. Served with rice and beans'),
  I('tbone-mexican',        'specialties', 'T-Bone estilo mexicano',      'T-Bone Mexican Style Plate',39.33, 'Con arroz, frijoles, cebolla asada y champiñones', 'Served with Rice and Beans, grilled onions, and mushrooms on top'),
  I('tostada-raspada',      'specialties', 'Tostada raspada grande',      'Mexican Big Tostada Raspada',26.90, 'Tostada grande con carne, frijoles refritos, lechuga, queso mexicano rallado, jitomate y aguacate', 'Large Tostada with Choice of Meat, Refried Beans, Lettuce, Shredded Mexican Cheese, Tomato and Avocado', ['popular']),

  // ============ SOUPS ============
  I('albondigas',      'soups', 'Albóndigas',       'Albondigas',       20.70, 'Albóndigas y vegetales', 'Meatballs & Vegetables'),
  I('menudo',          'soups', 'Menudo',            'Menudo',           20.70, 'Sólo sábado y domingo', 'Saturday & Sunday Only'),
  I('tortilla-soup',   'soups', 'Sopa de tortilla',  'Tortilla Soup',    20.70, 'Tortilla strips, pollo, zanahoria, aguacate, papa y queso', 'Tortilla Strips, Chicken, Carrot, Avocado, Potato & Cheese'),
  I('quesabirrias',    'soups', 'Quesabirrias (3)',   'Quesabirrias (3)', 19.15),
  I('birria-soup',     'soups', 'Birria',             'Birria',           28.98, 'Con arroz y frijoles. Sólo sábado y domingo', 'Served with Rice & Beans. Saturday & Sunday Only'),

  // ============ TACOS ============
  I('taco-meat',      'tacos', 'Taco (cualquier carne)',    'Tacos (Any choice of Meat)',  5.95),
  I('taco-wrap',      'tacos', 'Taco wrap',                 'Taco Wrap',                   7.25),
  I('fish-taco',      'tacos', 'Taco de pescado',           'Fish Taco (Swai Fillet)',     6.99, undefined, undefined, ['seafood']),
  I('fish-taco-wrap', 'tacos', 'Wrap de pescado',           'Fish Taco Wrap',              7.76, undefined, undefined, ['seafood']),
  I('shrimp-taco',    'tacos', 'Taco de camarón',           'Shrimp Taco',                 8.28, undefined, undefined, ['seafood']),
  I('shrimp-taco-wrap','tacos','Wrap de camarón',           'Shrimp Taco Wrap',            9.06, undefined, undefined, ['seafood']),
  I('baja-fish-taco', 'tacos', 'Baja fish taco',            'Baja Fish Taco',              9.42, 'Pescado empanizado, tortilla de maíz, coleslaw, mil islas, pico de gallo', 'Breaded Fish, Corn Tortilla, Coleslaw, Thousand Island Dressing, Pico de Gallo', ['seafood']),

  // ============ BURRITOS ============
  // Elección de tortilla: espinaca, harina, jitomate seco o trigo
  I('burrito-basic',     'burritos', 'Burrito',               'Burrito',               11.90, 'Frijoles, arroz y queso', 'Beans, Rice, and Cheese'),
  I('burrito-regular',   'burritos', 'Burrito regular',       'Regular',               15.53, 'Arroz, frijoles enteros, salsa de burrito', 'Rice, Whole Beans, topped with Burrito Sauce'),
  I('burrito-super',     'burritos', 'Burrito súper',         'Super',                 17.08, 'Carne, arroz, frijoles, queso, crema y guacamole, salsa de burrito', 'Choice of Meat, Rice, Whole Beans, Cheese, Sour Cream and Guacamole, topped with Burrito Sauce', ['popular']),
  I('burrito-super-shrimp','burritos','Burrito súper de camarón','Super Shrimp Burrito',21.26, 'Camarón, arroz, frijoles, crema y guacamole, salsa de burrito', 'Shrimp, Rice, Whole Beans, Sour Cream and Guacamole, topped with Burrito Sauce', ['seafood']),
  I('burrito-macho',     'burritos', 'Burrito Macho',         'Macho',                 19.67, 'Carne, frijoles refritos, arroz, queso, crema, guacamole, jitomate, cebolla y cilantro, salsa de burrito', 'Choice of Meat, Refried Beans, Rice, Cheese, Sour Cream, Guacamole, Tomatoes, Onion and Cilantro, topped with Burrito Sauce', ['popular']),
  I('burrito-padre',     'burritos', 'Burrito Padre Macho',   'Padre Macho',           26.39, 'Igual que el Macho en doble cantidad, salsa de burrito', 'Same as Macho with Double Amount, topped with Burrito Sauce'),
  I('burrito-gordo',     'burritos', 'Burrito Gordo Macho',   'Gordo Macho',           56.93, 'Igual que el Macho en triple cantidad, salsa de burrito', 'Same as Macho with Triple Amount, topped with Burrito Sauce'),
  I('burrito-veg',       'burritos', 'Burrito sin carne',     'Vegetariano',           15.07, 'Arroz, frijoles, lechuga, queso, crema, guacamole, salsa de burrito', 'Rice, Whole Beans, Lettuce, Cheese, Sour Cream, Guacamole, topped with Burrito Sauce'),
  I('burrito-veg-mas',   'burritos', 'Burrito sin carne plus', 'Vegetariano Mas',      16.30, 'Arroz, frijoles, lechuga, queso, crema, guacamole, brócoli, coliflor, calabacita, zanahoria, salsa de burrito', 'Rice, Whole Beans, Lettuce, Cheese, Sour Cream, Guacamole, Broccoli, Cauliflower, Zucchini, Carrots, topped with Burrito Sauce'),
  I('burrito-relleno',   'burritos', 'Burrito relleno',       'Burrito Relleno',       17.60, 'Chile relleno + arroz, frijoles, queso, crema, salsa de relleno', 'Chile Relleno, Rice, Whole Beans, Cheese, Sour Cream, topped with Relleno Sauce'),
  I('burrito-california','burritos', 'California burrito',    'California Burrito',    18.03, 'Carne, papas fritas, arroz, frijoles, crema, guacamole, queso, salsa de burrito', 'Meat, Fries, Rice, Whole Beans Sour Cream, Guacamole, Cheese, Topped with Burrito Sauce'),
  I('burrito-bowl',      'burritos', 'Burrito bowl',          'Burrito Bowl',          17.60, 'Arroz, frijoles, jitomate, lechuga, carne, queso, crema, guacamole, pico de gallo en tazón (mariscos +$3.00)', 'Rice, Whole Beans, Chopped Tomato, Lettuce, Meat, Cheese, Sour Cream, Guacamole, Pico de Gallo, Served in a Bowl (Seafood + $3.00)'),
  I('burrito-fajita',    'burritos', 'Veggie Fajita Burrito', 'Veggie Fajita Burrito', 17.60, 'Pimiento rojo y verde, cebolla, jitomate, champiñones, frijoles, arroz, queso, crema y guacamole (carne +$3.50)', 'Red & Green Bell Pepper, Onion, Tomato, Mushrooms, Whole Beans, Rice, Cheese, Sour Cream, & Guacamole (Meat + $3.50)'),
  I('chimichanga',       'burritos', 'Chimichanga',           'Chimichanga',           19.15, 'Burrito frito con carne, frijoles y queso. Encima: crema, guacamole, lechuga, jitomate y queso Jack', 'Fried Burrito with Choice of Meat, Beans and Cheese inside. Topped with Sour Cream, Guacamole, Lettuce, Tomato, and Jack Cheese.'),

  // ============ SMALL COMBOS ============
  // Served with Rice & Refried Beans
  I('combo-1', 'small-combos', 'Combo #1 · Enchilada',     'Combo #1 · Enchilada',     18.37),
  I('combo-2', 'small-combos', 'Combo #2 · Taco',          'Combo #2 · Taco',          18.37),
  I('combo-3', 'small-combos', 'Combo #3 · Chile relleno', 'Combo #3 · Chile Relleno', 19.41),
  I('combo-4', 'small-combos', 'Combo #4 · Tostada',       'Combo #4 · Tostada',       19.41),

  // ============ LARGE COMBOS ============
  // Served with Rice & Refried Beans
  I('combo-5',  'large-combos', 'Combo #5 · Dos enchiladas',           'Combo #5 · Two Enchiladas',          22.25),
  I('combo-6',  'large-combos', 'Combo #6 · Enchilada y chile relleno','Combo #6 · Enchilada & Chile Relleno',23.55),
  I('combo-7',  'large-combos', 'Combo #7 · Enchilada y taco',         'Combo #7 · Enchilada & Taco',        22.25),
  I('combo-8',  'large-combos', 'Combo #8 · Dos tacos',                'Combo #8 · Two Tacos',               21.74),
  I('combo-9',  'large-combos', 'Combo #9 · Carne asada',              'Combo #9 · Carne Asada',             24.83),
  I('combo-10', 'large-combos', 'Combo #10 · Steak picado',            'Combo #10 · Steak Picado',           30.02),
  I('combo-11', 'large-combos', 'Combo #11 · Súper burrito',           'Combo #11 · Super Burrito',          24.58),
  I('combo-12', 'large-combos', 'Combo #12 · Taco y chile relleno',    'Combo #12 · Taco & Chile Relleno',   22.77),
  I('combo-13', 'large-combos', 'Combo #13 · Enchilada y tostada',     'Combo #13 · Enchilada & Tostada',    22.29),
  I('combo-14', 'large-combos', 'Combo #14 · Dos tamales',             'Combo #14 · Two Tamales',            22.25),
  I('combo-15', 'large-combos', 'Combo #15 · Chile verde',             'Combo #15 · Chile Verde',            27.95, undefined, undefined, ['spicy']),
  I('combo-16', 'large-combos', 'Combo #16 · Carnitas',                'Combo #16 · Carnitas Plate',         25.62),
  I('combo-17', 'large-combos', 'Combo #17 · Dos flautas',             'Combo #17 · Two Flautas',            23.29),
  I('combo-18', 'large-combos', 'Combo #18 · Chimichanga',             'Combo #18 · Chimichanga',            24.29),
  I('combo-19', 'large-combos', 'Combo #19 · Una enchilada de mole',   'Combo #19 · One Mole Enchilada',     19.41),
  I('combo-20', 'large-combos', 'Combo #20 · Dos enchiladas mole',     'Combo #20 · Two Mole Enchiladas',    24.58),
  I('combo-21', 'large-combos', 'Combo #21 · Un tamal',                'Combo #21 · One Tamale Combo',       19.15),
  I('combo-22', 'large-combos', 'Combo #22 · Macho chimichanga',       'Combo #22 · Macho Chimichanga',      26.39),
  I('combo-23', 'large-combos', 'Combo #23 · Dos enchiladas Mi Pueblo','Combo #23 · Two Enchiladas Mi Pueblo',24.58),
  I('combo-24', 'large-combos', 'Combo #24 · Tamal y enchilada',       'Combo #24 · Tamale & Enchilada',     23.55),
  I('combo-25', 'large-combos', 'Combo #25 · Tres en uno',             'Combo #25 · Three Item Combo',       25.88, 'Taco, enchilada y tamal', 'Taco, Enchilada & Tamale'),
  I('combo-26', 'large-combos', 'Combo #26 · Un sope',                 'Combo #26 · One Sope Combo',         20.44),
  I('combo-27', 'large-combos', 'Combo #27 · Dos chiles rellenos',     'Combo #27 · Two Chiles Rellenos',    24.58),
  I('combo-28', 'large-combos', 'Combo #28 · Tamal y chile relleno',   'Combo #28 · Tamale & Chile Relleno', 23.55),
  I('combo-29', 'large-combos', 'Combo #29 · Taquitos',                'Combo #29 · Taquitos Combo',         23.55),
  I('combo-30', 'large-combos', 'Combo #30 · Dos sopes',               'Combo #30 · Two Sopes Combo',        23.55),
  I('combo-31', 'large-combos', 'Combo #31 · Taco y tamal',            'Combo #31 · Taco & Tamale',          22.25),
  I('combo-32', 'large-combos', 'Combo #32 · Tres item combo',         'Combo #32 · Three Item Combo',       26.65, 'Taco, enchilada y chile relleno', 'Taco, Enchilada & Chile Relleno'),

  // ============ SEAFOOD COMBOS ============
  I('seafood-combo-33','seafood-combos','Un platillo de mariscos',    'One Seafood Item',        18.63, undefined, undefined, ['seafood']),
  I('seafood-combo-34','seafood-combos','Dos platillos de mariscos',   'Two Seafood Items',       24.58, undefined, undefined, ['seafood']),
  I('seafood-combo-35','seafood-combos','Tres platillos de mariscos',  'Three Seafood Items',     27.69, undefined, undefined, ['seafood']),
  I('seafood-combo-36','seafood-combos','5 street tacos de mariscos',  'Five Street Tacos',       23.55, 'Cargo adicional por mariscos', 'Additional Charge for Seafood', ['seafood']),

  // ============ MEATS ============
  // Served with Rice & Refried Beans
  I('carne-azteca',         'meats', 'Carne Azteca',           'Carne Azteca',          32.86, 'Arrachera, jitomate, queso mexicano, champiñones, cebolla y nopal asado. Platillo original de la abuela.', 'Grilled Steak with Tomato, Mexican Cheese, Mushrooms, Onions & Grilled Cactus. Grandma\'s original Mexican Dish.'),
  I('molcajete',            'meats', 'Molcajete',              'Molcajete',             38.30, 'Arrachera, camarón, pollo, queso fresco, cebolla, chorizo, jitomate, champiñones y nopal en molcajete de piedra', 'Steak, Shrimp & Chicken, Fresh Mexican Cheese, Onions, Chorizo, Tomato, Mushrooms and Grilled Cactus served in a Mexican Stone Bowl', ['popular','seafood']),
  I('fajitas-mix',          'meats', 'Fajitas mixtas',         'Fajitas Mix',           33.64, 'Arrachera, pollo, camarón, cebolla cambray, jitomate, pimientos, champiñones, guacamole y crema', 'Steak, Chicken, Shrimp, Green Onions, Tomatoes & Bell Peppers, Mushrooms, Guacamole & Sour Cream', ['popular','seafood']),
  I('fajitas-shrimp',       'meats', 'Fajitas de camarón',     'Fajitas Shrimp',        29.76, 'Camarón, cebolla cambray, jitomate, pimientos, champiñones, guacamole y crema', 'Shrimp, Green Onions, Tomatoes & Bell Peppers, Mushrooms, Guacamole & Sour Cream', ['seafood']),
  I('fajitas-chx-beef',     'meats', 'Fajitas de pollo o res', 'Fajitas Chicken or Beef',30.02, 'Cebolla cambray, jitomate, pimientos, champiñones, guacamole y crema', 'Green Onions, Tomatoes & Bell Peppers, Mushrooms, Guacamole & Sour Cream'),
  I('arrachera',            'meats', 'Arrachera',              'Arrachera',             33.90, 'BBQ arrachera con una enchilada, arroz, frijoles, pimiento y cebolla', 'BBQ Arrachera Meat with one Enchilada, Rice, and Beans, Bell Pepper & Onion'),
  I('carne-asada-mp',       'meats', 'Carne asada Mi Pueblo',  'Carne Asada Mi Pueblo', 30.02, 'Arrachera con pimientos asados, cebollas y jalapeños', 'Steak with Grilled Peppers, Onions, & Jalapeños', ['popular']),
  I('steak-ranchero',       'meats', 'Steak ranchero',         'Steak Ranchero',        29.76, 'Jalapeño, cebollas, jitomate, champiñones y cilantro', 'Jalapeño, Onions, Tomatoes, Mushrooms & Cilantro', ['spicy']),
  I('arroz-con-pollo',      'meats', 'Arroz con pollo',        'Arroz con Pollo',       28.72, 'Pollo, cebolla cambray, champiñones y jitomate sobre arroz con queso fundido', 'Chicken, Green Onions, Mushrooms & Tomatoes served over Rice topped with Melted Cheese'),
  I('alambre',              'meats', 'Alambre',                'Alambre',               30.79, 'Arrachera y chorizo con cebollas, jitomate, pimiento, champiñones y queso', 'Steak & Chorizo mixed with Onions, Tomatoes, Bell Pepper, Mushrooms & Cheese'),
  I('chile-colorado',       'meats', 'Chile colorado',         'Chile Colorado',        28.72, 'Cerdo en salsa roja', 'Pork in Red Sauce', ['spicy']),
  I('pollo-plancha',        'meats', 'Pollo a la plancha',     'Pollo a la Plancha',    26.65, 'Pechuga de pollo asada, pimiento y cebollas', 'Grilled Chicken Breast, Bell Pepper and Onions'),
  I('milanesa',             'meats', 'Milanesa',               'Milanesa',              28.46, 'Milanesa de res, arroz y frijoles', 'Breaded Steak, Rice and Beans'),
  I('pollo-con-crema',      'meats', 'Pollo con crema',        'Pollo con Crema',       27.69, 'Pechuga de pollo en crema', 'Chicken Breast with Creamy Sauce'),
  // Weekend Only
  I('trio-brochetas',       'meats', 'Trio Brochetas New York',  'Trio Brochetas New York',  36.23, 'Solo fines de semana', 'Weekend Only'),
  I('mini-trompo',          'meats', 'Mini Trompo Pastor',       'Mini Trompo Pastor',       36.23, 'Solo fines de semana', 'Weekend Only'),

  // ============ SEAFOOD ============
  I('tampiquena',         'seafood', 'Tampiqueña',            'Tampiqueña',            32.09, 'Arrachera y camarón con jitomate, champiñones y cebolla cambray', 'Grilled Steak & Shrimp with Tomato, Mushrooms & Green Onions', ['seafood']),
  I('camarones-steak',    'seafood', 'Camarones con steak',   'Camarones con Steak',   30.53, 'Arrachera y camarón con pimiento, cebolla y champiñones', 'Grilled Steak & Shrimp with Bell Pepper, Onion & Mushrooms', ['seafood','popular']),
  I('camarones-diabla',   'seafood', 'Camarones a la diabla', 'Camarones a la Diabla', 28.72, 'Camarón con pimiento, champiñones y salsa diabla', 'Shrimp with Bell Pepper, Mushrooms & Diabla Sauce', ['seafood','spicy']),
  I('camarones-mp',       'seafood', 'Camarones Mi Pueblo',   'Camarones Mi Pueblo',   28.72, 'Camarón salteado con pimiento, cebolla y champiñones', 'Shrimp sauteed with bell pepper, Onions & Mushrooms', ['seafood']),
  I('camarones-crema',    'seafood', 'Camarones con crema',   'Camarones con Crema',   28.72, 'Camarón en crema con pimiento, jitomate y cebolla', 'Shrimp cooked in Cream Sauce with Bell Peppers, Tomatoes & Onion', ['seafood']),
  I('camarones-mojo-ajo', 'seafood', 'Camarones al mojo de ajo','Camarones al Mojo de Ajo',28.72, 'Camarón, cebollas y champiñones en ajo', 'Shrimp, Onions & Mushrooms cooked in Garlic', ['seafood']),
  I('filete-pescado',     'seafood', 'Filete de pescado',     'Filete de Pescado',     28.72, 'Filete asado con arroz y frijoles', 'Grilled Fillet of Fish served with Rice and Beans', ['seafood']),
  I('burrito-marinero',   'seafood', 'Burrito marinero',      'Burrito Marinero',      26.65, 'Camarón salteado con cebolla cambray, jitomate, champiñones, arroz y frijoles con crema y guacamole, cubierto con queso y salsa verde', 'Shrimp sauteed with Green Onions, Tomato, Mushrooms, Rice & Beans with Sour Cream & Guacamole, topped with Cheese & Green Sauce', ['seafood']),
  I('seafood-burrito',    'seafood', 'Seafood burrito',       'Seafood Burrito',       26.65, 'Camarón salteado con pimiento, cebolla, champiñones, arroz y frijoles, salsa de burrito', 'Shrimp sauteed with Bell Pepper, Onions, Mushrooms, Rice & Beans, topped with Burrito sauce', ['seafood']),
  I('seafood-quesadilla', 'seafood', 'Quesadilla de mariscos','Seafood Quesadilla',    24.89, 'Camarón, cebolla, jitomate y champiñones. Sin arroz ni frijoles.', 'Shrimp, Onions, Tomato, Mushrooms. No Rice or Beans.', ['seafood']),
  I('camarones-tocino',   'seafood', 'Camarones con tocino',  'Camarones con Tocino',  28.72, 'Camarón envuelto en tocino', 'Shrimp wrapped in Bacon', ['seafood']),
  I('camarones-empanizados','seafood','Camarones empanizados','Camarones Empanizados', 28.72, 'Camarón empanizado con arroz y frijoles', 'Breaded Shrimp with Rice & Beans', ['seafood']),
  I('plato-cancun',       'seafood', 'Plato Cancún',          'Plato Cancún',          28.72, 'Camarón, cebolla cambray, jitomate y champiñones sobre arroz con queso fundido', 'Shrimp, Green Onions, Tomatoes, and Mushrooms, served over Rice and topped with Melted Cheese', ['seafood']),
  I('mojarra-frita',      'seafood', 'Mojarra frita',         'Mojarra Frita',         28.72, 'Mojarra entera frita con arroz y frijoles', 'Whole Fried Fish, served with Rice & Beans', ['seafood']),
  I('camarones-rancheros','seafood', 'Camarones rancheros',   'Camarones Rancheros',   28.72, 'Camarón con cebollas, jalapeños y jitomate', 'Shrimp with Onions, Jalapeños & Tomato', ['seafood','spicy']),
  I('camarones-colima',   'seafood', 'Camarones Colima',      'Camarones Colima',      32.09, 'Camarón, pulpo, callo de hacha, cebolla, jitomate, jalapeños y un toque de cilantro', 'Shrimp, Octopus, Scallops, Onions, Tomato, Jalapeños & a pinch of Cilantro', ['seafood','spicy']),
  I('caldo-camaron',      'seafood', 'Caldo de camarón',      'Caldo de Camarón',      26.65, 'Sopa de camarón', 'Shrimp Soup', ['seafood']),
  I('siete-mares',        'seafood', 'Siete Mares',           'Siete Mares',           34.67, 'Sopa de mariscos: pulpo, callo, almejas, pescado, cangrejo, camarón, papa y zanahoria', 'Seafood Soup mix with Octopus, Scallops, Clams, Fish, Crab, Shrimp, Potato & Carrots', ['seafood','popular']),
  I('grilled-salmon',     'seafood', 'Salmón a la parrilla',  'Grilled Salmon',        28.46, 'Con vegetales al vapor y frijoles negros', 'With Steamed Vegetables, and Black Beans', ['seafood']),
  I('cocktail-camaron',   'seafood', 'Cóctel de camarón',     'Cocktail de Camarón',   24.58, undefined, undefined, ['seafood']),
  I('cocktail-campechana','seafood', 'Cóctel campechana',     'Cocktail Campechana',   28.41, 'Camarón y pulpo', 'Shrimp & Octopus', ['seafood']),
  I('ceviche-cocktail',   'seafood', 'Cóctel de ceviche',     'Ceviche Cocktail',      24.58, 'Camarón marinado en limón', 'Lime Marinated Shrimp', ['seafood']),
  I('tostada-ceviche',    'seafood', 'Tostada de ceviche',    'Tostada de Ceviche Shrimp', 11.13, undefined, undefined, ['seafood']),
  I('tostada-camaron',    'seafood', 'Tostada de camarón',    'Tostada de Camarón',    10.09, undefined, undefined, ['seafood']),
  I('tostada-pescado',    'seafood', 'Tostada ceviche de pescado','Tostada Ceviche de Pescado',11.13, undefined, undefined, ['seafood']),
]
