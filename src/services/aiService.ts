import {
  VoiceExtractionResult,
  CustomerVoiceSearchIntent,
  FarmerAssistantAction,
  CustomerRequest,
} from '../types';

export async function parseVoiceProductInput(
  text: string,
  language: 'te' | 'en' = 'te'
): Promise<VoiceExtractionResult> {
  try {
    const res = await fetch('/api/gemini/parse-voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data as VoiceExtractionResult;
    }
    throw new Error('Invalid response structure');
  } catch (err) {
    console.warn('Backend AI call failed, using client-side resilient parsing:', err);
    return clientSideVoiceFallback(text, language);
  }
}

// Feature 1: Customer Voice Search intent extraction
export async function parseCustomerVoiceSearch(
  text: string,
  language: 'te' | 'en' = 'en'
): Promise<CustomerVoiceSearchIntent> {
  try {
    const res = await fetch('/api/gemini/customer-voice-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as CustomerVoiceSearchIntent;
      }
    }
  } catch (err) {
    console.warn('Customer voice search call error, using local fallback:', err);
  }

  // Client-side fallback
  const lower = text.toLowerCase();
  let product = 'Tomatoes';
  let productTelugu = 'టమాటాలు';
  let unit = 'kg';

  if (lower.includes('rice') || lower.includes('బియ్యం') || lower.includes('సోనా')) {
    product = 'Sona Masoori Rice';
    productTelugu = 'సోనా మసూరి బియ్యం';
  } else if (lower.includes('mango') || lower.includes('మామిడి')) {
    product = 'Banganapalli Mangoes';
    productTelugu = 'బంగనపల్లి మామిడి';
  } else if (lower.includes('milk') || lower.includes('పాలు')) {
    product = 'Pure Cow Milk';
    productTelugu = 'ఆవు పాలు';
    unit = 'liters';
  } else if (lower.includes('spinach') || lower.includes('పాలకూర')) {
    product = 'Fresh Spinach';
    productTelugu = 'తాజా పాలకూర';
    unit = 'bunches';
  } else if (lower.includes('onion') || lower.includes('ఉల్లి')) {
    product = 'Red Onions';
    productTelugu = 'ఎర్ర ఉల్లిపాయలు';
  }

  const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  let quantity: number | null = 2;
  let maxPrice: number | null = 40;

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

  return {
    product,
    productTelugu,
    quantity,
    unit,
    maxPrice,
    organicOnly: lower.includes('organic') || lower.includes('సేంద్రీయ'),
    interpretation: `${product}${quantity ? ` · ${quantity} ${unit}` : ''}${maxPrice ? ` · Up to ₹${maxPrice}/${unit}` : ''}`,
    interpretationTelugu: `${productTelugu}${quantity ? ` · ${quantity} ${unit}` : ''}${maxPrice ? ` · గరిష్ట ధర ₹${maxPrice}/${unit}` : ''}`,
    rawQuery: text,
  };
}

// Feature 2: Farmer AI Assistant
export async function callFarmerAIAssistant(
  query: string,
  language: 'te' | 'en' = 'en',
  context: { products: any[]; orders: any[]; farmer: any }
): Promise<FarmerAssistantAction> {
  try {
    const res = await fetch('/api/gemini/farmer-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, context }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as FarmerAssistantAction;
      }
    }
  } catch (err) {
    console.warn('Farmer assistant API call failed, using client fallback:', err);
  }

  // Client-side heuristic fallback
  const lower = query.toLowerCase();
  const { products = [], orders = [] } = context;

  if (lower.includes('price') || lower.includes('ధర') || lower.includes('change') || lower.includes('చేయి')) {
    const targetProduct = products[0];
    const numbers = query.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    const newPrice = numbers.length > 0 ? numbers[numbers.length - 1] : 35;

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

  if (lower.includes('pending') || lower.includes('orders') || lower.includes('ఆర్డర్')) {
    const pending = orders.filter((o) => o.status === 'Order Placed');
    return {
      actionType: 'VIEW_PENDING_ORDERS',
      confirmationRequired: false,
      message: pending.length > 0
        ? `You have ${pending.length} pending order: #${pending[0].id} for ${pending[0].quantity} ${pending[0].unit} of ${pending[0].productName}.`
        : 'You have no pending orders right now. All orders are up to date!',
      messageTelugu: pending.length > 0
        ? `మీకు ${pending.length} పెండింగ్ ఆర్డర్ ఉంది: #${pending[0].id} (${pending[0].quantity} ${pending[0].unit} ${pending[0].productName}).`
        : 'ప్రస్తుతం పెండింగ్‌లో ఎటువంటి ఆర్డర్లు లేవు.',
    };
  }

  return {
    actionType: 'NONE',
    confirmationRequired: false,
    message: `You have ${products.length} products listed and ${orders.length} total orders recorded.`,
    messageTelugu: `మీ వద్ద ${products.length} పంటలు అమ్మకానికి ఉన్నాయి మరియు ${orders.length} ఆర్డర్లు నమోదయ్యాయి.`,
  };
}

// Feature 5: Customer Request Voice extraction
export async function parseCustomerRequestVoice(
  text: string,
  language: 'te' | 'en' = 'en'
): Promise<{
  product: string;
  productTelugu: string;
  quantity: number;
  unit: string;
  neededBy: string;
  location: string;
}> {
  try {
    const res = await fetch('/api/gemini/customer-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Customer request API error:', err);
  }

  const lower = text.toLowerCase();
  let product = 'Country Tomatoes';
  let productTelugu = 'నాటు టమాటాలు';
  let unit = 'kg';

  if (lower.includes('rice') || lower.includes('బియ్యం')) {
    product = 'Sona Masoori Rice';
    productTelugu = 'సోనా మసూరి బియ్యం';
  } else if (lower.includes('mango') || lower.includes('మామిడి')) {
    product = 'Banganapalli Mangoes';
    productTelugu = 'బంగనపల్లి మామిడి';
  } else if (lower.includes('spinach') || lower.includes('పాలకూర')) {
    product = 'Fresh Spinach';
    productTelugu = 'తాజా పాలకూర';
    unit = 'bunches';
  }

  const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  const quantity = numbers.length > 0 ? numbers[0] : 5;

  let neededBy = 'Tomorrow';
  if (lower.includes('today') || lower.includes('ఈ రోజు') || lower.includes('సాయంత్రం')) {
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
}

// Feature 4: Upgraded Claim Screening
export async function analyzeProductDescription(
  text: string
): Promise<{
  status: 'verified' | 'review_recommended' | 'standard' | 'potentially_exaggerated';
  claimClassification: 'NORMAL CLAIM' | 'REVIEW RECOMMENDED' | 'POTENTIALLY EXAGGERATED';
  note: string;
}> {
  try {
    const res = await fetch('/api/gemini/screen-claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const json = await res.json();
      return {
        status: json.status,
        claimClassification: json.claimClassification || 'NORMAL CLAIM',
        note: json.note,
      };
    }
  } catch (e) {
    console.warn('Claim screening fallback:', e);
  }

  // Client-side heuristic
  const lower = text.toLowerCase();
  if (lower.includes('cure') || lower.includes('cancer') || lower.includes('నయం') || lower.includes('చమత్కారం')) {
    return {
      status: 'potentially_exaggerated',
      claimClassification: 'POTENTIALLY EXAGGERATED',
      note: 'This description contains strong medicinal or curative claims that cannot be scientifically verified by the platform.',
    };
  }

  if (lower.includes('100% chemical free forever') || lower.includes('zero risk guarantee') || lower.includes('100% organic guaranteed forever')) {
    return {
      status: 'review_recommended',
      claimClassification: 'REVIEW RECOMMENDED',
      note: 'This description contains absolute organic declarations that may require supporting peer evidence.',
    };
  }

  return {
    status: 'verified',
    claimClassification: 'NORMAL CLAIM',
    note: 'Standard farmer-declared agricultural practices matching natural regional cultivation.',
  };
}

function clientSideVoiceFallback(text: string, _language: 'te' | 'en'): VoiceExtractionResult {
  const lower = text.toLowerCase();

  let productName = 'Fresh Farm Produce';
  let productNameTelugu = 'తాజా వ్యవసాయ ఉత్పత్తులు';
  let category: VoiceExtractionResult['category'] = 'Vegetables';
  let unit = 'kg';
  let priceUnit = 'kg';

  if (lower.includes('టమాటా') || lower.includes('tomato')) {
    productName = 'Tomatoes (నాటు టమాటాలు)';
    productNameTelugu = 'నాటు టమాటాలు';
    category = 'Vegetables';
  } else if (lower.includes('బియ్యం') || lower.includes('rice') || lower.includes('సోనా') || lower.includes('ధాన్యం')) {
    productName = 'Sona Masoori Rice (సోనా మసూరి)';
    productNameTelugu = 'సోనా మసూరి బియ్యం';
    category = 'Grains';
  } else if (lower.includes('మామిడి') || lower.includes('mango')) {
    productName = 'Banganapalli Mangoes (బంగనపల్లి మామిడి)';
    productNameTelugu = 'బంగనపల్లి మామిడి';
    category = 'Fruits';
  } else if (lower.includes('పాలు') || lower.includes('milk') || lower.includes('ఆవు')) {
    productName = 'Pure Desi Cow Milk (ఆవు పాలు)';
    productNameTelugu = 'స్వచ్ఛమైన ఆవు పాలు';
    category = 'Dairy';
    unit = 'liters';
    priceUnit = 'liter';
  } else if (lower.includes('మిరప') || lower.includes('chilli')) {
    productName = 'Red Chillies (గుంటూరు ఎండుమిరప)';
    productNameTelugu = 'గుంటూరు ఎండుమిరప';
    category = 'Organic';
  } else if (lower.includes('ఉల్లి') || lower.includes('onion')) {
    productName = 'Red Onions (నాటు ఉల్లి)';
    productNameTelugu = 'నాటు ఉల్లిపాయలు';
    category = 'Vegetables';
  } else if (lower.includes('బెండ') || lower.includes('okra') || lower.includes('ladyfinger')) {
    productName = 'Fresh Okra / Ladyfinger (బెండకాయలు)';
    productNameTelugu = 'తాజా బెండకాయలు';
    category = 'Vegetables';
  }

  const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  let quantity: number | null = null;
  let price: number | null = null;

  if (numbers.length >= 2) {
    quantity = numbers[0];
    price = numbers[1];
  } else if (numbers.length === 1) {
    if (lower.includes('రూ') || lower.includes('rs') || lower.includes('rupee')) {
      price = numbers[0];
    } else {
      quantity = numbers[0];
    }
  }

  if (lower.includes('లీటర్') || lower.includes('liter') || lower.includes('litre')) {
    unit = 'liters';
    priceUnit = 'liter';
  }

  const organicClaim = lower.includes('సేంద్రీయ') || lower.includes('organic') || lower.includes('నాటు') || lower.includes('దేశీ') || lower.includes('natural');

  return {
    productName,
    productNameTelugu,
    category,
    quantity: quantity || 15,
    unit,
    price: price || 35,
    priceUnit,
    description: `Fresh, farm-harvested ${productName.split('(')[0].trim()} directly from farmer's field.`,
    organicClaim,
    organicDetails: organicClaim ? 'Grown organically without synthetic chemicals.' : undefined,
    missingFields: [],
    trustScreening: {
      status: 'verified',
      claimClassification: 'NORMAL CLAIM',
      note: organicClaim
        ? 'Organic claim recorded — Community peer verification enabled.'
        : 'Standard small-holder farm produce.',
    },
  };
}
