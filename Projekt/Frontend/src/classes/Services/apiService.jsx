export default class ApiService{
    
    constructor(baseUrl){
        this.baseUrl = baseUrl;
    }

    async _handleResponse(response){
        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (!response.ok) {
            throw new Error(data.message || "Hiba történt a kérés során.");
        }
        return data;
    }

    async _getHeaders(){
        const token = localStorage.getItem("authToken");
        return {
            "Content-Type": "application/json",
            ...(token ? {"x-access-token": token} : {})
        }
    }

    async get(endpoint){
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "GET",
            headers: await this._getHeaders()
        });
        return this._handleResponse(response);
    }

    async post(endpoint, data){
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: await this._getHeaders(),
            body: JSON.stringify(data) 
        });
        return this._handleResponse(response);
    }

    async put(endpoint, data){
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "PUT",
            headers: await this._getHeaders(),
            body: JSON.stringify(data)
        });
        return this._handleResponse(response);
    }

    async delete(endpoint){
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "DELETE",
            headers: await this._getHeaders()
        });
        return this._handleResponse(response);
    }
}