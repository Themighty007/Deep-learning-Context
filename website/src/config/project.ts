export const PROJECT_CONFIG = {
  name: "RAMTSR",
  fullName: "Reliability-Aware Multi-Temporal Super Resolution",
  slogan: "See More. Trust What You See.",
  subSlogan: "2.5 m spatial detail from 10 m Sentinel-2 observations — with uncertainty attached.",
  philosophy: "We don't just generate pixels. We quantify trust.",
  sihId: "SIH26142",
  organization: "NTRO",
  orgFullName: "National Technical Research Organisation",
  domain: "Space Technology / Earth Observation AI",
  githubUrl: "https://github.com/Themighty007/Deep-learning-Context",
  inputResolution: "10 m",
  outputResolution: "2.5 m inferred",
  scaleFactor: "4×",
  temporalFrames: 5,
  bands: ["B02 (Blue 490nm)", "B03 (Green 560nm)", "B04 (Red 665nm)", "B08 (NIR 842nm)"],
  fastApiDocsUrl: "http://localhost:8000/docs",
  indiaCoords: {
    lat: 22.5,
    lng: 78.9,
  }
};
