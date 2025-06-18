import React, { useState } from 'react';
import { Headphones, Download } from 'lucide-react';

export const PodcastSection: React.FC = () => {
  const [showPodcasts, setShowPodcasts] = useState(false);

  const podcastCategories = [
    {
      category: 'Assurance Vie',
      podcasts: [
        {
          title: 'Assurance Vie - Épisode 1',
          url: 'https://dl.dropboxusercontent.com/scl/fi/83cvytatvm7zwzku2m0du/ass.vie.mp3?rlkey=cv0y5khiserx1xqvpkhuhuatk&st=ei8ysk8w'
        }
      ]
    },
    {
      category: 'Assurance Maladie',
      podcasts: [
        {
          title: 'Assurance Maladie - Épisode 1',
          url: 'https://dl.dropboxusercontent.com/scl/fi/ks7ivkxyfge5cxjbc239u/Ass.maladie.mp3?rlkey=4mx7v5x6yinwbdd8zaeqopikr&st=pkxwjvxb'
        }
      ]
    },
    {
      category: 'Déontologie',
      podcasts: [
        {
          title: 'Déontologie - Épisode 1',
          url: 'https://dl.dropboxusercontent.com/scl/fi/lqw6c24xkaanmvqcabo2j/D-ontologie.mp3?rlkey=xrcdz5juov7wksa710mint22c&st=z6g5sbvt'
        }
      ]
    },
    {
      category: 'Fonds et Rentes',
      podcasts: [
        {
          title: 'Fonds et Rentes - Épisode 1',
          url: 'https://dl.dropboxusercontent.com/scl/fi/mvuurtdg1uujvc7pg2g98/fond-et-rente.mp3?rlkey=z0z5hnylsru1rmmixbi9fu70v&st=flktxody'
        }
      ]
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Headphones className="w-6 h-6" />
        Podcasts Intelligents <span className="text-sm text-green-400">(Bêta)</span>
      </h2>

      <p className="text-green-300/70 mb-6">
        Ces épisodes ont été générés par intelligence artificielle pour renforcer votre apprentissage. Version démonstration à tester !
      </p>

      <button
        onClick={() => setShowPodcasts(!showPodcasts)}
        className="mb-6 px-4 py-2 bg-green-900/30 border border-green-500 rounded-lg hover:bg-green-800/30 transition-all"
      >
        🎧 {showPodcasts ? 'Masquer les podcasts' : 'Afficher les podcasts'}
      </button>

      {showPodcasts && (
        <div className="space-y-8">
          {podcastCategories.map((category, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold mb-4 border-b border-green-700 pb-1">
                🎙️ {category.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.podcasts.map((podcast, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl border-2 border-green-900/50 bg-black/30 hover:border-green-700 transition-all"
                  >
                    <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      {podcast.title}
                    </h4>
                    <audio controls className="w-full rounded-md mb-3">
                      <source src={podcast.url} type="audio/mpeg" />
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                    <a
                      href={podcast.url}
                      download
                      className="inline-flex items-center gap-2 text-sm px-3 py-1 border border-green-500 rounded-md hover:bg-green-900/30 transition-all"
                    >
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};