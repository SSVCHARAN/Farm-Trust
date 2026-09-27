import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client initialization error:', err);
  }
}

// Fallback rule-based parser for Telugu and English to guarantee demo never breaks
function parseVoiceFallback(text: string, language: 'te' | 'en') {
  const lower = text.toLowerCase();

  let productName = 'Fresh Farm Produce';
  let productNameTelugu = 'తాజా వ్యవసాయ ఉత్పత్తులు';
  let category = 'Vegetables';
  let unit = 'kg';
  let priceUnit = 'kg';

  // Detection dictionary
  if (lower.includes('టమాటా') || lower.includes('tomato')) {
    productName = 'Tomatoes (నాటు టమాటాలు)';
    productNameTelugu = 'నాటు టమాటాలు';
    category = 'Vegetables';
  } else if (lower.includes('బియ్యం') || lower.includes('rice') || lower.includes('సోనా') || lower.includes('ధాన్యం')) {
    productName = 'Sona Masoori Rice (సోనా మసూరి బియ్యం)';
    productNameTelugu = 'సోనా మసూరి బియ్యం';
    category = 'Grains';
  } else if (lower.includes('మామిడి') || lower.includes('mango')) {
    productName = 'Banganapalli Mangoes (బంగనపల్లి మామిడి)';
    productNameTelugu = 'బంగనపల్లి మామిడి';
    category = 'Fruits';
  } else if (lower.includes('పాలు') || lower.includes('milk') || lower.includes('ఆవు')) {
    productName = 'Pure Cow Milk (స్వచ్ఛమైన ఆవు పాలు)';
    productNameTelugu = 'స్వచ్ఛమైన ఆవు పాలు';
    category = 'Dairy';
    unit = 'liters';
    priceUnit = 'liter';
  } else if (lower.includes('ఉల్లి') || lower.includes('onion')) {
    productName = 'Red Onions (ఎర్ర ఉల్లిపాయలు)';
    productNameTelugu = 'ఎర్ర ఉల్లిపాయలు';
    category = 'Vegetables';
  } else if (lower.includes('మిరప') || lower.includes('chilli') || lower.includes('mirchi')) {
    productName = 'Guntur Red Chillies (గుంటూరు మిరపకాయలు)';
    productNameTelugu = 'గుంటూరు మిరపకాయలు';
    category = 'Organic';
  } else if (lower.includes('అరటి') || lower.includes('banana')) {
    productName = 'Organic Bananas (సేంద్రీయ అరటిపండ్లు)';
    productNameTelugu = 'సేంద్రీయ అరటిపండ్లు';
    category = 'Fruits';
  }

  // Extract numbers
  const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  let quantity: number | null = null;
  let price: number | null = null;

  if (numbers.length >= 2) {
    quantity = numbers[0];
    price = numbers[1];
  } else if (numbers.length === 1) {
    // If text mentions kilo / rupees
    if (lower.includes('రూ') || lower.includes('rupee') || lower.includes('rs')) {
      price = numbers[0];
    } else {
      quantity = numbers[0];
    }
  }

  if (lower.includes('లీటర్') || lower.includes('liter') || lower.includes('litre')) {
    unit = 'liters';
    priceUnit = 'liter';
  } else if (lower.includes('కట్ట') || lower.includes('bunch')) {
    unit = 'bunches';
    priceUnit = 'bunch';
  }

  const organicClaim = lower.includes('సేంద్రీయ') || lower.includes('organic') || lower.includes('నాటు') || lower.includes('దేశీ') || lower.includes('natural');

  // Check for suspicious claims
  let trustScreening: { status: 'verified' | 'flagged' | 'standard'; note: string } = {
    status: organicClaim ? 'verified' : 'standard',
    note: organicClaim ? 'Organic claim recorded — Community peer verification enabled.' : 'Standard farm produce verification.'
  };

  if (lower.includes('miracle') || lower.includes('100% chemical free forever') || lower.includes('క్యాన్సర్ నయం') || lower.includes('చమత్కారం')) {
    trustScreening = {
      status: 'flagged',
      note: 'Review recommended: Prototype trust screening flagged non-standard health/miracle claims.'
    };
  }

  const missingFields: string[] = [];
  if (!quantity) missingFields.push('quantity');
  if (!price) missingFields.push('price');

  return {
    productName,
    productNameTelugu,
    category,
    quantity: quantity || 10,
    unit,
    price: price || 30,
    priceUnit,
    description: `Fresh, farm-harvested ${productName.split('(')[0].trim()} directly from farmer's field.`,
    organicClaim,
    organicDetails: organicClaim ? 'Traditional organic cultivation without synthetic chemical sprays.' : undefined,
    missingFields,
    trustScreening,
  };
}

// API endpoint: Parse voice transcript (Telugu or English)
app.post('/api/gemini/parse-voice', async (req, res) => {
  const { text, language = 'te' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text input is required' });
  }

  // If AI client is configured, call Gemini
  if (ai) {
    try {
      const prompt = `You are the AI core for FARM TRUST, an agricultural marketplace for Indian farmers.
The farmer spoke the following sentence in ${language === 'te' ? 'Telugu' : 'English'} (or mixed Telugu-English):
"${text}"

Your task is to extract structured product listing details faithfully.
Do NOT hallucinate or invent information not present in the farmer's utterance.
If quantity or price is omitted, leave it null and add the field name to missingFields.
Determine:
1. productName: Common English name with Telugu script in parentheses if applicable (e.g., "Fresh Tomatoes (నాటు టమాటాలు)").
2. productNameTelugu: Just the Telugu name (e.g. "నాటు టమాటాలు").
3. category: Exactly one of "Vegetables", "Fruits", "Grains", "Dairy", "Organic".
4. quantity: Number if mentioned, or null.
5. unit: "kg", "liters", "bunches", or "grams".
6. price: Price per unit in Indian Rupees (₹) as a number, or null.
7. priceUnit: "kg", "liter", "bunch", or "piece".
8. description: Brief, polite, realistic product description (1-2 sentences).
9. organicClaim: Boolean (true if farmer mentioned organic, desi, naatu, sendriya, pesticide-free, etc.).
10. missingFields: List of missing critical fields from ["quantity", "price"].
11. trustScreening:
    status: "verified" (standard believable claim), "standard", or "flagged" (if suspicious exaggerated claims like miracle cure, 100% cure, etc.)
    note: Short explanation for the farmer and buyer.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              productNameTelugu: { type: Type.STRING },
              category: { type: Type.STRING },
              quantity: { type: Type.NUMBER, nullable: true },
              unit: { type: Type.STRING },
              price: { type: Type.NUMBER, nullable: true },
              priceUnit: { type: Type.STRING },
              description: { type: Type.STRING },
              organicClaim: { type: Type.BOOLEAN },
              missingFields: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              trustScreening: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ['status', 'note'],
              },
            },
            required: ['productName', 'category', 'unit', 'priceUnit', 'organicClaim', 'trustScreening'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          success: true,
          source: 'gemini',
          data: parsed,
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local extractor:', err?.message || err);
      // Fallback
    }
  }

  // Fallback if no AI or API error
  const fallbackData = parseVoiceFallback(text, language);
  return res.json({
    success: true,
    source: 'rule-engine',
    data: fallbackData,
  });
});

// API endpoint: Customer Voice Search intent extraction
app.post('/api/gemini/customer-voice-search', async (req, res) => {
  const { text, language = 'en' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text input is required' });
  }

  const lower = text.toLowerCase();

  // Rule-based fallback extractor
  const fallbackExtract = () => {
    let product = 'Produce';
    let productTelugu = 'పంట';
    let category: string | null = null;
    let unit = 'kg';

    if (lower.includes('tomato') || lower.includes('టమాటా')) {
      product = 'Tomatoes';
      productTelugu = 'టమాటాలు';
      category = 'Vegetables';
    } else if (lower.includes('rice') || lower.includes('బియ్యం') || lower.includes('సోనా')) {
      product = 'Sona Masoori Rice';
      productTelugu = 'సోనా మసూరి బియ్యం';
      category = 'Grains';
    } else if (lower.includes('mango') || lower.includes('మామిడి')) {
      product = 'Banganapalli Mangoes';
      productTelugu = 'బంగనపల్లి మామిడి';
      category = 'Fruits';
    } else if (lower.includes('milk') || lower.includes('పాలు')) {
      product = 'Pure Cow Milk';
      productTelugu = 'ఆవు పాలు';
      category = 'Dairy';
      unit = 'liters';
    } else if (lower.includes('spinach') || lower.includes('పాలకూర')) {
      product = 'Fresh Spinach (Palak)';
      productTelugu = 'తాజా పాలకూర';
      category = 'Vegetables';
      unit = 'bunches';
    } else if (lower.includes('onion') || lower.includes('ఉల్లి')) {
      product = 'Red Onions';
      productTelugu = 'ఎర్ర ఉల్లిపాయలు';
      category = 'Vegetables';
    }

    const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    let quantity: number | null = null;
    let maxPrice: number | null = null;

    if (numbers.length >= 2) {
      quantity = numbers[0];
      maxPrice = numbers[1];
    } else if (numbers.length === 1) {
      if (lower.includes('under') || lower.includes('below') || lower.includes('లోపు') || lower.includes('ధర') || lower.includes('rupee') || lower.includes('రూ')) {
        maxPrice = numbers[0];
      } else {
        quantity = numbers[0];
      }
    }

    const organicOnly = lower.includes('organic') || lower.includes('సేంద్రీయ') || lower.includes('నాటు') || lower.includes('desi');

    const interpretation = `${product}${quantity ? ` · ${quantity} ${unit}` : ''}${maxPrice ? ` · Up to ₹${maxPrice}/${unit}` : ''}${organicOnly ? ' · Organic only' : ''}`;
    const interpretationTelugu = `${productTelugu}${quantity ? ` · ${quantity} ${unit}` : ''}${maxPrice ? ` · గరిష్ట ధర ₹${maxPrice}/${unit}` : ''}${organicOnly ? ' · సేంద్రీయ' : ''}`;

    return {
      product,
      productTelugu,
      quantity,
      unit,
      maxPrice,
      category,
      organicOnly,
      interpretation,
      interpretationTelugu,
      rawQuery: text,
    };
  };

  if (ai) {
    try {
      const prompt = `You are the Customer Voice Search intent parser for Farm Trust, an Indian agricultural marketplace.
Customer query in ${language === 'te' ? 'Telugu' : 'English'}:
"${text}"

Extract structured intent as JSON:
1. product: English common produce name (e.g. "Tomatoes", "Rice", "Mangoes", "Cow Milk", "Spinach", etc.)
2. productTelugu: Telugu produce name (e.g. "టమాటాలు", "బియ్యం", "మామిడిపండ్లు", "ఆవు పాలు")
3. quantity: number if mentioned (e.g. 2 for 2 kg), or null
4. unit: "kg" | "liters" | "bunches" | "grams" (default "kg")
5. maxPrice: maximum price limit per unit as number if mentioned (e.g. 40 if customer said under 40 rupees / 40 లోపు), or null
6. category: "Vegetables" | "Fruits" | "Grains" | "Dairy" | "Organic" or null
7. organicOnly: boolean (true if mentioned organic, sendriya, pesticide-free, desi)
8. interpretation: Concise English summary (e.g. "Tomatoes · 2 kg · Up to ₹40/kg")
9. interpretationTelugu: Concise Telugu summary (e.g. "టమాటాలు · 2 కిలోలు · గరిష్ట ధర ₹40/కిలో")`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product: { type: Type.STRING },
              productTelugu: { type: Type.STRING },
              quantity: { type: Type.NUMBER, nullable: true },
              unit: { type: Type.STRING },
              maxPrice: { type: Type.NUMBER, nullable: true },
              category: { type: Type.STRING, nullable: true },
              organicOnly: { type: Type.BOOLEAN },
              interpretation: { type: Type.STRING },
              interpretationTelugu: { type: Type.STRING },
            },
            required: ['product', 'unit', 'organicOnly', 'interpretation'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          success: true,
          source: 'gemini',
          data: { ...parsed, rawQuery: text },
        });
      }
    } catch (err: any) {
      console.warn('Customer voice search AI parse failed, using fallback:', err?.message || err);
    }
  }

  return res.json({
    success: true,
    source: 'rule-engine',
    data: fallbackExtract(),
  });
});

// API endpoint: Farmer AI Assistant (Action-Oriented)
app.post('/api/gemini/farmer-assistant', async (req, res) => {
  const { query, language = 'en', context } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  const { products = [], orders = [], farmer = {} } = context || {};
  const lower = query.toLowerCase();

  // Rule-based action matcher
  const handleAssistantFallback = () => {
    // 1. Change price
    if (lower.includes('price') || lower.includes('ధర') || lower.includes('చేయి') || lower.includes('change') || lower.includes('రూపాయ')) {
      const numbers = query.match(/\d+(\.\d+)?/g)?.map(Number) || [];
      const newPrice = numbers.length > 0 ? numbers[numbers.length - 1] : 35;

      // Find matching product
      let targetProduct = products.find((p: any) =>
        lower.includes('tomato') || lower.includes('టమాటా')
      ) || products[0];

      if (targetProduct) {
        return {
          actionType: 'UPDATE_PRICE',
          confirmationRequired: true,
          message: `I found ${targetProduct.name} currently listed at ₹${targetProduct.price}/${targetProduct.priceUnit}. Would you like to change the price to ₹${newPrice}/${targetProduct.priceUnit}?`,
          messageTelugu: `మీ వద్ద ఉన్న ${targetProduct.teluguName || targetProduct.name} ప్రస్తుత ధర ₹${targetProduct.price}/${targetProduct.priceUnit}. దీని ధరను ₹${newPrice}/${targetProduct.priceUnit}కి మార్చమంటారా?`,
          payload: {
            productId: targetProduct.id,
            productName: targetProduct.name,
            oldPrice: targetProduct.price,
            newPrice,
            unit: targetProduct.priceUnit,
          },
        };
      }
    }

    // 2. Pending orders
    if (lower.includes('pending') || lower.includes('order') || lower.includes('ఆర్డర్') || lower.includes('చూపించు')) {
      const pending = orders.filter((o: any) => o.status === 'Order Placed');
      if (pending.length === 0) {
        return {
          actionType: 'VIEW_PENDING_ORDERS',
          confirmationRequired: false,
          message: 'You have no pending orders right now. All orders are up to date!',
          messageTelugu: 'ప్రస్తుతం పెండింగ్‌లో ఎటువంటి ఆర్డర్లు లేవు. అన్ని ఆర్డర్లు ప్రాసెస్ చేయబడ్డాయి!',
        };
      }
      return {
        actionType: 'VIEW_PENDING_ORDERS',
        confirmationRequired: false,
        message: `You have ${pending.length} pending order${pending.length > 1 ? 's' : ''}: Order #${pending[0].id} for ${pending[0].quantity} ${pending[0].unit} of ${pending[0].productName} from ${pending[0].customerName}.`,
        messageTelugu: `మీకు ${pending.length} పెండింగ్ ఆర్డర్ ఉంది: #${pending[0].id} (${pending[0].customerName} నుండి ${pending[0].quantity} ${pending[0].unit} ${pending[0].productTeluguName || pending[0].productName}).`,
      };
    }

    // 3. Products inventory
    if (lower.includes('how many product') || lower.includes('ఎన్ని పంటలు') || lower.includes('inventory') || lower.includes('పంటలు ఉన్నాయి')) {
      const count = products.length;
      return {
        actionType: 'VIEW_INVENTORY',
        confirmationRequired: false,
        message: `You currently have ${count} active product${count > 1 ? 's' : ''} listed in the marketplace.`,
        messageTelugu: `ప్రస్తుతం మీ వ్యవసాయ అంగడిలో ${count} రకాల పంటలు అమ్మకానికి ఉన్నాయి.`,
      };
    }

    // 4. Total sales
    if (lower.includes('sell') || lower.includes('sales') || lower.includes('earnings') || lower.includes('అమ్మకాలు') || lower.includes('డబ్బులు')) {
      const completed = orders.filter((o: any) => o.status === 'Completed');
      const total = completed.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
      return {
        actionType: 'VIEW_EARNINGS',
        confirmationRequired: false,
        message: `You have completed ${completed.length} orders with total earnings of ₹${total}.`,
        messageTelugu: `మీరు ఇప్పటివరకు ${completed.length} ఆర్డర్లను విజయవంతంగా పూర్తి చేశారు, మొత్తం ఆదాయం ₹${total}.`,
      };
    }

    // General polite response
    return {
      actionType: 'NONE',
      confirmationRequired: false,
      message: `Namaste ${farmer.name || 'Farmer'}! You can ask me to: "Show pending orders", "Change tomato price to 35 rupees", or "How much did I sell?".`,
      messageTelugu: `నమస్కారం! మీరు: "నా pending orders చూపించు", "టమాటాల ధర 35 చేయి", లేదా "మొత్తం అమ్మకాలు ఎంత?" అని అడగవచ్చు.`,
    };
  };

  // If Gemini client is ready, let AI interpret natural query grounded on real context
  if (ai) {
    try {
      const prompt = `You are the action-oriented Farmer AI Assistant for FARM TRUST.
Farmer name: ${farmer.name || 'Ravi Kumar'}
Active Products: ${JSON.stringify(products.map((p: any) => ({ id: p.id, name: p.name, price: p.price, unit: p.priceUnit })))}
Recent Orders: ${JSON.stringify(orders.map((o: any) => ({ id: o.id, status: o.status, customer: o.customerName, total: o.totalPrice, item: o.productName })))}

Farmer asked in ${language === 'te' ? 'Telugu' : 'English'}:
"${query}"

Determine if the farmer wants to:
1. UPDATE_PRICE: Wants to change a product price. Extract targetProductId, oldPrice, newPrice, unit. Set confirmationRequired=true.
2. VIEW_PENDING_ORDERS: Wants to see unfulfilled/pending orders. Answer using actual orders list.
3. VIEW_INVENTORY: Wants to know products count or stock.
4. VIEW_EARNINGS: Wants sales/income information.
5. NONE: Other question answered politely and factually based ONLY on the farmer's real data above.

Return JSON:
- actionType: "UPDATE_PRICE" | "VIEW_PENDING_ORDERS" | "VIEW_INVENTORY" | "VIEW_EARNINGS" | "NONE"
- message: Clear English response
- messageTelugu: Clear Telugu translation
- confirmationRequired: boolean (true ONLY for UPDATE_PRICE or destructive actions)
- payload: { productId, productName, oldPrice, newPrice, unit } if UPDATE_PRICE, else null`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: { type: Type.STRING },
              message: { type: Type.STRING },
              messageTelugu: { type: Type.STRING },
              confirmationRequired: { type: Type.BOOLEAN },
              payload: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  productName: { type: Type.STRING },
                  oldPrice: { type: Type.NUMBER },
                  newPrice: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                },
              },
            },
            required: ['actionType', 'message', 'confirmationRequired'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          success: true,
          source: 'gemini',
          data: parsed,
        });
      }
    } catch (err: any) {
      console.warn('Farmer assistant AI call failed, using rule fallback:', err?.message || err);
    }
  }

  return res.json({
    success: true,
    source: 'rule-engine',
    data: handleAssistantFallback(),
  });
});

// API endpoint: Customer Request Natural Language Parser
app.post('/api/gemini/customer-request', async (req, res) => {
  const { text, language = 'en' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text required' });
  }

  const lower = text.toLowerCase();

  const fallback = () => {
    let product = 'Tomatoes';
    let productTelugu = 'నాటు టమాటాలు';
    let quantity = 5;
    let unit = 'kg';
    let neededBy = 'Tomorrow';

    if (lower.includes('tomato') || lower.includes('టమాటా')) {
      product = 'Country Tomatoes';
      productTelugu = 'నాటు టమాటాలు';
    } else if (lower.includes('rice') || lower.includes('బియ్యం')) {
      product = 'Sona Masoori Rice';
      productTelugu = 'సోనా మసూరి బియ్యం';
    } else if (lower.includes('mango') || lower.includes('మామిడి')) {
      product = 'Banganapalli Mangoes';
      productTelugu = 'బంగనపల్లి మామిడి';
    } else if (lower.includes('milk') || lower.includes('పాలు')) {
      product = 'Desi Cow Milk';
      productTelugu = 'స్వచ్ఛమైన ఆవు పాలు';
      unit = 'liters';
    }

    const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    if (numbers.length > 0) {
      quantity = numbers[0];
    }

    if (lower.includes('tomorrow') || lower.includes('రేపు')) {
      neededBy = 'Tomorrow';
    } else if (lower.includes('today') || lower.includes('ఈ రోజు') || lower.includes('evening') || lower.includes('సాయంత్రం')) {
      neededBy = 'Today evening';
    } else if (lower.includes('weekend')) {
      neededBy = 'This weekend';
    }

    return {
      product,
      productTelugu,
      quantity,
      unit,
      neededBy,
      location: 'Visakhapatnam',
    };
  };

  if (ai) {
    try {
      const prompt = `You are the local agricultural demand parser for Farm Trust.
A customer spoke this request in ${language === 'te' ? 'Telugu' : 'English'}:
"${text}"

Extract:
1. product: English produce name
2. productTelugu: Telugu produce name
3. quantity: number
4. unit: "kg" | "liters" | "bunches"
5. neededBy: "Tomorrow" | "Today evening" | "This weekend" | specific date
6. location: "Visakhapatnam" or customer city if mentioned`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product: { type: Type.STRING },
              productTelugu: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              neededBy: { type: Type.STRING },
              location: { type: Type.STRING },
            },
            required: ['product', 'quantity', 'unit', 'neededBy', 'location'],
          },
        },
      });

      if (response.text) {
        return res.json({
          success: true,
          source: 'gemini',
          data: JSON.parse(response.text),
        });
      }
    } catch (err: any) {
      console.warn('Customer request AI call failed:', err?.message || err);
    }
  }

  return res.json({
    success: true,
    source: 'rule-engine',
    data: fallback(),
  });
});

// Upgraded API endpoint: Trust screening for product description/claims (Feature 4)
app.post('/api/gemini/screen-claim', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }

  const lower = text.toLowerCase();

  // Classify into: NORMAL CLAIM, REVIEW RECOMMENDED, POTENTIALLY EXAGGERATED
  const miracleTerms = ['cure cancer', 'cure diseases', 'నయం', 'చమత్కారం', 'miracle cure', 'cure all illnesses'];
  const exaggeratedTerms = ['100% chemical free forever', 'zero risk guarantee', 'guaranteed chemical-free', '100% organic guaranteed forever'];

  const hasMiracle = miracleTerms.some((t) => lower.includes(t));
  const hasExaggerated = exaggeratedTerms.some((t) => lower.includes(t));

  if (hasMiracle) {
    return res.json({
      status: 'potentially_exaggerated',
      claimClassification: 'POTENTIALLY EXAGGERATED',
      note: 'This description contains strong medicinal or curative claims that cannot be scientifically verified by the platform.',
    });
  }

  if (hasExaggerated) {
    return res.json({
      status: 'review_recommended',
      claimClassification: 'REVIEW RECOMMENDED',
      note: 'This description contains absolute organic or chemical-free declarations that require peer or laboratory confirmation.',
    });
  }

  return res.json({
    status: 'verified',
    claimClassification: 'NORMAL CLAIM',
    note: 'Standard farmer-declared agricultural practices matching natural regional cultivation.',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
      },
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🌾 Farm Trust server running on http://0.0.0.0:${port}`);
  });
}

startServer();
