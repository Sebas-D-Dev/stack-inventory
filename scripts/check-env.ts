export default function checkEnv() {
  const googleApiKey = process.env.GOOGLE_API_KEY;
  
  console.log("Environment Check:");
  
  if (!googleApiKey) {
    console.error("❌ GOOGLE_API_KEY is not set");
  } else {
    const masked = googleApiKey.substring(0, 4) + "..." + 
                  googleApiKey.substring(googleApiKey.length - 4);
    console.log(`✅ GOOGLE_API_KEY is set (${masked})`);
    
    if (!googleApiKey.startsWith("AI")) {
      console.warn("⚠️ GOOGLE_API_KEY may be invalid - should start with 'AI'");
    }
    
    if (googleApiKey.length < 20) {
      console.warn("⚠️ GOOGLE_API_KEY seems too short - check format");
    }
  }
}