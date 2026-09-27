import { Farmer, Product, Order, Review, OrderStatus, CustomerRequest, LocalDemandItem } from '../types';
import {
  INITIAL_FARMERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_CUSTOMER_REQUESTS,
  INITIAL_LOCAL_DEMAND,
} from '../data/mockData';

const STORAGE_KEYS = {
  FARMERS: 'farmtrust_farmers_v1',
  PRODUCTS: 'farmtrust_products_v1',
  ORDERS: 'farmtrust_orders_v1',
  REVIEWS: 'farmtrust_reviews_v1',
  REQUESTS: 'farmtrust_requests_v1',
  DEMAND: 'farmtrust_demand_v1',
  ROLE: 'farmtrust_active_role_v1',
  LANG: 'farmtrust_lang_v1',
};

export class StorageService {
  static getFarmers(): Farmer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FARMERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveFarmers(INITIAL_FARMERS);
    return INITIAL_FARMERS;
  }

  static saveFarmers(farmers: Farmer[]): void {
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  }

  static getFarmerById(id: string): Farmer | undefined {
    return this.getFarmers().find(f => f.id === id);
  }

  static getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }

  static saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  static addProduct(product: Product): Product {
    const products = this.getProducts();
    const updated = [product, ...products];
    this.saveProducts(updated);
    return product;
  }

  static updateProductPrice(productId: string, newPrice: number): Product | null {
    const products = this.getProducts();
    let updatedProduct: Product | null = null;
    const updated = products.map((p) => {
      if (p.id === productId) {
        updatedProduct = { ...p, price: newPrice };
        return updatedProduct;
      }
      return p;
    });
    this.saveProducts(updated);
    return updatedProduct;
  }

  static deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.saveProducts(products);
  }

  static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveOrders(INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }

  static saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static addOrder(order: Order): Order {
    const orders = this.getOrders();
    const updated = [order, ...orders];
    this.saveOrders(updated);

    // Also deduct product stock
    const products = this.getProducts().map(p => {
      if (p.id === order.productId) {
        return {
          ...p,
          availableQuantity: Math.max(0, p.availableQuantity - order.quantity),
        };
      }
      return p;
    });
    this.saveProducts(products);

    return order;
  }

  static updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | null {
    const orders = this.getOrders();
    let updatedOrder: Order | null = null;

    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        const historyEntry = {
          status,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note,
        };
        updatedOrder = {
          ...ord,
          status,
          statusHistory: [...ord.statusHistory, historyEntry],
        };
        return updatedOrder;
      }
      return ord;
    });

    this.saveOrders(updated);
    return updatedOrder;
  }

  static markOrderRated(orderId: string): void {
    const orders = this.getOrders().map(o => (o.id === orderId ? { ...o, rated: true } : o));
    this.saveOrders(orders);
  }

  static getReviews(): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveReviews(INITIAL_REVIEWS);
    return INITIAL_REVIEWS;
  }

  static saveReviews(reviews: Review[]): void {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }

  static addReview(review: Review): Review {
    const reviews = this.getReviews();
    const updated = [review, ...reviews];
    this.saveReviews(updated);

    // Recalculate farmer rating
    const farmerReviews = updated.filter(r => r.farmerId === review.farmerId);
    const avg = farmerReviews.reduce((sum, r) => sum + r.rating, 0) / farmerReviews.length;
    const rounded = Math.round(avg * 10) / 10;

    const farmers = this.getFarmers().map(f => {
      if (f.id === review.farmerId) {
        return {
          ...f,
          rating: rounded,
          reviewCount: farmerReviews.length,
        };
      }
      return f;
    });
    this.saveFarmers(farmers);

    // Update product cards farmer rating
    const products = this.getProducts().map(p => {
      if (p.farmerId === review.farmerId) {
        return { ...p, farmerRating: rounded };
      }
      return p;
    });
    this.saveProducts(products);

    if (review.orderId) {
      this.markOrderRated(review.orderId);
    }

    return review;
  }

  // Customer Requests (Feature 5)
  static getCustomerRequests(): CustomerRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveCustomerRequests(INITIAL_CUSTOMER_REQUESTS as CustomerRequest[]);
    return INITIAL_CUSTOMER_REQUESTS as CustomerRequest[];
  }

  static saveCustomerRequests(requests: CustomerRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }

  static addCustomerRequest(request: CustomerRequest): CustomerRequest {
    const current = this.getCustomerRequests();
    const updated = [request, ...current];
    this.saveCustomerRequests(updated);

    // Update local demand counts
    this.recordCustomerRequestInDemand(request);
    return request;
  }

  static updateCustomerRequestStatus(requestId: string, status: 'OPEN' | 'OFFERED' | 'FULFILLED', farmerId?: string, farmerName?: string): void {
    const requests = this.getCustomerRequests().map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          offeredByFarmerId: farmerId || r.offeredByFarmerId,
          offeredByFarmerName: farmerName || r.offeredByFarmerName,
        };
      }
      return r;
    });
    this.saveCustomerRequests(requests);
  }

  // Local Demand Insights (Feature 6)
  static getLocalDemand(): LocalDemandItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEMAND);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.saveLocalDemand(INITIAL_LOCAL_DEMAND as LocalDemandItem[]);
    return INITIAL_LOCAL_DEMAND as LocalDemandItem[];
  }

  static saveLocalDemand(items: LocalDemandItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DEMAND, JSON.stringify(items));
  }

  static recordCustomerSearch(searchTerm: string): void {
    const term = searchTerm.toLowerCase();
    const demand = this.getLocalDemand();
    let found = false;

    const updated = demand.map((d) => {
      if (d.product.toLowerCase().includes(term) || term.includes(d.product.toLowerCase().split(' ')[0])) {
        found = true;
        return {
          ...d,
          searchCount: d.searchCount + 1,
          urgency: (d.searchCount + 1 > 8 ? 'High interest' : 'Growing interest') as any,
          recentRequestNote: `${d.searchCount + 1} families searched recently for this produce.`,
        };
      }
      return d;
    });

    if (!found && searchTerm.length > 2) {
      updated.push({
        id: `dem-${Date.now()}`,
        product: searchTerm,
        productTelugu: searchTerm,
        searchCount: 1,
        activeRequests: 0,
        urgency: 'Growing interest',
        urgencyTelugu: 'కొత్త డిమాండ్',
        recentRequestNote: '1 new family search recorded today.',
        recentRequestNoteTelugu: 'ఈ రోజు నమోదైన కొత్త శోధన.',
      });
    }

    this.saveLocalDemand(updated);
  }

  private static recordCustomerRequestInDemand(req: CustomerRequest): void {
    const demand = this.getLocalDemand();
    const prodName = req.product.toLowerCase();
    let matched = false;

    const updated = demand.map((d) => {
      if (d.product.toLowerCase().includes(prodName) || prodName.includes(d.product.toLowerCase().split(' ')[0])) {
        matched = true;
        return {
          ...d,
          activeRequests: d.activeRequests + 1,
          urgency: 'High interest' as const,
          recentRequestNote: `${d.searchCount} searches · ${d.activeRequests + 1} active requests in Visakhapatnam area.`,
        };
      }
      return d;
    });

    if (!matched) {
      updated.unshift({
        id: `dem-${Date.now()}`,
        product: req.product,
        productTelugu: req.productTelugu || req.product,
        searchCount: 3,
        activeRequests: 1,
        urgency: 'Active demand',
        urgencyTelugu: 'కొత్త రిక్వెస్ట్',
        recentRequestNote: `1 active customer request for ${req.quantity} ${req.unit} (${req.neededBy}).`,
      });
    }

    this.saveLocalDemand(updated);
  }

  static resetDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.FARMERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.DEMAND);
    this.saveFarmers(INITIAL_FARMERS);
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveOrders(INITIAL_ORDERS);
    this.saveReviews(INITIAL_REVIEWS);
    this.saveCustomerRequests(INITIAL_CUSTOMER_REQUESTS as CustomerRequest[]);
    this.saveLocalDemand(INITIAL_LOCAL_DEMAND as LocalDemandItem[]);
  }
}

