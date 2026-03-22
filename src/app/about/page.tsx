export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">About ASTRASENSE</h2>
        <p className="max-w-3xl text-white/70">
          ASTRASENSE is a simulated environmental intelligence platform that
          converts satellite-style indices into hazard risk predictions. It is
          designed to resemble professional tools used by climate scientists and
          disaster management agencies.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">
            Satellite indicators
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <span className="text-white">NDVI</span> — vegetation health
            </li>
            <li>
              <span className="text-white">NDWI</span> — water content / surface
              moisture
            </li>
            <li>
              <span className="text-white">LST</span> — land surface temperature
            </li>
            <li>
              <span className="text-white">EVI</span> — enhanced vegetation index
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">AI risk outputs</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              Flood risk (0–100) based on moisture + rainfall proxy + terrain
              proxy
            </li>
            <li>Drought probability based on heat + low water index</li>
            <li>Vegetation stress from low NDVI/EVI + high LST</li>
            <li>Land degradation risk from prolonged dryness + stress</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">System workflow</div>
          <p className="mt-2 text-sm text-white/70">
            The platform simulates a satellite-to-risk pipeline. In production
            systems, indices are computed from multi-spectral imagery and fed to
            a trained model; here, we generate realistic values with geography +
            seasonality logic and compute explainable risks.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <pre className="overflow-x-auto p-4 text-xs text-white/70">
{`flowchart LR
  user[UserSearchLocation] --> geo[Geocoding(OpenCage)]
  geo --> coords[LatLng]
  coords --> sim[SimulationEngine]
  sim --> indices[Indices(NDVI,NDWI,LST,EVI)]
  sim --> risks[HazardProbabilities]
  sim --> alerts[AlertTriggers]
  coords --> map[MapLayers(Street/Satellite,Heatmaps)]
  indices --> dash[DashboardCards]
  risks --> dash
  alerts --> alertCenter[AlertCenter]
  sim --> charts[TimeSeriesAnalytics]
  charts --> dash`}
            </pre>
          </div>
          <p className="mt-3 text-xs text-white/50">
            Diagram is provided in Mermaid syntax for clarity (rendering depends
            on host support).
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">
            Index interpretation
          </div>
          <div className="mt-3 space-y-3 text-sm text-white/70">
            <div>
              <div className="text-white">NDVI / EVI</div>
              <div className="text-white/65">
                Lower values can indicate sparse vegetation, stress, or seasonal
                dormancy.
              </div>
            </div>
            <div>
              <div className="text-white">NDWI</div>
              <div className="text-white/65">
                Higher values suggest higher surface moisture or open water
                presence.
              </div>
            </div>
            <div>
              <div className="text-white">LST</div>
              <div className="text-white/65">
                Elevated surface temperature can amplify drought and vegetation
                stress.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

