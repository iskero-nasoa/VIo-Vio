/**
 * Retry an asynchronous function with exponential backoff
 */
export async function retryAsync(asyncFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFn();
    } catch (err) {
      lastError = err;
      if (i < maxRetries - 1) {
        const backoff = delay * Math.pow(2, i);
        console.warn(`Retry attempt ${i + 1} failed. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }
  
  throw lastError;
}
