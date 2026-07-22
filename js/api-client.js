// API Client untuk Smart PJU System
// Utility untuk komunikasi dengan backend API

const API_BASE_URL = '/api/v1';

class APIClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Assets
    async getAssets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/assets${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async getAssetById(id) {
        return this.request(`/assets/${id}`);
    }

    async createAsset(data) {
        return this.request('/assets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateAsset(id, data) {
        return this.request(`/assets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteAsset(id) {
        return this.request(`/assets/${id}`, {
            method: 'DELETE'
        });
    }

    // Maintenance Tasks
    async getMaintenanceTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/maintenance${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async getMaintenanceTaskById(id) {
        return this.request(`/maintenance/${id}`);
    }

    async createMaintenanceTask(data) {
        return this.request('/maintenance', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateMaintenanceTask(id, data) {
        return this.request(`/maintenance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async completeMaintenanceTask(id, data) {
        return this.request(`/maintenance/${id}/complete`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Inventory
    async getInventory() {
        return this.request('/inventory');
    }

    async createInventoryItem(data) {
        return this.request('/inventory', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Citizen Reports
    async getCitizenReports(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/reports${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async createCitizenReport(data) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Fleet
    async getFleet(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/fleet${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async createVehicle(data) {
        return this.request('/fleet', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async addFuelLog(vehicleId, data) {
        return this.request(`/fleet/${vehicleId}/fuel`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getDashboardActivities(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/dashboard/activities${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    // Sensors
    async getSensorReadings(assetId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/sensors/${assetId}${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async getEnergyConsumption(assetId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/sensors/${assetId}/energy${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    // Auth
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Health Check
    async healthCheck() {
        return this.request('/health', {
            method: 'GET'
        });
    }
}

// Create global instance
const api = new APIClient();

// Make it available globally
window.PJUAPI = api;
