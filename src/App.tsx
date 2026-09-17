import { useState } from 'react';
import RandomizerTab from './components/RandomizerTab';
import CreateTableTab from './components/CreateTableTab';

function App() {
  const [activeTab, setActiveTab] = useState<'randomizer' | 'createTable'>('randomizer');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'randomizer'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
          }`}
          onClick={() => setActiveTab('randomizer')}
        >
          🎲 Randomizer
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'createTable'
              ? 'bg-gray-700 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
          }`}
          onClick={() => setActiveTab('createTable')}
        >
          📊 Создать таблицу
        </button>
      </div>

      {/* Tab Content — оба компонента всегда примонтированы, просто скрываются через CSS */}
      <div className={activeTab === 'randomizer' ? 'p-4' : 'hidden'}>
        <RandomizerTab />
      </div>
      <div className={activeTab === 'createTable' ? 'p-4' : 'hidden'}>
        <CreateTableTab />
      </div>
    </div>
  );
}

export default App;
