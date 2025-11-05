import React, { useState } from 'react';
import './style.css'; // Assume a basic App.css for styling

// --- 1. CONFIGURATION DATA AND PRICING ---
const BASE_PRICE = 60000;
const OPTIONS = {
    processor: {
        i5: { name: 'Core i5', price: 0 },
        i7: { name: 'Core i7', price: 15000 },
        i9: { name: 'Core i9', price: 30000 },
    },
    ram: {
        '8GB': { name: '8GB DDR4', price: 0 },
        '16GB': { name: '16GB DDR4', price: 8000 },
        '32GB': { name: '32GB DDR4', price: 18000 },
    },
    storage: {
        '512SSD': { name: '512GB SSD', price: 0 },
        '1TSSD': { name: '1TB SSD', price: 10000 },
        '2THDD': { name: '2TB HDD', price: -5000 }, // Cheaper option
    },
    color: {
        Silver: { name: 'Silver', price: 0, hex: '#C0C0C0' },
        Black: { name: 'Black', price: 1000, hex: '#1C1C1C' },
        Blue: { name: 'Sapphire Blue', price: 2000, hex: '#007FFF' },
    },
};

// --- 2. DEFAULT STATE ---
const getDefaultConfig = () => ({
    processor: 'i5',
    ram: '8GB',
    storage: '512SSD',
    color: 'Silver',
    totalPrice: BASE_PRICE,
});

// --- 3. PRICE CALCULATION LOGIC ---
const calculatePrice = (config) => {
    let price = BASE_PRICE;
    
    // Add price for each selected component
    price += OPTIONS.processor[config.processor]?.price || 0;
    price += OPTIONS.ram[config.ram]?.price || 0;
    price += OPTIONS.storage[config.storage]?.price || 0;
    price += OPTIONS.color[config.color]?.price || 0;

    return price;
};

// --- 4. MAIN COMPONENT ---
function LaptopCustomizerApp() {
    // State 1: Current, live configuration
    const [currentConfig, setCurrentConfig] = useState(getDefaultConfig());
    
    // State 2: List of saved configurations
    const [savedConfigs, setSavedConfigs] = useState([]);

    /**
     * Handles updating a nested value in the configuration object.
     * @param {string} name - The key of the component (e.g., 'processor').
     * @param {string} value - The new selected option key (e.g., 'i7').
     */
    const handleConfigChange = (name, value) => {
        // Create a new config object with the updated value
        const newConfig = {
            ...currentConfig,
            [name]: value,
        };
        
        // Recalculate and update the price
        const newPrice = calculatePrice(newConfig);
        
        // Set the new state object
        setCurrentConfig({
            ...newConfig,
            totalPrice: newPrice,
        });
    };

    /**
     * Adds the current configuration to the saved list.
     */
    const handleSaveConfiguration = () => {
        const newConfig = { 
            ...currentConfig, 
            id: Date.now() 
        }; // Assign a unique ID
        
        setSavedConfigs([
            ...savedConfigs, 
            newConfig
        ]);
        
        // Optional: Reset form after saving
        handleReset(); 
    };

    /**
     * Resets the current configuration to its default state.
     */
    const handleReset = () => {
        setCurrentConfig(getDefaultConfig());
    };

    /**
     * Loads a saved configuration back into the form for editing.
     * @param {object} configToLoad - The configuration object to load.
     */
    const handleEdit = (configToLoad) => {
        setCurrentConfig(configToLoad);
        // Remove the configuration being edited from the saved list
        setSavedConfigs(savedConfigs.filter(cfg => cfg.id !== configToLoad.id));
    };

    /**
     * Deletes a saved configuration from the list.
     * @param {number} idToDelete - The unique ID of the configuration to delete.
     */
    const handleDelete = (idToDelete) => {
        setSavedConfigs(savedConfigs.filter(cfg => cfg.id !== idToDelete));
    };

    // --- RENDER HELPERS ---

    const renderConfigOptions = (key, options) => (
        <div key={key} className="config-group">
            <label className="config-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            <select
                value={currentConfig[key]}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className="config-select"
            >
                {Object.entries(options).map(([optionKey, optionDetails]) => (
                    <option key={optionKey} value={optionKey}>
                        {optionDetails.name} (+₹{optionDetails.price.toLocaleString()})
                    </option>
                ))}
            </select>
        </div>
    );
    
    const selectedColorHex = OPTIONS.color[currentConfig.color].hex;

    return (
        <div className="app-container">
            <header>
                <h1>✨ Laptop Customizer</h1>
            </header>

            <div className="main-content">
                
                {/* 5. CONFIGURATION PANEL */}
                <section className="config-panel panel">
                    <h2>Customize Your Laptop</h2>
                    {renderConfigOptions('processor', OPTIONS.processor)}
                    {renderConfigOptions('ram', OPTIONS.ram)}
                    {renderConfigOptions('storage', OPTIONS.storage)}
                    {renderConfigOptions('color', OPTIONS.color)}

                    <div className="action-buttons">
                        <button className="btn btn-save" onClick={handleSaveConfiguration}>
                            💾 Save Configuration
                        </button>
                        <button className="btn btn-reset" onClick={handleReset}>
                            🔄 Reset
                        </button>
                    </div>
                </section>

                {/* 6. PREVIEW PANEL */}
                <section 
                    className="preview-panel panel"
                    style={{ 
                        borderColor: selectedColorHex,
                        boxShadow: `0 0 10px ${selectedColorHex}`
                    }}
                >
                    <h2>Live Preview</h2>
                    <div className="laptop-preview" style={{ backgroundColor: selectedColorHex }}>
                        <span className="color-name">{OPTIONS.color[currentConfig.color].name}</span>
                    </div>

                    <div className="specs-list">
                        <h3>Selected Specs:</h3>
                        <p><strong>Processor:</strong> {OPTIONS.processor[currentConfig.processor].name}</p>
                        <p><strong>RAM:</strong> {OPTIONS.ram[currentConfig.ram].name}</p>
                        <p><strong>Storage:</strong> {OPTIONS.storage[currentConfig.storage].name}</p>
                        <p><strong>Color:</strong> {OPTIONS.color[currentConfig.color].name}</p>
                    </div>

                    <div className="total-price">
                        Total Price: 
                        <span className="price-tag">
                            ₹{currentConfig.totalPrice.toLocaleString()}
                        </span>
                    </div>
                </section>
            </div>

            <hr/>

            {/* 7. SAVED CONFIGURATIONS */}
            <section className="saved-configs">
                <h2>Saved Configurations ({savedConfigs.length})</h2>
                {savedConfigs.length === 0 ? (
                    <p className="no-configs">No configurations saved yet.</p>
                ) : (
                    <div className="saved-list">
                        {savedConfigs.map((config) => (
                            <div key={config.id} className="saved-card" style={{ borderColor: OPTIONS.color[config.color].hex }}>
                                <div className="saved-details">
                                    <p><strong>Total:</strong> <span className="price-tag">₹{config.totalPrice.toLocaleString()}</span></p>
                                    <p>
                                        {OPTIONS.processor[config.processor].name} | 
                                        {OPTIONS.ram[config.ram].name} | 
                                        {OPTIONS.storage[config.storage].name} | 
                                        {OPTIONS.color[config.color].name}
                                    </p>
                                </div>
                                <div className="saved-actions">
                                    <button className="btn btn-edit" onClick={() => handleEdit(config)}>Edit</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(config.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default LaptopCustomizerApp;