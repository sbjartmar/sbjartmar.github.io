import numpy as np
import json
from umap import UMAP
from cosmos_loader import CosmosLoader
from sklearn.preprocessing import RobustScaler

def generate_umap_data():
    # Load COSMOS data
    cosmos_loader = CosmosLoader(output_cols=['specz', 'LP_mass_minchi2'])
    phot_cosmos, mask_cosmos, params_cosmos, _ = cosmos_loader.load_from_fits(
        fits_file="../data/all_specz_lp.fits",
        nphot=4000
    )

    # Scale the data
    scaler = RobustScaler()
    phot_cosmos_scaled = scaler.fit_transform(phot_cosmos)

    # UMAP parameters to try
    n_neighbors_list = [5, 15, 30, 50]
    min_dist_list = [0.1, 0.2, 0.5, 1.0]

    # Generate embeddings for each parameter combination
    for nn in n_neighbors_list:
        for md in min_dist_list:
            print(f"Generating UMAP for n_neighbors={nn}, min_dist={md}")
            
            umap = UMAP(
                n_components=3,
                n_neighbors=nn,
                min_dist=md,
                metric='euclidean'
            )
            
            embedding = umap.fit_transform(phot_cosmos_scaled)
            
            # Save as JSON
            data = {
                'embeddings': embedding.tolist(),
                'redshift': params_cosmos[:, 0].tolist(),
                'mass': params_cosmos[:, 1].tolist()
            }
            
            with open(f'data/umap_{nn}_{md}.json', 'w') as f:
                json.dump(data, f)

if __name__ == '__main__':
    generate_umap_data() 