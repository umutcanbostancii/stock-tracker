import { TrendyolService } from './platforms/trendyol.js';
import { HepsiburadaService } from './platforms/hepsiburada.js';
import { AmazonService } from './platforms/amazon.js';

const platforms = [
  new TrendyolService(),
  new HepsiburadaService(),
  new AmazonService()
];

export const updatePlatformStocks = async (productId, newQuantity) => {
  const updatePromises = platforms.map(platform => 
    platform.updateStock(productId, newQuantity)
  );

  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating platform stocks:', error);
    // In a production environment, you might want to implement retry logic
    // or queue failed updates for later processing
  }
};