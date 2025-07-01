// Types for forecasting
type UsageRecord = {
  quantity: number;
  date: Date;
};

// Simple linear regression forecast
// In a real app, you might use a more sophisticated model or an external API
function generateForecast(usageHistory: UsageRecord[], daysToForecast: number) {
  // If there's not enough history, return null
  if (usageHistory.length < 5) {
    return { predictedUsage: null, confidence: 0 };
  }
  
  // Calculate the average daily usage
  let totalUsage = 0;
  for (const record of usageHistory) {
    totalUsage += record.quantity;
  }
  
  const avgDailyUsage = totalUsage / usageHistory.length;
  
  // For this simple model, predicted usage is average daily usage * days to forecast
  const predictedUsage = avgDailyUsage * daysToForecast;
  
  // Confidence is higher with more data points (max 0.9)
  const confidence = Math.min(0.9, usageHistory.length / 30);
  
  return { predictedUsage, confidence };
}

// Export function for sales forecasting
export function forecastSales(salesData: UsageRecord[], daysToForecast: number) {
  return generateForecast(salesData, daysToForecast);
}

// Export function for usage forecasting
export function forecastUsage(usageHistory: UsageRecord[], daysToForecast: number) {
  return generateForecast(usageHistory, daysToForecast);
}