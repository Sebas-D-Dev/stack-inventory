import prisma from "./prisma";

type SettingCategory = 'email' | 'inventory' | 'workingHours' | 'backup';

export async function getSettings(category?: SettingCategory) {
  try {
    const query = category ? { where: { category } } : {};
    const settings = await prisma.systemSetting.findMany(query);
    
    // Convert to a key-value object
    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {};
  }
}

export async function getSetting(key: string, defaultValue: string = '') {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });
    
    return setting?.value ?? defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}