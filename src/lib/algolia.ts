import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'mock_app_id';
const apiKey = process.env.ALGOLIA_ADMIN_API_KEY || 'mock_api_key'; // Use admin key for backend operations

export const algoliaClient = algoliasearch(appId, apiKey);
export const SERVICES_INDEX_NAME = 'servicehub_services';

export async function syncServiceToAlgolia(service: {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  provider?: { name: string | null; city: string | null; state: string | null } | null;
}) {
  if (!appId || !apiKey) {
    console.warn("Algolia credentials missing, skipping sync.");
    return;
  }
  try {
    const record = {
      objectID: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      providerName: service.provider?.name || "",
      city: service.provider?.city || "",
      state: service.provider?.state || "",
    };
    // Correct method depends on algoliasearch v5 vs older versions.
    // Assuming v5 algoliasearch structure here
    await algoliaClient.saveObject({
        indexName: SERVICES_INDEX_NAME,
        body: record
    });
  } catch (error) {
    console.error("Failed to sync service to Algolia:", error);
  }
}

export async function removeServiceFromAlgolia(serviceId: string) {
  if (!appId || !apiKey) return;
  try {
    await algoliaClient.deleteObject({
        indexName: SERVICES_INDEX_NAME,
        objectID: serviceId
    });
  } catch (error) {
    console.error("Failed to remove service from Algolia:", error);
  }
}
