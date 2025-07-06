import React, { useState, useEffect } from 'react';
import './Animaciones/PokemonFetcher.css';
import './Animaciones/Animaciones.css';
import './Animaciones/Animaciones3D.css';

const PokemonFetcher = () => {
const [pokemones, setPokemones] = useState([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState(null);
const [captured, setCaptured] = useState(new Set());
const [playerLevel, setPlayerLevel] = useState(1);
const [exp, setExp] = useState(0);
const [maxExp, setMaxExp] = useState(100);
const [capturingId, setCapturingId] = useState(null);
const [notifications, setNotifications] = useState([]);
const [levelUpAnimation, setLevelUpAnimation] = useState(false);
const [expGainAnimation, setExpGainAnimation] = useState(false);
const [missions, setMissions] = useState([
    {
    id: 1,
    title: "Primer Entrenador",
    description: "Captura tu primer Pokémon",
    target: 1,
    progress: 0,
    completed: false,
    reward: 50,
    type: "capture"
    },
    {
    id: 2,
    title: "Coleccionista",
    description: "Captura 3 Pokémon diferentes",
    target: 3,
    progress: 0,
    completed: false,
    reward: 100,
    type: "capture"
    },
    {
    id: 3,
    title: "Maestro Pokémon",
    description: "Captura 5 Pokémon diferentes",
    target: 5,
    progress: 0,
    completed: false,
    reward: 200,
    type: "capture"
    }
]);

  // Cargar datos del almacenamiento local al iniciar
useEffect(() => {
    const savedData = localStorage.getItem('pokemonGameData');
    if (savedData) {
    try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.captured) {
        setCaptured(new Set(parsedData.captured));
        }
        if (parsedData.playerLevel) {
        setPlayerLevel(parsedData.playerLevel);
        }
        if (parsedData.exp !== undefined) {
        setExp(parsedData.exp);
        }
        if (parsedData.maxExp) {
        setMaxExp(parsedData.maxExp);
        }
        if (parsedData.missions) {
        setMissions(parsedData.missions);
        }
    } catch (error) {
        console.error('Error al cargar datos guardados:', error);
    }
    }
}, []);

  // Guardar datos en almacenamiento local cuando cambien
useEffect(() => {
    const dataToSave = {
    captured: Array.from(captured),
    playerLevel,
    exp,
    maxExp,
    missions,
    lastSaved: new Date().toISOString()
    };
    localStorage.setItem('pokemonGameData', JSON.stringify(dataToSave));
}, [captured, playerLevel, exp, maxExp, missions]);

useEffect(() => {
    const fetchPokemones = async () => {
    try {
        setCargando(true);
        setError(null);
        const fetchedPokemones = [];
        const pokemonIds = new Set();

        while (pokemonIds.size < 6) {
          const randomId = Math.floor(Math.random() * 898) + 1;
        pokemonIds.add(randomId);
        }

        const idsArray = Array.from(pokemonIds);

        for (const id of idsArray) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        if (!response.ok) {
            throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        fetchedPokemones.push({
            id: data.id,
            nombre: data.name,
            imagen: data.sprites.front_default,
            tipos: data.types.map(typeInfo => typeInfo.type.name),
            appearing: true
        });
        }
        setPokemones(fetchedPokemones);
        
        setTimeout(() => {
        setPokemones(prev => prev.map(p => ({ ...p, appearing: false })));
        }, 1000);
    } catch (err) {
        setError(err.message);
    } finally {
        setCargando(false);
    }
    };

    fetchPokemones();
}, []);

const addNotification = (message, type = 'default') => {
    const notification = {
    id: Date.now(),
    message,
    type
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
};

const gainExp = (amount) => {
    setExpGainAnimation(true);
    setTimeout(() => setExpGainAnimation(false), 1000);
    
    setExp(prevExp => {
    const newExp = prevExp + amount;
    if (newExp >= maxExp) {
        const newLevel = playerLevel + 1;
        setPlayerLevel(newLevel);
        setMaxExp(newLevel * 100);
        setLevelUpAnimation(true);
        addNotification(`¡Subiste al nivel ${newLevel}!`, 'level-up');
        setTimeout(() => setLevelUpAnimation(false), 2000);
        return newExp - maxExp;
    }
    return newExp;
    });
};

const updateMissions = (capturedCount) => {
    setMissions(prevMissions => {
    return prevMissions.map(mission => {
        if (mission.type === 'capture' && !mission.completed) {
        const newProgress = Math.min(capturedCount, mission.target);
        const isCompleted = newProgress >= mission.target;
        
        if (isCompleted && !mission.completed) {
            gainExp(mission.reward);
            addNotification(`¡Misión completada: ${mission.title}!`, 'mission-complete');
        }
        
        return {
            ...mission,
            progress: newProgress,
            completed: isCompleted
        };
        }
        return mission;
    });
    });
};

const capturePokemon = (pokemon) => {
    if (captured.has(pokemon.id)) return;
    
    setCapturingId(pokemon.id);
    
    setTimeout(() => {
    setCaptured(prev => {
        const newCaptured = new Set(prev);
        newCaptured.add(pokemon.id);
        const capturedCount = newCaptured.size;
        
        gainExp(25);
        updateMissions(capturedCount);
        addNotification(`¡Capturaste a ${pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}!`);
        
        return newCaptured;
    });
    setCapturingId(null);
    }, 1200);
};

const generateNewPokemon = () => {
    const fetchNewPokemon = async () => {
    try {
        const randomId = Math.floor(Math.random() * 898) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}/`);
        if (!response.ok) {
        throw new Error(`Error al cargar el Pokémon: ${response.statusText}`);
        }
        const data = await response.json();
        const newPokemon = {
        id: data.id,
        nombre: data.name,
        imagen: data.sprites.front_default,
        tipos: data.types.map(typeInfo => typeInfo.type.name),
        appearing: true
        };
        
        setPokemones(prev => [...prev, newPokemon]);
        
        setTimeout(() => {
        setPokemones(prev => prev.map(p => 
            p.id === newPokemon.id ? { ...p, appearing: false } : p
        ));
        }, 1000);
    } catch (err) {
        console.error('Error al generar nuevo Pokémon:', err);
    }
    };
    
    fetchNewPokemon();
};

const resetGame = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los datos.')) {
    localStorage.removeItem('pokemonGameData');
    setCaptured(new Set());
    setPlayerLevel(1);
    setExp(0);
    setMaxExp(100);
    setMissions([
        {
        id: 1,
        title: "Primer Entrenador",
        description: "Captura tu primer Pokémon",
        target: 1,
        progress: 0,
        completed: false,
        reward: 50,
        type: "capture"
        },
        {
        id: 2,
        title: "Coleccionista",
        description: "Captura 3 Pokémon diferentes",
        target: 3,
        progress: 0,
        completed: false,
        reward: 100,
        type: "capture"
        },
        {
        id: 3,
        title: "Maestro Pokémon",
        description: "Captura 5 Pokémon diferentes",
        target: 5,
        progress: 0,
        completed: false,
        reward: 200,
        type: "capture"
        }
    ]);
    addNotification('¡Juego reiniciado!', 'default');
    }
};

if (cargando) {
    return <div className="pokemon-container">Cargando Pokémon...</div>;
}

if (error) {
    return <div className="pokemon-container error">Error: {error}</div>;
}

return (
    <div className='pokemon-container container-3d'>
      {/* Notificaciones */}
    {notifications.map(notification => (
        <div 
        key={notification.id} 
        className={`notification notification-3d ${notification.type}`}
        >
        {notification.message}
        </div>
    ))}

      {/* Panel de Jugador */}
    <div className={`player-panel card-3d ${levelUpAnimation ? 'level-up-3d' : ''}`}>
        {levelUpAnimation && <div className="level-up-particles"></div>}
        <h2>
        Nivel {playerLevel} - Entrenador Pokémon
        </h2>
        <div className="exp-bar">
        <div 
            className={`exp-fill ${expGainAnimation ? 'exp-gain-3d' : ''}`}
            style={{ '--exp-width': `${(exp / maxExp) * 100}%`, width: `${(exp / maxExp) * 100}%` }}
        ></div>
        </div>
        <p>EXP: {exp} / {maxExp}</p>
        <p>Pokémon capturados: {captured.size}</p>
        <button onClick={resetGame} className="generate-btn" style={{marginTop: '10px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)'}}>
        Reiniciar Juego
        </button>
    </div>

      {/* Misiones */}
    <div className="missions-panel card-3d">
        <h3>Misiones</h3>
        {missions.map(mission => (
        <div 
            key={mission.id} 
            className={`mission-card ${mission.completed ? 'completed mission-complete-3d' : ''}`}
        >
            <h4>{mission.title}</h4>
            <p>{mission.description}</p>
            <div className="mission-progress">
            <div 
                className="mission-progress-bar" 
                style={{ width: `${(mission.progress / mission.target) * 100}%` }}
            ></div>
            </div>
            <p>{mission.progress} / {mission.target}</p>
            {mission.completed && <p>✅ ¡Completada! +{mission.reward} EXP</p>}
        </div>
        ))}
    </div>

      {/* Lista de Pokémon */}
    <div className="pokemon-section card-3d">
        <h2>Pokémon Salvajes</h2>
        <button onClick={generateNewPokemon} className="generate-btn">
        Buscar más Pokémon
        </button>
        <div className="pokemon-list">
        {pokemones.map(pokemon => (
            <div 
            key={pokemon.id} 
            className={`pokemon-card card-3d ${
                capturingId === pokemon.id ? 'capturing capture-3d' : ''
            } ${pokemon.appearing ? 'appearing pokemon-appear-3d' : ''}`}
            >
            {capturingId === pokemon.id && <div className="capture-particles"></div>}
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p>
                <strong>Tipos:</strong> {pokemon.tipos.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}
            </p>
            <div className="capture-section">
                {captured.has(pokemon.id) ? (
                <div className="captured-status">
                    <span>✅ Capturado</span>
                </div>
                ) : (
                <div 
                    className={`pokeball ${capturingId === pokemon.id ? 'capturing pokeball-3d' : ''}`}
                    onClick={() => capturePokemon(pokemon)}
                    title="Capturar Pokémon"
                >
                </div>
                )}
            </div>
            </div>
        ))}
        </div>
    </div>
    </div>
);
};

export default PokemonFetcher;