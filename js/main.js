class CosmosViz {
    constructor() {
        this.scatterGL = null;
        this.currentData = null;
        this.setupEventListeners();
    }

    async initialize() {
        this.scatterGL = new ScatterGL(
            document.getElementById('scatter-container'),
            {
                renderMode: 'POINT',
                pointColorer: null,
                labels: null,
                styles: {
                    point: {
                        size: 2,
                    }
                }
            }
        );
        
        await this.loadAndDisplayData();
    }

    async loadAndDisplayData() {
        const n_neighbors = document.getElementById('n_neighbors').value;
        const min_dist = document.getElementById('min_dist').value;
        
        try {
            const response = await fetch(`data/umap_${n_neighbors}_${min_dist}.json`);
            this.currentData = await response.json();
            
            const dataset = {
                points: this.currentData.embeddings,
                metadata: {
                    redshift: this.currentData.redshift,
                    mass: this.currentData.mass
                }
            };

            this.scatterGL.render(dataset);
            this.colorByRedshift(); // Default coloring
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    colorByRedshift() {
        if (!this.currentData) return;
        
        const colors = this.currentData.redshift.map(z => {
            return this.getColorForValue(z, 
                Math.min(...this.currentData.redshift), 
                Math.max(...this.currentData.redshift)
            );
        });
        
        this.scatterGL.setPointColors(colors);
    }

    colorByMass() {
        if (!this.currentData) return;
        
        const colors = this.currentData.mass.map(m => {
            return this.getColorForValue(m, 
                Math.min(...this.currentData.mass), 
                Math.max(...this.currentData.mass)
            );
        });
        
        this.scatterGL.setPointColors(colors);
    }

    getColorForValue(value, min, max) {
        const normalized = (value - min) / (max - min);
        return `rgb(
            ${Math.floor(255 * (1 - normalized))},
            ${Math.floor(255 * normalized)},
            255
        )`;
    }

    setupEventListeners() {
        document.getElementById('n_neighbors').addEventListener('change', () => this.loadAndDisplayData());
        document.getElementById('min_dist').addEventListener('change', () => this.loadAndDisplayData());
        document.getElementById('colorByRedshift').addEventListener('click', () => this.colorByRedshift());
        document.getElementById('colorByMass').addEventListener('click', () => this.colorByMass());
    }
}

// Initialize visualization when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const viz = new CosmosViz();
    viz.initialize();
}); 