import cron from 'node-cron';
import { TrendyolService } from './platforms/trendyol.js';
import { HepsiburadaService } from './platforms/hepsiburada.js';
import { AmazonService } from './platforms/amazon.js';

const trendyol = new TrendyolService();
const hepsiburada = new HepsiburadaService();
const amazon = new AmazonService();

// Fetch orders every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await Promise.all([
      trendyol.fetchOrders(),
      hepsiburada.fetchOrders(),
      amazon.fetchOrders()
    ]);
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
});