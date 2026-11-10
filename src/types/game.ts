/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductCategory = 'groceries' | 'snacks' | 'dairy' | 'beverages';

export interface Product {
  id: string;
  name: string;
  hindiName: string;
  category: ProductCategory;
  brand: string;
  price: number;
  weight: string;
  description: string;
  nutrition: {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients: string[];
  shelfLocation: {
    aisle: number; // 1 to 4
    sectionName: string;
    shelfLevel: number; // 0 (bottom) to 2 (top)
    positionX: number;
    positionZ: number;
  };
  colorTheme: {
    primary: string;
    secondary: string;
    textColor: string;
  };
  modelType: 'packet' | 'box' | 'bottle' | 'sack';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShoppingMissionItem {
  productId: string;
  requiredQty: number;
  note: string;
}

export interface BillReceipt {
  invoiceNumber: string;
  dateTime: string;
  items: Array<{
    name: string;
    brand: string;
    qty: number;
    rate: number;
    gstRate: number;
    total: number;
  }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  discount: number;
  grandTotal: number;
  paymentMode: 'UPI' | 'CASH' | 'CARD';
  upiRefNumber?: string;
}

export const INDIAN_PRODUCTS: Product[] = [
  {
    id: 'maggi-noodles',
    name: 'Maggi 2-Minute Masala Noodles',
    hindiName: 'मैगी मसाला नूडल्स',
    category: 'snacks',
    brand: 'Nestlé',
    price: 14,
    weight: '70g',
    description: 'India\'s most loved 2-Minute Masala Noodles made with quality spices and authentic taste.',
    nutrition: {
      energy: '310 kcal',
      protein: '6.8g',
      carbs: '46.2g',
      fat: '11.5g',
    },
    ingredients: ['Wheat Flour', 'Palm Oil', 'Iodised Salt', 'Mixed Spices (Coriander, Cumin, Turmeric)', 'Hydrolysed Groundnut Protein'],
    shelfLocation: { aisle: 2, sectionName: 'Noodles & Instant Food', shelfLevel: 1, positionX: -2.8, positionZ: 1.2 },
    colorTheme: { primary: '#FACC15', secondary: '#DC2626', textColor: '#FFFFFF' },
    modelType: 'packet',
  },
  {
    id: 'parle-g',
    name: 'Parle-G Original Gluco Biscuits',
    hindiName: 'पारले-जी बिस्कुट',
    category: 'snacks',
    brand: 'Parle',
    price: 10,
    weight: '130g',
    description: 'The world\'s largest selling biscuit and an inseparable tea-time companion for every Indian household.',
    nutrition: {
      energy: '450 kcal',
      protein: '6.5g',
      carbs: '78.0g',
      fat: '12.8g',
    },
    ingredients: ['Wheat Flour (Maida)', 'Sugar', 'Edible Vegetable Oil', 'Invert Sugar Syrup', 'Milk Solids', 'Salt'],
    shelfLocation: { aisle: 2, sectionName: 'Biscuits & Cookies', shelfLevel: 2, positionX: -2.8, positionZ: -1.2 },
    colorTheme: { primary: '#FEF08A', secondary: '#B45309', textColor: '#1E293B' },
    modelType: 'box',
  },
  {
    id: 'good-day',
    name: 'Britannia Good Day Butter Cookies',
    hindiName: 'ब्रिटानिया गुड डे',
    category: 'snacks',
    brand: 'Britannia',
    price: 30,
    weight: '200g',
    description: 'Rich butter cookies baked with delight, featuring the iconic happy smile ridges.',
    nutrition: {
      energy: '502 kcal',
      protein: '7.0g',
      carbs: '68.5g',
      fat: '22.0g',
    },
    ingredients: ['Refined Wheat Flour', 'Sugar', 'Butter (2%)', 'Edible Vegetable Oil', 'Cashew Bits', 'Milk Solids'],
    shelfLocation: { aisle: 2, sectionName: 'Biscuits & Cookies', shelfLevel: 1, positionX: -2.8, positionZ: -2.4 },
    colorTheme: { primary: '#FBBF24', secondary: '#92400E', textColor: '#FFFFFF' },
    modelType: 'box',
  },
  {
    id: 'amul-milk',
    name: 'Amul Taaza Fresh Toned Milk',
    hindiName: 'अमुल ताज़ा दूध',
    category: 'dairy',
    brand: 'Amul',
    price: 27,
    weight: '500ml',
    description: 'Pure, fresh homogenized toned milk packed with natural calcium and protein goodness.',
    nutrition: {
      energy: '58 kcal/100ml',
      protein: '3.2g',
      carbs: '4.7g',
      fat: '3.0g',
    },
    ingredients: ['Standardized Toned Milk', 'Vitamin A', 'Vitamin D'],
    shelfLocation: { aisle: 3, sectionName: 'Chilled Dairy Section', shelfLevel: 1, positionX: 2.8, positionZ: -2.4 },
    colorTheme: { primary: '#0284C7', secondary: '#0369A1', textColor: '#FFFFFF' },
    modelType: 'box',
  },
  {
    id: 'dairy-milk',
    name: 'Cadbury Dairy Milk Silk Bar',
    hindiName: 'डेयरी मिल्क सिल्क',
    category: 'dairy',
    brand: 'Cadbury',
    price: 85,
    weight: '60g',
    description: 'Irresistibly smooth, creamy chocolate made with pure glass-and-a-half of dairy milk.',
    nutrition: {
      energy: '534 kcal',
      protein: '7.8g',
      carbs: '58.5g',
      fat: '31.2g',
    },
    ingredients: ['Sugar', 'Milk Solids (19%)', 'Cocoa Butter', 'Cocoa Solids', 'Emulsifiers'],
    shelfLocation: { aisle: 3, sectionName: 'Chocolates & Confectionery', shelfLevel: 2, positionX: 2.8, positionZ: -1.2 },
    colorTheme: { primary: '#581C87', secondary: '#EAB308', textColor: '#FFFFFF' },
    modelType: 'packet',
  },
  {
    id: 'aashirvaad-atta',
    name: 'Aashirvaad Shudh Chakki Atta',
    hindiName: 'आशीर्वाद शुद्ध चक्की आटा',
    category: 'groceries',
    brand: 'Aashirvaad (ITC)',
    price: 245,
    weight: '5 kg',
    description: '100% whole wheat flour crafted by traditional stone chakki grinding for extra soft rotis.',
    nutrition: {
      energy: '360 kcal',
      protein: '11.8g',
      carbs: '74.0g',
      fat: '1.7g',
    },
    ingredients: ['100% Whole Wheat Grains'],
    shelfLocation: { aisle: 1, sectionName: 'Grains, Flours & Staples', shelfLevel: 0, positionX: -8.2, positionZ: -1.2 },
    colorTheme: { primary: '#DC2626', secondary: '#F59E0B', textColor: '#FFFFFF' },
    modelType: 'sack',
  },
  {
    id: 'tata-salt',
    name: 'Tata Salt Desh Ka Namak',
    hindiName: 'टाटा नमक - देश का नमक',
    category: 'groceries',
    brand: 'Tata Consumer',
    price: 28,
    weight: '1 kg',
    description: 'Vacuum evaporated iodized salt, providing guaranteed purity and essential iodine.',
    nutrition: {
      energy: '0 kcal',
      protein: '0g',
      carbs: '0g',
      fat: '0g',
    },
    ingredients: ['Edible Common Salt', 'Potassium Iodate'],
    shelfLocation: { aisle: 1, sectionName: 'Salt, Sugar & Spices', shelfLevel: 1, positionX: -8.2, positionZ: 1.2 },
    colorTheme: { primary: '#2563EB', secondary: '#F1F5F9', textColor: '#FFFFFF' },
    modelType: 'packet',
  },
  {
    id: 'fortune-oil',
    name: 'Fortune Sunlite Sunflower Oil',
    hindiName: 'फॉर्च्यून सनफ्लावर तेल',
    category: 'groceries',
    brand: 'Fortune (Adani Wilmar)',
    price: 155,
    weight: '1 Litre',
    description: 'Light and healthy edible cooking oil enriched with Vitamin A and Vitamin D2.',
    nutrition: {
      energy: '900 kcal/100g',
      protein: '0g',
      carbs: '0g',
      fat: '100g',
    },
    ingredients: ['Refined Sunflower Oil', 'Vitamin A', 'Vitamin D2'],
    shelfLocation: { aisle: 1, sectionName: 'Edible Oils & Ghee', shelfLevel: 0, positionX: -8.2, positionZ: -2.4 },
    colorTheme: { primary: '#EAB308', secondary: '#CA8A04', textColor: '#1E293B' },
    modelType: 'bottle',
  },
  {
    id: 'lays-chips',
    name: 'Lay\'s India\'s Magic Masala',
    hindiName: 'लेज मैजिक मसाला',
    category: 'snacks',
    brand: 'Lay\'s (PepsiCo)',
    price: 20,
    weight: '50g',
    description: 'Crispy sliced Indian potatoes seasoned with an exhilarating blend of spicy hot seasonings.',
    nutrition: {
      energy: '542 kcal',
      protein: '6.9g',
      carbs: '52.6g',
      fat: '33.8g',
    },
    ingredients: ['Selected Potatoes', 'Edible Vegetable Oil', 'Seasoning (Chilli, Onion, Garlic powder, Dry Mango)'],
    shelfLocation: { aisle: 2, sectionName: 'Namkeen & Potato Chips', shelfLevel: 2, positionX: -2.8, positionZ: 2.4 },
    colorTheme: { primary: '#1E40AF', secondary: '#FACC15', textColor: '#FFFFFF' },
    modelType: 'packet',
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola Original Taste Bottle',
    hindiName: 'कोका-कोला',
    category: 'beverages',
    brand: 'Coca-Cola',
    price: 40,
    weight: '750ml',
    description: 'The world\'s legendary sparkling refreshing soft drink served ice cold.',
    nutrition: {
      energy: '44 kcal/100ml',
      protein: '0g',
      carbs: '10.9g',
      fat: '0g',
    },
    ingredients: ['Carbonated Water', 'Sugar', 'Acidity Regulator (338)', 'Caffeine', 'Natural Flavours'],
    shelfLocation: { aisle: 4, sectionName: 'Soft Drinks & Sodas', shelfLevel: 1, positionX: 8.2, positionZ: -1.2 },
    colorTheme: { primary: '#DC2626', secondary: '#991B1B', textColor: '#FFFFFF' },
    modelType: 'bottle',
  },
  {
    id: 'frooti-mango',
    name: 'Frooti Fresh Mango Juice',
    hindiName: 'फ़्रूटी मैंगो ड्रिंक',
    category: 'beverages',
    brand: 'Parle Agro',
    price: 20,
    weight: '250ml',
    description: 'Juicy real Alphonso mango pulp beverage that has defined Indian childhoods.',
    nutrition: {
      energy: '65 kcal/100ml',
      protein: '0.1g',
      carbs: '16.0g',
      fat: '0g',
    },
    ingredients: ['Water', 'Mango Pulp (19.5%)', 'Sugar', 'Acidity Regulator (330)', 'Antioxidant (300)'],
    shelfLocation: { aisle: 4, sectionName: 'Juices & Nectars', shelfLevel: 2, positionX: 8.2, positionZ: 1.2 },
    colorTheme: { primary: '#F59E0B', secondary: '#16A34A', textColor: '#1E293B' },
    modelType: 'box',
  },
  {
    id: 'amul-butter',
    name: 'Amul Pasteurised Butter',
    hindiName: 'अमुल मक्खन - बटर',
    category: 'dairy',
    brand: 'Amul',
    price: 58,
    weight: '100g',
    description: 'Utterly Butterly Delicious butter loved across Indian breakfasts and parathas.',
    nutrition: {
      energy: '722 kcal',
      protein: '0.6g',
      carbs: '0g',
      fat: '80.0g',
    },
    ingredients: ['Butter', 'Common Salt'],
    shelfLocation: { aisle: 3, sectionName: 'Butter, Cheese & Paneer', shelfLevel: 1, positionX: 2.8, positionZ: 1.2 },
    colorTheme: { primary: '#FBBF24', secondary: '#DC2626', textColor: '#1E293B' },
    modelType: 'box',
  },
];

export const AISLE_SECTIONS = [
  { aisleNumber: 1, name: 'Groceries & Staples', hindiName: 'किराना एवं अनाज', color: '#16a34a', bannerBg: '#14532d' },
  { aisleNumber: 2, name: 'Snacks & Biscuits', hindiName: 'स्नैक्स एवं बिस्कुट', color: '#f59e0b', bannerBg: '#78350f' },
  { aisleNumber: 3, name: 'Dairy & Confectionery', hindiName: 'डेयरी एवं चॉकलेट', color: '#0284c7', bannerBg: '#075985' },
  { aisleNumber: 4, name: 'Beverages & Drinks', hindiName: 'शीतल पेय एवं जूस', color: '#dc2626', bannerBg: '#7f1d1d' },
];

export const INITIAL_SHOPPING_MISSION: ShoppingMissionItem[] = [
  { productId: 'maggi-noodles', requiredQty: 2, note: 'Midnight craving fix!' },
  { productId: 'amul-milk', requiredQty: 1, note: 'Fresh milk for morning chai' },
  { productId: 'parle-g', requiredQty: 1, note: 'Classic tea-dunking biscuits' },
  { productId: 'tata-salt', requiredQty: 1, note: 'Desh Ka Namak for kitchen' },
  { productId: 'dairy-milk', requiredQty: 1, note: 'Sweet treat reward!' },
];
