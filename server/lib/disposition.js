import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const categories = require('../data/categories.json')

// Maps AI-returned category strings (which vary) to our canonical keys in categories.json
const CATEGORY_ALIASES = {
  // Books
  'book': 'Books', 'books': 'Books', 'textbook': 'Books', 'textbooks': 'Books',
  'novel': 'Books', 'novels': 'Books', 'academic book': 'Books', 'academic books': 'Books',
  'literature': 'Books', 'fiction': 'Books', 'non-fiction': 'Books', 'nonfiction': 'Books',
  'comic': 'Books', 'comics': 'Books', 'magazine': 'Books',
  // Apparel / Clothing
  'apparel': 'Apparel', 'clothing': 'Apparel', 'clothes': 'Apparel',
  'shirt': 'Apparel', 't-shirt': 'Apparel', 'tshirt': 'Apparel',
  'jacket': 'Apparel', 'hoodie': 'Apparel', 'jeans': 'Apparel', 'pants': 'Apparel',
  'dress': 'Apparel', 'skirt': 'Apparel', 'sweater': 'Apparel', 'coat': 'Apparel',
  'fashion': 'Apparel', 'garment': 'Apparel', 'top': 'Apparel',
  // Electronics
  'electronics': 'Electronics', 'electronic': 'Electronics',
  'phone': 'Electronics', 'smartphone': 'Electronics', 'mobile': 'Electronics',
  'laptop': 'Electronics', 'computer': 'Electronics', 'tablet': 'Electronics',
  'headphones': 'Electronics', 'earbuds': 'Electronics', 'earphones': 'Electronics',
  'speaker': 'Electronics', 'camera': 'Electronics', 'watch': 'Electronics',
  'smartwatch': 'Electronics', 'charger': 'Electronics', 'cable': 'Electronics',
  'audio': 'Electronics', 'gaming': 'Electronics', 'console': 'Electronics',
  // Footwear
  'footwear': 'Footwear', 'shoes': 'Footwear', 'shoe': 'Footwear',
  'sneakers': 'Footwear', 'sneaker': 'Footwear', 'boots': 'Footwear', 'boot': 'Footwear',
  'sandals': 'Footwear', 'sandal': 'Footwear', 'heels': 'Footwear', 'slippers': 'Footwear',
  // Home & Kitchen
  'home & kitchen': 'Home & Kitchen', 'home and kitchen': 'Home & Kitchen',
  'home': 'Home & Kitchen', 'kitchen': 'Home & Kitchen', 'appliance': 'Home & Kitchen',
  'furniture': 'Home & Kitchen', 'lamp': 'Home & Kitchen', 'decor': 'Home & Kitchen',
  'cookware': 'Home & Kitchen', 'utensils': 'Home & Kitchen',
  // Toys
  'toys': 'Toys', 'toy': 'Toys', 'game': 'Toys', 'games': 'Toys',
  'board game': 'Toys', 'puzzle': 'Toys',
  // Sports
  'sports': 'Sports', 'sport': 'Sports', 'fitness': 'Sports', 'exercise': 'Sports',
  'gym': 'Sports', 'outdoor': 'Sports', 'cycling': 'Sports', 'yoga': 'Sports',
  // Beauty
  'beauty': 'Beauty', 'skincare': 'Beauty', 'makeup': 'Beauty', 'cosmetics': 'Beauty',
  'personal care': 'Beauty', 'grooming': 'Beauty', 'fragrance': 'Beauty',
  // Automotive
  'automotive': 'Automotive', 'auto': 'Automotive', 'car': 'Automotive',
  'vehicle': 'Automotive', 'car accessories': 'Automotive',
}

function normalizeCategory(raw) {
  if (!raw) return 'default'
  const key = raw.trim().toLowerCase()
  return CATEGORY_ALIASES[key] ?? (categories[raw] ? raw : 'default')
}

const resalePctByGrade = {
  'Like New': 0.70,
  'Very Good': 0.55,
  'Good': 0.40,
  'Acceptable': 0.25,
  'Not Sellable': 0,
}

// Categories where a trade-in exchange beats donation for Acceptable-grade items
const EXCHANGE_ELIGIBLE = new Set(['Electronics', 'Automotive', 'Sports', 'Home & Kitchen'])

function fmt(n) {
  return Math.round(n)
}

export function decide({ originalPrice, grade, category, confidence }) {
  const cats = categories[normalizeCategory(category)] ?? categories['default']
  const { processingCost, refurbishCost, carbonSavedKg, returnShippingCo2Kg = 0.5 } = cats

  const resalePct = resalePctByGrade[grade] ?? 0
  const expectedResaleValue = fmt(originalPrice * resalePct)
  const netResell = fmt(expectedResaleValue - processingCost)
  const canRefurbish = grade === 'Good' || grade === 'Acceptable'
  const netRefurbish = canRefurbish ? fmt(expectedResaleValue - processingCost - refurbishCost) : -Infinity

  const netCarbonSavedKg = Math.max(0, carbonSavedKg - returnShippingCo2Kg)
  const greenCredits = Math.max(1, Math.round(netCarbonSavedKg * 10))
  // Exchange credit = 15% of original price (Amazon Pay), min ₹100
  const exchangeCredits = Math.max(100, fmt(originalPrice * 0.15))

  let decision
  let reason

  if (grade === 'Not Sellable') {
    decision = 'Recycle'
    reason = `Item is not sellable in any condition. Routing to recycling saves ${netCarbonSavedKg.toFixed(1)} kg CO2 net of return shipping.`
  } else if (netResell < 0 && netRefurbish < 0 && grade === 'Acceptable' && EXCHANGE_ELIGIBLE.has(category)) {
    decision = 'Exchange'
    reason = `Too worn to resell profitably (net ₹${netResell}) but still functional. Encore trade-in gives you ₹${exchangeCredits} Amazon Pay credit toward a certified refurbished replacement.`
  } else if (netResell < 0 && netRefurbish < 0) {
    decision = 'Donate'
    reason = `Relisting recovers ₹${expectedResaleValue} but costs ₹${processingCost} — a ₹${Math.abs(netResell)} loss, so donating is the better outcome.`
  } else if (canRefurbish && netRefurbish > netResell) {
    decision = 'Refurbish'
    reason = `Refurbishing (net ₹${netRefurbish}) beats direct resale (net ₹${netResell}) after a ₹${refurbishCost} refurb investment.`
  } else {
    decision = 'Resell'
    reason = `Resale recovers ₹${expectedResaleValue} against ₹${processingCost} in costs, leaving a net of ₹${netResell}.`
  }

  return {
    decision,
    expectedResaleValue,
    processingCost,
    netResell,
    greenCredits,
    exchangeCredits,
    netCarbonSavedKg,
    returnShippingCo2Kg,
    reason,
  }
}
