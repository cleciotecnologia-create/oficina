export interface BrandSuggestion {
  name: string;
  emoji: string;
  models: string[];
}

export const AUTO_SUGGESTIONS: BrandSuggestion[] = [
  { name: 'Volkswagen', emoji: '🇩🇪', models: ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Jetta', 'Golf', 'Saveiro', 'Voyage', 'Amarok'] },
  { name: 'Chevrolet', emoji: '🇺🇸', models: ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Spin', 'Celta', 'Corsa', 'Trailblazer', 'Montana'] },
  { name: 'Fiat', emoji: '🇮🇹', models: ['Uno', 'Palio', 'Toro', 'Argo', 'Cronos', 'Mobi', 'Strada', 'Fiorino', 'Fastback', 'Pulse'] },
  { name: 'Ford', emoji: '🇺🇸', models: ['Ka', 'Fiesta', 'Focus', 'EcoSport', 'Ranger', 'Fusion', 'Territory', 'Ka Sedan'] },
  { name: 'Toyota', emoji: '🇯🇵', models: ['Corolla', 'Hilux', 'Etios', 'Yaris', 'SW4', 'RAV4', 'Corolla Cross'] },
  { name: 'Honda', emoji: '🇯🇵', models: ['Civic', 'Fit', 'HR-V', 'City', 'WR-V', 'Accord', 'CR-V'] },
  { name: 'Hyundai', emoji: '🇰🇷', models: ['HB20', 'Creta', 'Tucson', 'i30', 'Santa Fe', 'HB20S', 'Elantra'] },
  { name: 'Renault', emoji: '🇫🇷', models: ['Sandero', 'Logan', 'Duster', 'Kwid', 'Captur', 'Oroch', 'Clio'] },
  { name: 'Nissan', emoji: '🇯🇵', models: ['Kicks', 'March', 'Versa', 'Frontier', 'Sentra', 'Tiida'] },
  { name: 'Jeep', emoji: '🇺🇸', models: ['Renegade', 'Compass', 'Commander', 'Cherokee'] }
];
