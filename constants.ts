
import { VintageStyle } from './types';

export const VINTAGE_STYLES: VintageStyle[] = [
  {
    id: 'silent-cinema',
    name: 'Silent Cinema (1920s)',
    description: 'High contrast black and white, heavy grain, and frame flickering.',
    prompt: 'A 1920s silent film aesthetic. Black and white, heavy film grain, dust scratches, jittery frame, high contrast archival footage.',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'technicolor-70s',
    name: 'Technicolor (1970s)',
    description: 'Warm color grading, soft focus, and characteristic film burns.',
    prompt: '1970s technicolor film style. Warm yellow and orange hues, soft glow, slight color bleeding, authentic 35mm film texture.',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'vhs-90s',
    name: 'VHS Camcorder (1990s)',
    description: 'Tracking lines, magnetic interference, and low-res glow.',
    prompt: '90s home video VHS aesthetic. Tracking artifacts, magnetic tape noise, color ghosting, slightly desaturated, interlaced scanning lines.',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '8mm-home',
    name: '8mm Home Movie',
    description: 'Nostalgic, oversaturated colors with heavy frame jitter.',
    prompt: '8mm home movie footage. Handheld jitter, vibrant but aged colors, rounded corners, light leaks, dust, and heavy film texture.',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'noir-detective',
    name: 'Noir Detective',
    description: 'Moody shadows, sharp lighting, and cinematic smoke.',
    prompt: 'Classic Film Noir style. Deep shadows, low-key lighting, smoky atmosphere, dramatic monochrome transitions, high aesthetic grain.',
    thumbnail: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=200'
  }
];

export const LOADING_MESSAGES = [
  "Restoring celluloid archives...",
  "Applying chemical development process...",
  "Calibrating the light projector...",
  "Scanning negative frames...",
  "Interpolating lost motion data...",
  "Simulating 24 frames per second...",
  "Adding historical character grain...",
  "Finalizing the archival transfer..."
];
