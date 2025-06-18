import React, { useState, useEffect } from 'react';
import { Sun, Moon, Contrast, Maximize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface PreviewDisplayProps {
  children: React.ReactNode;
  defaultBrightness?: number; // 0-200, 100 is normal
  defaultContrast?: number; // 0-200, 100 is normal
  defaultZoom?: number; // 50-150, 100 is normal
}

export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({
  children,
  defaultBrightness = 100,
  defaultContrast = 100,
  defaultZoom = 100
}) => {
  const [brightness, setBrightness] = useState(defaultBrightness);
  const [contrast, setContrast] = useState(defaultContrast);
  const [zoom, setZoom] = useState(defaultZoom);
  const [isAutoAdjusting, setIsAutoAdjusting] = useState(false);

  // Auto-adjust settings based on content
  const autoAdjust = () => {
    setIsAutoAdjusting(true);
    // Simulate analysis and adjustment
    setTimeout(() => {
      setBrightness(110); // Slightly increased brightness
      setContrast(115); // Slightly increased contrast
      setZoom(100); // Reset zoom
      setIsAutoAdjusting(false);
    }, 1000);
  };

  // Reset to defaults
  const resetSettings = () => {
    setBrightness(defaultBrightness);
    setContrast(defaultContrast);
    setZoom(defaultZoom);
  };

  // Update styles when settings change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--preview-brightness', `${brightness}%`);
    root.style.setProperty('--preview-contrast', `${contrast}%`);
    root.style.setProperty('--preview-zoom', `${zoom}%`);
  }, [brightness, contrast, zoom]);

  return (
    <div className="bg-black/90 p-6 rounded-xl border border-green-500/30">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-6">
          {/* Brightness Control */}
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-green-400" />
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-24 accent-green-500"
              title="Brightness"
            />
          </div>

          {/* Contrast Control */}
          <div className="flex items-center gap-2">
            <Contrast className="w-5 h-5 text-green-400" />
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-24 accent-green-500"
              title="Contrast"
            />
          </div>

          {/* Zoom Control */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 hover:text-green-400 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-1 hover:text-green-400 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm">{zoom}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-Adjust Button */}
          <button
            onClick={autoAdjust}
            disabled={isAutoAdjusting}
            className={`px-3 py-1 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-all flex items-center gap-2 ${
              isAutoAdjusting ? 'opacity-50 cursor-wait' : ''
            }`}
            title="Auto-Adjust Settings"
          >
            <RefreshCw className={`w-4 h-4 ${isAutoAdjusting ? 'animate-spin' : ''}`} />
            <span className="text-sm">Auto</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="px-3 py-1 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-all"
            title="Reset Settings"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="relative rounded-lg overflow-hidden bg-black"
        style={{
          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center',
          transition: 'filter 0.3s ease, transform 0.3s ease'
        }}
      >
        {children}
      </div>

      {/* Settings Display */}
      <div className="mt-4 flex justify-end gap-4 text-sm text-green-400/70">
        <span>Brightness: {brightness}%</span>
        <span>Contrast: {contrast}%</span>
        <span>Zoom: {zoom}%</span>
      </div>
    </div>
  );
};