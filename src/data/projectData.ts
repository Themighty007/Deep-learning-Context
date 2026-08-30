import { ArchitectureNode, ArchitectureEdge, MetricValue, AblationModel, TemporalFrameData, GISLocation } from '../types';

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'copernicus',
    title: 'Copernicus Data Space',
    category: 'data',
    tag: 'OData / S3 Stream',
    description: 'Direct ingestion from ESA Copernicus Open Access Hub with Sentinel-2 MSI level-2A surface reflectance products.',
    details: 'Streams BOA (Bottom of Atmosphere) reflectance tiles over requested ROIs with full sensor metadata.',
    formula: 'B02, B03, B04, B08 @ 10m Ground Sampling Distance (GSD)'
  },
  {
    id: 'cloud_mask',
    title: 'Cloud Masking Engine',
    category: 'data',
    tag: 'SCL + s2cloudless',
    description: 'Hierarchical cloud, shadow, and cirrus filtering to reject corrupted temporal acquisitions prior to feature extraction.',
    details: 'Uses Scene Classification Layer (SCL) combined with light gradient boosting classifier (s2cloudless) with probability thresholding at p < 0.35.',
    formula: 'M_valid = (SCL != Cloud) ∧ (P_cloudless < 0.35)'
  },
  {
    id: 'co_registration',
    title: 'Phase-Correlation Co-reg',
    category: 'data',
    tag: 'Sub-pixel FFT Offset',
    description: 'Sub-pixel spatial alignment correcting temporal parallax and satellite orbital jitter between consecutive revisits.',
    details: 'Calculates cross-power spectrum in Fourier domain to resolve sub-pixel translational offsets down to 0.05 px precision.',
    formula: 'Δ(x, y) = argmax F⁻¹ { (F_ref · F_src*) / |F_ref · F_src*| }'
  },
  {
    id: 'patch_sampler',
    title: 'Balanced Patch Sampler',
    category: 'data',
    tag: 'Land-Cover Stratification',
    description: 'Stratified sampling guaranteeing equal 20% representation across Urban, Agriculture, Forest, Water, and Mountain biomes.',
    details: 'Prevents standard SR bias towards homogeneous agricultural plains by enforcing high-entropy edge distribution.',
    formula: 'P(class_i) = 0.20, ∀ i ∈ {Urban, Agri, Forest, Water, Mountain}'
  },
  {
    id: 'temporal_stack',
    title: '5-Frame Temporal Stack',
    category: 'data',
    tag: 'T−2 · T−1 · T0 · T+1 · T+2',
    description: 'Structured multi-temporal input stack centered on target acquisition date with ±30 day revisit envelope.',
    details: '5-channel temporal tensor T ∈ ℝ^(5 × 4 × H × W) providing multi-look angular sampling and cloud-free spatial complements.',
    formula: 'Stack = { I_(T-2), I_(T-1), I_T0, I_(T+1), I_(T+2) }'
  },
  {
    id: 'swinir_encoder',
    title: 'Shared SwinIR Encoder',
    category: 'model',
    tag: '6 RSTB · embed 180 · window 8',
    description: 'Deep hierarchical vision transformer with Residual Swin Transformer Blocks extracting multi-scale shifted window representations.',
    details: 'Shifts attention windows across consecutive layers to enable cross-window spatial interactions with linear computational complexity.',
    formula: 'MSA(W) = Softmax(QKᵀ / √d + B) V'
  },
  {
    id: 'spatial_branch',
    title: 'Spatial Reference Branch',
    category: 'model',
    tag: 'Center Frame T0',
    description: 'Dedicated high-fidelity spatial feature extraction from the primary target timestamp T0.',
    details: 'Preserves instantaneous ground truth geometry and illumination conditions while filtering seasonal artifacts.',
    formula: 'F_spatial = Enc_SwinIR(I_T0)'
  },
  {
    id: 'temporal_branch',
    title: 'Quality-Aware Temporal Fusion',
    category: 'model',
    tag: 'Qi = 0.6(1-C) + 0.25S + 0.15B',
    description: 'Dynamic temporal frame weighting based on atmospheric transmittance, spatial sharpness, and blur index.',
    details: 'Low quality frames (hazy/cloudy) are smoothly attenuated while clear complementary acquisitions contribute high-frequency tokens.',
    formula: 'Q_i = 0.60(1 - C_i) + 0.25 S_i + 0.15 B_i'
  },
  {
    id: 'windowed_cross_attn',
    title: '8×8 Windowed Cross-Attention',
    category: 'model',
    tag: 'O(N) Complexity Attention',
    description: 'Constrained spatial-temporal cross-attention preventing O(N²) quadratic memory explosion on GPU clusters.',
    details: 'Restricts query-key matching within local 8×8 pixel patches across temporal frames, enabling fast inference on edge GPUs.',
    formula: 'Attn_win = Concat(Head_1, ..., Head_h) W_O, WinSize=8×8'
  },
  {
    id: 'pixel_shuffle',
    title: 'PixelShuffle ×4 Upsampler',
    category: 'model',
    tag: 'Sub-Pixel Convolution',
    description: 'Efficient sub-pixel spatial rearrangement reconstructing 2.5m GSD from multi-channel latent feature maps.',
    details: 'Reorganizes tensor channels r² × C into (r·H) × (r·W) high-resolution output space without introducing deconvolution checkerboard artifacts.',
    formula: 'PS(X)_{c, y, x} = X_{⌊y/r⌋, ⌊x/r⌋, c·r² + (y%r)·r + (x%r)}'
  },
  {
    id: 'sr_estimate',
    title: '2.5m Inferred SR Estimate',
    category: 'model',
    tag: 'Enhanced Representation',
    description: 'High-density 2.5m spatial representation for 4 Sentinel-2 bands (B02, B03, B04, B08) with preserved radiometry.',
    details: '4× super-resolved multispectral product ready for downstream segmentation, GIS vectorization, and precision agriculture.',
    formula: 'I_SR ∈ ℝ^(4 × 4H × 4W) @ 2.5m GSD'
  },
  {
    id: 'patch_gan',
    title: 'Perceptual PatchGAN',
    category: 'model',
    tag: 'Markovian Discriminator',
    description: 'Adversarial texture discriminator operating on local 70×70 image patches to enforce natural high-frequency terrain distribution.',
    details: 'Trained with conservative 0.01 loss weight to avoid adversarial hallucination of non-existent synthetic geometry.',
    formula: 'L_GAN = 𝔼[log D(I_HR)] + 𝔼[log(1 - D(I_SR))]'
  },
  {
    id: 'uncertainty_head',
    title: 'Heteroscedastic σ² Head',
    category: 'uncertainty',
    tag: 'Aleatoric Variance Model',
    description: 'Predicts per-pixel observational uncertainty (log-variance) reflecting intrinsic noise, sensor blur, and temporal occlusions.',
    details: 'Trained via Negative Log-Likelihood loss, allowing the model to attenuate loss gradients in inherently ambiguous regions.',
    formula: 'L_NLL = (1/2) exp(-s_i) ||y_i - ŷ_i||² + (1/2) s_i, where s = ln(σ²)'
  },
  {
    id: 'mc_dropout',
    title: 'MC-Dropout Epistemic Estimator',
    category: 'uncertainty',
    tag: 'Model Variance Sampling',
    description: 'Monte Carlo Dropout active at test time (N=16 stochastic forward passes) to quantify epistemic model parameter uncertainty.',
    details: 'Identifies out-of-distribution biomes and novel spatial patterns where the neural network lacks training support.',
    formula: 'Var_epistemic(x) = (1/N) ∑_{n=1}^N (ŷ_n - μ)²'
  },
  {
    id: 'differentiable_physics',
    title: 'Differentiable Sensor Model',
    category: 'physics',
    tag: 'Gaussian PSF + S2-SRF',
    description: 'End-to-end differentiable forward simulation of the Sentinel-2 optical transmission and sensor degradation physics.',
    details: 'Degrades the generated 2.5m SR estimate back to nominal 10m space using exact optical Point Spread Function and Spectral Response.',
    formula: 'F_sensor(I_SR) = Quantize( Downsample_4x( I_SR ⊛ PSF_gauss · SRF_S2 ) )'
  },
  {
    id: 'observation_loss',
    title: 'Observation Consistency Loss',
    category: 'physics',
    tag: 'Lobs = L1 + 0.2·SAM',
    description: 'Non-negotiable physical constraint: degraded SR output MUST reconstruct original 10m Sentinel-2 observation.',
    details: 'Penalizes discrepancies between sensor simulation and physical ground observation, eliminating unconstrained hallucinations.',
    formula: 'L_obs = ||F_sensor(I_SR) - I_LR||₁ + 0.20 · SAM(F_sensor(I_SR), I_LR)'
  },
  {
    id: 'radiometric_metrics',
    title: 'Radiometric & Trust Metrics',
    category: 'validation',
    tag: 'Multi-Criteria Scientific Audit',
    description: 'Comprehensive evaluation covering photometric, spectral, vegetation indices, calibration, and hallucination metrics.',
    details: 'Audits PSNR, SSIM, SAM, SID, 4-band RMSE, NDVI/NDWI fidelity, Expected Calibration Error (ECE), and Object Confidence.',
    formula: 'Audit = {PSNR, SSIM, SAM, SID, RMSE_{B02..08}, ΔNDVI, ΔNDWI, ECE, H_rate}'
  },
  {
    id: 'gis_dashboard',
    title: 'GIS Mission Dashboard',
    category: 'gis',
    tag: 'Leaflet + FastAPI + GeoTIFF',
    description: 'Interactive geospatial decision system with Leaflet map, split 10m vs 2.5m viewer, trust heatmaps, and full GeoTIFF preservation.',
    details: 'Preserves CRS (EPSG:4326/32643), Affine transforms, bounding boxes, timestamps, and 4-band rasters for GIS workstations.',
    formula: 'Export: GeoTIFF 4-band Float32 + 1-band Reliability Mask'
  }
];

export const ARCHITECTURE_EDGES: ArchitectureEdge[] = [
  { from: 'copernicus', to: 'cloud_mask' },
  { from: 'cloud_mask', to: 'co_registration' },
  { from: 'co_registration', to: 'patch_sampler' },
  { from: 'patch_sampler', to: 'temporal_stack' },
  { from: 'temporal_stack', to: 'swinir_encoder' },
  { from: 'swinir_encoder', to: 'spatial_branch' },
  { from: 'swinir_encoder', to: 'temporal_branch' },
  { from: 'spatial_branch', to: 'windowed_cross_attn' },
  { from: 'temporal_branch', to: 'windowed_cross_attn' },
  { from: 'windowed_cross_attn', to: 'pixel_shuffle' },
  { from: 'pixel_shuffle', to: 'sr_estimate' },
  { from: 'sr_estimate', to: 'patch_gan' },
  { from: 'sr_estimate', to: 'uncertainty_head' },
  { from: 'sr_estimate', to: 'mc_dropout' },
  { from: 'sr_estimate', to: 'differentiable_physics' },
  { from: 'differentiable_physics', to: 'observation_loss' },
  { from: 'observation_loss', to: 'sr_estimate', label: 'Physical Feedback' },
  { from: 'uncertainty_head', to: 'radiometric_metrics' },
  { from: 'mc_dropout', to: 'radiometric_metrics' },
  { from: 'sr_estimate', to: 'radiometric_metrics' },
  { from: 'sr_estimate', to: 'gis_dashboard' },
  { from: 'radiometric_metrics', to: 'gis_dashboard' }
];

export const RADIOMETRIC_METRICS: MetricValue[] = [
  {
    name: 'Peak Signal-to-Noise Ratio',
    code: 'PSNR',
    value: '34.82',
    unit: 'dB',
    target: '≥ 33.5 dB',
    status: 'demo',
    category: 'photometric',
    description: 'Logarithmic ratio between peak signal power and corrupting noise power across super-resolved pixel arrays.',
    scientificImpact: 'Measures primary pixel-wise luminance and contrast fidelity against high-resolution reference datasets.',
    failureMode: 'A high PSNR alone can mask oversmoothed textures and spectral distortions.'
  },
  {
    name: 'Structural Similarity Index',
    code: 'SSIM',
    value: '0.924',
    unit: '',
    target: '≥ 0.900',
    status: 'demo',
    category: 'photometric',
    description: 'Human-visual perception model evaluating luminance, contrast, and structural correlation in localized image patches.',
    scientificImpact: 'Validates that roads, field borders, and building footprints preserve geometric coherence without tearing.',
    failureMode: 'Can rate blurry edges higher than crisp, slightly shifted genuine features.'
  },
  {
    name: 'Spectral Angle Mapper',
    code: 'SAM',
    value: '0.058',
    unit: 'rad',
    target: '≤ 0.070 rad',
    status: 'target',
    category: 'spectral',
    description: 'Measures angular deviation between reference and super-resolved 4-band spectral vectors in N-dimensional space.',
    scientificImpact: 'Guarantees that multispectral reflectance signatures (chlorophyll red-edge, water absorption) remain uncorrupted.',
    failureMode: 'A high SAM means the model altered the physical material signature (e.g., turning water into asphalt spectral curves).'
  },
  {
    name: 'Spectral Information Divergence',
    code: 'SID',
    value: '0.014',
    unit: '',
    target: '≤ 0.020',
    status: 'demo',
    category: 'spectral',
    description: 'Probabilistic information-theoretic measure of divergence between two spectral probability distributions.',
    scientificImpact: 'Quantifies higher-order spectral statistics and stochastic variance across multi-temporal acquisitions.',
    failureMode: 'Detects non-linear band coupling errors that linear angle metrics fail to catch.'
  },
  {
    name: 'B02 (Blue 490nm) RMSE',
    code: 'RMSE_B02',
    value: '0.018',
    unit: 'ref.',
    target: '≤ 0.025',
    status: 'demo',
    category: 'spectral',
    description: 'Root Mean Squared Error in Bottom of Atmosphere surface reflectance for the Blue spectral band.',
    scientificImpact: 'Essential for atmospheric haze penetration, coastal aerosol analysis, and shallow bathymetry.',
    failureMode: 'High Blue error leads to false atmospheric haze artifacts.'
  },
  {
    name: 'B03 (Green 560nm) RMSE',
    code: 'RMSE_B03',
    value: '0.016',
    unit: 'ref.',
    target: '≤ 0.022',
    status: 'demo',
    category: 'spectral',
    description: 'Root Mean Squared Error in Bottom of Atmosphere surface reflectance for the Green spectral band.',
    scientificImpact: 'Governs vegetation vitality estimation and turbid water body detection.',
    failureMode: 'Distorts natural canopy contrast.'
  },
  {
    name: 'B04 (Red 665nm) RMSE',
    code: 'RMSE_B04',
    value: '0.019',
    unit: 'ref.',
    target: '≤ 0.024',
    status: 'demo',
    category: 'spectral',
    description: 'Root Mean Squared Error in Bottom of Atmosphere surface reflectance for the Red spectral band.',
    scientificImpact: 'Critical absorption band for chlorophyll-a absorption and urban impervious surface discrimination.',
    failureMode: 'Directly impacts vegetation stress calculation in NDVI.'
  },
  {
    name: 'B08 (NIR 842nm) RMSE',
    code: 'RMSE_B08',
    value: '0.023',
    unit: 'ref.',
    target: '≤ 0.030',
    status: 'demo',
    category: 'spectral',
    description: 'Root Mean Squared Error in Bottom of Atmosphere surface reflectance for Near-Infrared.',
    scientificImpact: 'Highest reflectance band over dense biomass; determines crop health, water-land boundary delineation.',
    failureMode: 'Alters agricultural yield forecasts and hydrological mapping.'
  },
  {
    name: 'NDVI Absolute Error',
    code: 'ΔNDVI',
    value: '0.031',
    unit: 'index',
    target: '≤ 0.045',
    status: 'demo',
    category: 'application',
    description: 'Absolute difference between SR-derived Normalized Difference Vegetation Index and true high-res index: |NDVI_SR - NDVI_HR|.',
    scientificImpact: 'Ensures farmers, agronomists, and forestry monitors do not receive false crop-health anomalies from AI super-resolution.',
    failureMode: 'High error causes farmers to misapply nitrogen fertilizers or miss drought stress.'
  },
  {
    name: 'NDWI Absolute Error',
    code: 'ΔNDWI',
    value: '0.028',
    unit: 'index',
    target: '≤ 0.040',
    status: 'demo',
    category: 'application',
    description: 'Absolute difference in Normalized Difference Water Index (Green - NIR)/(Green + NIR).',
    scientificImpact: 'Enables precise shoreline tracking, wetland conservation, and flood extent boundary determination.',
    failureMode: 'Causes synthetic flooding or artificial drought boundary shifts.'
  },
  {
    name: 'Hallucination Rate (High-Freq Mismatch)',
    code: 'H_RATE',
    value: '≤ 4.2%',
    unit: '',
    target: '≤ 5.0%',
    status: 'target',
    category: 'trust',
    description: 'Percentage of high-frequency generated edges that have zero physical support in the temporal observation stack.',
    scientificImpact: 'Guarantees that RAMTSR will not invent non-existent buildings, fictitious roads, or false military assets.',
    failureMode: 'A hallucinated building can trigger catastrophic tactical or urban planning misallocations.'
  },
  {
    name: 'Expected Calibration Error',
    code: 'ECE',
    value: '0.046',
    unit: '',
    target: '≤ 0.060',
    status: 'demo',
    category: 'trust',
    description: 'Weighted average difference between predicted confidence probability and actual empirical accuracy across confidence bins.',
    scientificImpact: 'Proves the uncertainty head is calibrated: when RAMTSR says it is 90% sure, it is mathematically correct 90% of the time.',
    failureMode: 'Uncalibrated models output confident nonsense with 99% certainty.'
  }
];

export const ABLATION_MODELS: AblationModel[] = [
  {
    id: 'm1_swinir_base',
    name: 'SwinIR Baseline (T=1)',
    description: 'Single-frame SwinIR encoder with 4× PixelShuffle upsampling. No temporal awareness, no sensor physics, no uncertainty estimation.',
    temporal: false,
    physics: false,
    gan: false,
    uncertainty: false,
    psnr: 29.41,
    ssim: 0.812,
    sam: 0.118,
    hallucinationRate: 14.8,
    ece: undefined,
    activeModules: ['SwinIR Backbone', 'PixelShuffle ×4'],
    keyInsight: 'Suffers from severe spatial blur, inability to separate clouds from bright roofs, and high spectral distortion (SAM 0.118).'
  },
  {
    id: 'm2_temporal',
    name: '+ Quality Temporal Fusion (T=5)',
    description: 'Adds 5-frame temporal stack with quality-aware attention weighting (Qi = 0.6(1-C) + 0.25S + 0.15B) and windowed cross-attention.',
    temporal: true,
    physics: false,
    gan: false,
    uncertainty: false,
    psnr: 32.18,
    ssim: 0.875,
    sam: 0.089,
    hallucinationRate: 9.6,
    ece: undefined,
    activeModules: ['5-Frame Temporal Stack', 'Quality Attention', '8×8 Cross-Attention', 'PixelShuffle ×4'],
    keyInsight: 'Temporal fusion resolves genuine sub-pixel motion, cloud occlusion recovery, and boosts PSNR by +2.77 dB.'
  },
  {
    id: 'm3_physics',
    name: '+ Differentiable Sensor Model',
    description: 'Introduces Gaussian PSF (9×9, σ=1.5), Sentinel-2 SRF convolution, 4× downsampling, and Observation Loss Lobs = L1 + 0.2·SAM.',
    temporal: true,
    physics: true,
    gan: false,
    uncertainty: false,
    psnr: 33.64,
    ssim: 0.901,
    sam: 0.063,
    hallucinationRate: 3.8,
    ece: undefined,
    activeModules: ['Temporal Fusion', 'Gaussian PSF 9×9', 'Sentinel-2 SRF', 'Lobs Loss', 'PixelShuffle ×4'],
    keyInsight: 'Crucial turning point: Hallucination rate drops dramatically from 9.6% down to 3.8% because physics forces observation consistency.'
  },
  {
    id: 'm4_gan',
    name: '+ Perceptual PatchGAN',
    description: 'Adds 70×70 Markovian discriminator with conservative 0.01 weight to reconstruct fine natural soil and canopy micro-textures.',
    temporal: true,
    physics: true,
    gan: true,
    uncertainty: false,
    psnr: 33.95,
    ssim: 0.914,
    sam: 0.065,
    hallucinationRate: 4.6,
    ece: undefined,
    activeModules: ['Temporal Fusion', 'Physics Model', 'PatchGAN Discriminator', 'VGG Perceptual', 'Lobs Loss'],
    keyInsight: 'Sharper perceptual textures achieved without unconstrained hallucination due to the reigning in by Lobs.'
  },
  {
    id: 'm5_full_ramtsr',
    name: 'RAMTSR Full Pipeline (+ Uncertainty)',
    description: 'The complete system: SwinIR + Quality Temporal Attention + Windowed Cross-Attn + Physics Constraint + Heteroscedastic σ² + MC-Dropout.',
    temporal: true,
    physics: true,
    gan: true,
    uncertainty: true,
    psnr: 34.82,
    ssim: 0.924,
    sam: 0.058,
    hallucinationRate: 4.2,
    ece: 0.046,
    activeModules: ['All Modules', 'Heteroscedastic σ²', 'MC-Dropout (16)', 'Trust Heatmap', 'ECE Calibrated'],
    keyInsight: 'Highest overall fidelity + the unique capability to flag remaining uncertain pixels with a calibrated reliability map.'
  }
];

export const TEMPORAL_FRAMES_DATA: TemporalFrameData[] = [
  {
    id: 't_minus_2',
    label: 'T − 2',
    dateOffset: '− 20 Days (Aug 10)',
    cloudProb: 0.04,
    sharpness: 0.91,
    blur: 0.08,
    qualityScore: 0.86,
    status: 'optimal',
    previewColor: '#22C55E'
  },
  {
    id: 't_minus_1',
    label: 'T − 1',
    dateOffset: '− 10 Days (Aug 20)',
    cloudProb: 0.42,
    sharpness: 0.65,
    blur: 0.35,
    qualityScore: 0.52,
    status: 'acceptable',
    previewColor: '#FACC15'
  },
  {
    id: 't_zero',
    label: 'T 0',
    dateOffset: '0 Days (Target: Aug 30)',
    cloudProb: 0.02,
    sharpness: 0.96,
    blur: 0.05,
    qualityScore: 0.94,
    status: 'optimal',
    previewColor: '#00F0FF'
  },
  {
    id: 't_plus_1',
    label: 'T + 1',
    dateOffset: '+ 10 Days (Sep 09)',
    cloudProb: 0.78,
    sharpness: 0.40,
    blur: 0.60,
    qualityScore: 0.28,
    status: 'degraded',
    previewColor: '#FF334F'
  },
  {
    id: 't_plus_2',
    label: 'T + 2',
    dateOffset: '+ 20 Days (Sep 19)',
    cloudProb: 0.12,
    sharpness: 0.88,
    blur: 0.15,
    qualityScore: 0.81,
    status: 'optimal',
    previewColor: '#22C55E'
  }
];

export const DATASET_DISTRIBUTION = [
  { biome: 'Urban & Built Environment', percent: 20, color: '#6D35FF', desc: 'Complex geometric shadows, narrow alleys, roof textures, road networks' },
  { biome: 'Agriculture & Croplands', percent: 20, color: '#22C55E', desc: 'Irrigation canals, field boundary plots, seasonal crop rotations' },
  { biome: 'Dense Forest & Canopy', percent: 20, color: '#00B8D4', desc: 'High-frequency biomass textures, undulating tree shadows, terrain slopes' },
  { biome: 'Water Bodies & Coastal', percent: 20, color: '#2D7DFF', desc: 'Specular reflections, sediment plumes, sharp shoreline boundaries' },
  { biome: 'Mountain & High Relief', percent: 20, color: '#FACC15', desc: 'Severe topographic parallax, snow cover, deep cliff shadows' }
];

export const DATASET_CARDS = [
  {
    name: 'WorldStrat',
    role: 'Primary Training Stack',
    specs: '5× Temporal Sentinel-2 (10m) paired with SPOT-6/7 (1.5m)',
    samples: '4,500+ global AOIs',
    highlight: 'Global stratified biome sampling covering 5 continents',
    color: '#00F0FF'
  },
  {
    name: 'SEN2NAIP',
    role: 'Cross-Sensor Urban Benchmark',
    specs: 'Sentinel-2 (10m) paired with airborne NAIP (1.0m)',
    samples: '100,000+ image chips',
    highlight: 'Dense urban infrastructure, commercial zones, transportation corridors',
    color: '#6D35FF'
  },
  {
    name: 'SEN2VENµS',
    role: 'Physics & Geometric Validation',
    specs: 'Sentinel-2 (10m) paired with VENµS super-spectral (5.0m)',
    samples: '29 worldwide observatories',
    highlight: 'High-frequency 2-day revisit cadence for exact temporal matching',
    color: '#B7F000'
  },
  {
    name: 'OpenSR-Test',
    role: 'Independent Blind Benchmark',
    specs: 'Multi-sensor zero-shot evaluation suite',
    samples: 'Standardized evaluation protocols',
    highlight: 'Rigorous independent validation without data leakage',
    color: '#FF334F'
  }
];

export const TRAINING_PHASES = [
  {
    phase: '01',
    title: 'Core Geometry Initialization',
    formula: 'L = ||I_SR - I_HR||₁ + 0.5 · SAM(I_SR, I_HR)',
    epochs: 'Epochs 1 – 25',
    focus: 'Stable geometric convergence and rough spectral alignment without high-frequency artifacts.',
    status: 'Base Convergence',
    tagColor: '#2D7DFF'
  },
  {
    phase: '02',
    title: 'Physics Constraint Enforcement',
    formula: '+ 0.3 · L_obs [ ||F(SR) - LR||₁ + 0.2·SAM ]',
    epochs: 'Epochs 26 – 50',
    focus: 'Forces generated 2.5m tokens to physically downsample into the original 10m Sentinel-2 observation.',
    status: 'Physics Lock',
    tagColor: '#00F0FF'
  },
  {
    phase: '03',
    title: 'Perceptual Texture Refinement',
    formula: '+ 0.1 · L_VGG + 0.01 · L_GAN',
    epochs: 'Epochs 51 – 75',
    focus: 'Reconstructs crisp natural soil, canopy, and roof textures while strictly bound by the physics constraint.',
    status: 'Texture Activation',
    tagColor: '#6D35FF'
  },
  {
    phase: '04',
    title: 'Uncertainty Calibration & Reliability',
    formula: '+ 0.1 · L_NLL(σ²) + MC-Dropout Sampling',
    epochs: 'Epochs 76 – 100',
    focus: 'Trains heteroscedastic noise head to quantify per-pixel aleatoric variance and calibrates ECE.',
    status: 'Trust Calibration',
    tagColor: '#B7F000'
  }
];

export const GIS_LOCATIONS: GISLocation[] = [
  {
    id: 'delhi_urban',
    name: 'Delhi National Capital Region',
    category: 'Dense Urban & Roads',
    lat: 28.6139,
    lng: 77.2090,
    zoom: 13,
    description: 'High-density urban sprawl with complex residential blocks, ring roads, and rapid infrastructure expansion.',
    bbox: [77.15, 28.55, 77.28, 28.68],
    crs: 'EPSG:32643 (UTM Zone 43N)',
    acquisitionDate: '2026-08-15 T05:42:19Z',
    bands: ['B02', 'B03', 'B04', 'B08'],
    resolution: '10m → 2.5m (4× Super-Resolved)',
    objects: [
      { name: 'Government Complex', type: 'building', confidence: 94.8, uncertainty: 'LOW', spectralError: 0.018, status: 'RELIABLE', x: 42, y: 35 },
      { name: 'Ring Road Interchange', type: 'road', confidence: 91.2, uncertainty: 'LOW', spectralError: 0.022, status: 'RELIABLE', x: 68, y: 55 },
      { name: 'Yamuna River Bank', type: 'water', confidence: 88.5, uncertainty: 'MEDIUM', spectralError: 0.034, status: 'VERIFIED', x: 80, y: 25 },
      { name: 'Informal Settlement Zone', type: 'building', confidence: 72.4, uncertainty: 'HIGH', spectralError: 0.068, status: 'SUSPECT', x: 25, y: 70 }
    ]
  },
  {
    id: 'punjab_farmland',
    name: 'Punjab Agricultural Belt (Ludhiana)',
    category: 'Precision Agriculture',
    lat: 30.9010,
    lng: 75.8573,
    zoom: 13,
    description: 'Stratified agricultural plot grid with micro-irrigation channels, diverse crop phenology, and variable soil moisture.',
    bbox: [75.78, 30.82, 75.92, 30.96],
    crs: 'EPSG:32643 (UTM Zone 43N)',
    acquisitionDate: '2026-08-20 T05:48:02Z',
    bands: ['B02', 'B03', 'B04', 'B08'],
    resolution: '10m → 2.5m (4× Super-Resolved)',
    objects: [
      { name: 'Paddy Field Sector A', type: 'vegetation', confidence: 96.1, uncertainty: 'LOW', spectralError: 0.012, status: 'RELIABLE', x: 30, y: 40 },
      { name: 'Primary Irrigation Canal', type: 'water', confidence: 93.4, uncertainty: 'LOW', spectralError: 0.019, status: 'RELIABLE', x: 55, y: 20 },
      { name: 'Farm Access Road', type: 'road', confidence: 86.7, uncertainty: 'MEDIUM', spectralError: 0.031, status: 'VERIFIED', x: 45, y: 75 },
      { name: 'Hazy Tree Boundary', type: 'vegetation', confidence: 78.2, uncertainty: 'HIGH', spectralError: 0.052, status: 'SUSPECT', x: 85, y: 60 }
    ]
  },
  {
    id: 'mumbai_coastal',
    name: 'Mumbai Coastal & Port Infrastructure',
    category: 'Maritime & Shoreline',
    lat: 18.9438,
    lng: 72.8354,
    zoom: 13,
    description: 'High-contrast land-sea interface, shipping port terminals, coastal mangroves, and urban reclamation projects.',
    bbox: [72.78, 18.88, 72.90, 19.01],
    crs: 'EPSG:32643 (UTM Zone 43N)',
    acquisitionDate: '2026-08-25 T05:51:14Z',
    bands: ['B02', 'B03', 'B04', 'B08'],
    resolution: '10m → 2.5m (4× Super-Resolved)',
    objects: [
      { name: 'Container Terminal Dock', type: 'building', confidence: 95.2, uncertainty: 'LOW', spectralError: 0.015, status: 'RELIABLE', x: 50, y: 45 },
      { name: 'Coastal Reclamation Sea Link', type: 'road', confidence: 92.8, uncertainty: 'LOW', spectralError: 0.021, status: 'RELIABLE', x: 25, y: 35 },
      { name: 'Harbor Shipping Channel', type: 'water', confidence: 97.0, uncertainty: 'LOW', spectralError: 0.009, status: 'RELIABLE', x: 75, y: 70 },
      { name: 'Turbid Mudflat Zone', type: 'water', confidence: 69.8, uncertainty: 'HIGH', spectralError: 0.074, status: 'SUSPECT', x: 85, y: 15 }
    ]
  },
  {
    id: 'himalayas_valley',
    name: 'Himalayan High Relief (Uttarakhand)',
    category: 'Mountain & Hazard Monitoring',
    lat: 30.3165,
    lng: 78.0322,
    zoom: 13,
    description: 'Steep topographic gradients, glacier-fed river gorges, landslide hazard zones, and mountain forest slopes.',
    bbox: [77.95, 30.25, 78.10, 30.40],
    crs: 'EPSG:32644 (UTM Zone 44N)',
    acquisitionDate: '2026-08-28 T05:44:30Z',
    bands: ['B02', 'B03', 'B04', 'B08'],
    resolution: '10m → 2.5m (4× Super-Resolved)',
    objects: [
      { name: 'Ganga Valley River Bed', type: 'water', confidence: 91.5, uncertainty: 'LOW', spectralError: 0.023, status: 'RELIABLE', x: 40, y: 60 },
      { name: 'Hill Ridge Forest', type: 'vegetation', confidence: 89.2, uncertainty: 'MEDIUM', spectralError: 0.029, status: 'RELIABLE', x: 65, y: 30 },
      { name: 'Highway 7 Highway Cut', type: 'road', confidence: 84.6, uncertainty: 'MEDIUM', spectralError: 0.038, status: 'VERIFIED', x: 30, y: 80 },
      { name: 'Deep Shadow Slope', type: 'vegetation', confidence: 64.2, uncertainty: 'HIGH', spectralError: 0.089, status: 'SUSPECT', x: 80, y: 15 }
    ]
  }
];

export const REPO_STRUCTURE = [
  {
    path: 'config/',
    name: 'config',
    type: 'dir',
    desc: 'YAML and Python configuration files for model hyperparameters, dataset paths, and training curricula',
    files: ['train_config.yaml', 'sensor_s2.yaml', 'eval_metrics.yaml']
  },
  {
    path: 'ramtsr/models/',
    name: 'models',
    type: 'dir',
    desc: 'Neural network architectures: SwinIR backbone, windowed cross-attention, temporal fusion, and uncertainty heads',
    files: ['swinir_backbone.py', 'temporal_attention.py', 'windowed_cross_attn.py', 'uncertainty_head.py', 'patch_gan.py']
  },
  {
    path: 'ramtsr/physics/',
    name: 'physics',
    type: 'dir',
    desc: 'Differentiable sensor degradation: Gaussian PSF, Sentinel-2 spectral response functions, and sub-pixel downsampling',
    files: ['sensor_forward_model.py', 'psf_kernel.py', 'srf_curves.py', 'co_registration.py']
  },
  {
    path: 'ramtsr/losses/',
    name: 'losses',
    type: 'dir',
    desc: 'Loss functions: Observation loss (L1 + SAM), Heteroscedastic NLL, perceptual VGG, and PatchGAN adversarial losses',
    files: ['observation_loss.py', 'spectral_losses.py', 'nll_loss.py', 'adversarial_loss.py']
  },
  {
    path: 'ramtsr/metrics/',
    name: 'metrics',
    type: 'dir',
    desc: 'Scientific evaluation suite: PSNR, SSIM, SAM, SID, 4-band RMSE, NDVI/NDWI fidelity, ECE calibration, and hallucination rate',
    files: ['radiometric_audit.py', 'spectral_metrics.py', 'calibration_ece.py', 'hallucination_detector.py']
  },
  {
    path: 'ramtsr/data/',
    name: 'data',
    type: 'dir',
    desc: 'Data loaders: Copernicus OData stream, cloud masking (SCL + s2cloudless), 5-frame stack builder, and land-cover balanced sampler',
    files: ['copernicus_loader.py', 'cloud_masking.py', 'temporal_stack_builder.py', 'balanced_patch_sampler.py']
  },
  {
    path: 'api/',
    name: 'api',
    type: 'dir',
    desc: 'FastAPI production service serving inference endpoints, Leaflet GIS web dashboard, and GeoTIFF tile streaming',
    files: ['app.py', 'routes_infer.py', 'routes_gis.py', 'geotiff_serializer.py']
  },
  {
    path: 'scripts/',
    name: 'scripts',
    type: 'dir',
    desc: 'CLI utilities for 4-phase training curriculum, 5-model ablation benchmarks, and automated report generation',
    files: ['train_4phase.py', 'run_ablation_benchmarks.py', 'export_onnx.py', 'evaluate_checkpoint.py']
  }
];
