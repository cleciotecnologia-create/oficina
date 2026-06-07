interface Part {
  name: string;
  category: string;
  oemReference: string;
  shortDescription: string;
}

export interface VehicleSpecs {
  oilViscosity: string;
  oilSpecification: string;
  oilCapacity: string;
  oilType: string;
  oilAdditionalNotes: string;
  commonParts: Part[];
  technicalNotes: string;
  brand?: string;
  engine?: string;
}

const CACHE_PREFIX = "oficina_ia_specs_cache:";

/**
 * Generates a storage key for a vehicle search based on model, year, and optional motorization.
 */
function getCacheKey(model: string, year: string, motor: string = ""): string {
  const normModel = model.trim().toLowerCase().replace(/\s+/g, "_");
  const normYear = year.trim().toLowerCase();
  const normMotor = motor.trim().toLowerCase().replace(/\s+/g, "_");
  return `${CACHE_PREFIX}${normModel}:${normYear}:${normMotor}`;
}

export const specsCache = {
  /**
   * Retrieves specs from standard client-side localStorage.
   */
  get(model: string, year: string, motor: string = ""): VehicleSpecs | null {
    try {
      const key = getCacheKey(model, year, motor);
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      return JSON.parse(cached) as VehicleSpecs;
    } catch (e) {
      console.error("Erro ao ler do cache de especificações:", e);
      return null;
    }
  },

  /**
   * Stores specs in standard client-side localStorage.
   */
  set(model: string, year: string, motor: string = "", specs: VehicleSpecs): void {
    try {
      const key = getCacheKey(model, year, motor);
      localStorage.setItem(key, JSON.stringify(specs));
    } catch (e) {
      console.error("Erro ao salvar no cache de especificações:", e);
    }
  },

  /**
   * Returns all cached models for informational/management displays if desired.
   */
  getAllCached(): Array<{ model: string; year: string; motor: string; specs: VehicleSpecs }> {
    const list: Array<{ model: string; year: string; motor: string; specs: VehicleSpecs }> = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parts = key.replace(CACHE_PREFIX, "").split(":");
            list.push({
              model: parts[0] ? parts[0].replace(/_/g, " ").toUpperCase() : "Desconhecido",
              year: parts[1] || "",
              motor: parts[2] ? parts[2].replace(/_/g, " ").toUpperCase() : "",
              specs: JSON.parse(raw)
            });
          }
        }
      }
    } catch (e) {
      console.error("Erro ao varrer lista de cache:", e);
    }
    return list;
  },

  /**
   * Clears all specs from cache.
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error("Erro ao limpar cache de especificações:", e);
    }
  }
};
