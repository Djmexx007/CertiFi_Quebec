import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface Chapter {
  id: string;
  title: string;
  completed?: boolean;
}

interface Module {
  id: number;
  name: string;
  chapters?: Chapter[];
}

interface Progress {
  id: number;
  progress: number;
}

interface GameState {
  modules: Module[];
  progress: Progress[];
  playerXP: number;
  playerLevel: number;
  badges: string[];
  titles: string[];
  completedChapters: string[];
  unlockedWorlds: number[];
  currentWorld: number | null;
  currentChapter: string | null;
  moduleProgress: Record<string, number>;
}

const initialState: GameState = {
  modules: [],
  progress: [],
  playerXP: 0,
  playerLevel: 1,
  badges: [],
  titles: [],
  completedChapters: [],
  unlockedWorlds: [1],
  currentWorld: null,
  currentChapter: null,
  moduleProgress: {},
};

type Action =
  | { type: 'SET_MODULES'; payload: Module[] }
  | { type: 'MARK_CHAPTER_COMPLETED'; chapterId: string }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_BADGE'; badge: string }
  | { type: 'ADD_TITLE'; title: string }
  | { type: 'RESET_PROGRESS' }
  | { type: 'SET_USER_DATA'; payload: Partial<GameState> };

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
  setCurrentWorld: (id: number) => void;
  setCurrentChapter: (id: string) => void;
  markChapterCompleted: (chapterId: string) => Promise<void>;
  addXP: (amount: number) => void;
  addBadge: (badge: string) => void;
  addTitle: (title: string) => void;
  resetProgress: () => void;
}>({} as any);

// Calcul du progrès à partir des modules
function calculateProgressFromModules(modules: Module[]): Progress[] {
  return modules.map((module) => {
    const chapters = Array.isArray(module.chapters) ? module.chapters : [];
    const completed = chapters.filter((ch) => ch.completed).length;
    const total = chapters.length;
    return {
      id: module.id,
      progress: total > 0 ? completed / total : 0,
    };
  });
}

// Memoize expensive calculations
const memoizedCalculations = {
  lastModules: null as Module[] | null,
  lastResult: [] as Progress[]
};

function memoizedCalculateProgress(modules: Module[]): Progress[] {
  if (memoizedCalculations.lastModules === modules) {
    return memoizedCalculations.lastResult;
  }
  
  const result = calculateProgressFromModules(modules);
  memoizedCalculations.lastModules = modules;
  memoizedCalculations.lastResult = result;
  return result;
}

// Reducer
function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_MODULES':
      return {
        ...state,
        modules: action.payload,
        progress: memoizedCalculateProgress(action.payload),
      };

    case 'MARK_CHAPTER_COMPLETED':
      if (state.completedChapters.includes(action.chapterId)) {
        console.log(`Chapter ${action.chapterId} already completed, skipping`);
        return state;
      }

      console.log(`Marking chapter ${action.chapterId} as completed in state`);
      console.log('Current completedChapters:', state.completedChapters);
      
      const newCompletedChapters = [...state.completedChapters, action.chapterId];
      console.log('New completedChapters:', newCompletedChapters);
      
      return {
        ...state,
        completedChapters: newCompletedChapters,
      };
      
    case 'ADD_XP':
      const newXP = state.playerXP + action.amount;
      const newLevel = Math.floor(newXP / 1000) + 1;

      console.log(`Adding ${action.amount} XP. New total: ${newXP}, New level: ${newLevel}`);

      // Déblocage automatique de mondes si niveau atteint
      const newUnlocked = [...state.unlockedWorlds];
      if (newLevel >= 5 && !newUnlocked.includes(2)) {
        console.log('Unlocking world 2 (level 5 reached)');
        newUnlocked.push(2);
      }
      if (newLevel >= 10 && !newUnlocked.includes(3)) {
        console.log('Unlocking world 3 (level 10 reached)');
        newUnlocked.push(3);
      }
      if (newLevel >= 15 && !newUnlocked.includes(4)) {
        console.log('Unlocking world 4 (level 15 reached)');
        newUnlocked.push(4);
      }

      return {
        ...state,
        playerXP: newXP,
        playerLevel: newLevel,
        unlockedWorlds: newUnlocked
      };
      
    case 'ADD_BADGE':
      if (state.badges.includes(action.badge)) {
        console.log(`Badge ${action.badge} already earned, skipping`);
        return state;
      }
      
      console.log(`Adding badge: ${action.badge}`);
      return {
        ...state,
        badges: [...state.badges, action.badge]
      };
      
    case 'ADD_TITLE':
      if (state.titles.includes(action.title)) {
        console.log(`Title ${action.title} already earned, skipping`);
        return state;
      }
      
      console.log(`Adding title: ${action.title}`);
      return {
        ...state,
        titles: [...state.titles, action.title]
      };
      
    case 'RESET_PROGRESS':
      return initialState;
      
    case 'SET_USER_DATA':
      console.log('Setting user data:', action.payload);
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

// Debounce function for Supabase updates
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Load user data from Supabase on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('xp, chapters_completed, badges, titles')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error loading user data:', error);
          return;
        }
        
        if (data) {
          console.log('Loaded user data from Supabase:', data);
          dispatch({ 
            type: 'SET_USER_DATA', 
            payload: {
              playerXP: data.xp || 0,
              playerLevel: Math.floor((data.xp || 0) / 1000) + 1,
              completedChapters: data.chapters_completed || [],
              badges: data.badges || [],
              titles: data.titles || []
            }
          });
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  // Save user data to Supabase immediately without debounce
  const saveUserData = async (userData: {
    xp: number;
    chapters_completed: string[];
    badges: string[];
    titles: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found when trying to save data');
        return;
      }
      
      console.log('Saving user data to Supabase:', userData);
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Error saving user data to Supabase:', error);
        toast.error('Erreur lors de la sauvegarde de votre progression');
      } else {
        console.log('User data saved successfully to Supabase');
      }
    } catch (error) {
      console.error('Exception in saveUserData:', error);
      toast.error('Erreur lors de la sauvegarde de votre progression');
    }
  };
  
  // Create a debounced version for non-critical updates
  const debouncedSaveUserData = useCallback(
    debounce(saveUserData, 1000), // 1 second debounce
    []
  );
  
  useEffect(() => {
    // Only save if we have meaningful data to save
    if (state.playerXP > 0 || state.completedChapters.length > 0 || 
        state.badges.length > 0 || state.titles.length > 0) {
      console.log('Saving user data:', {
        xp: state.playerXP,
        chapters_completed: state.completedChapters,
        badges: state.badges,
        titles: state.titles
      });
      
      debouncedSaveUserData({
        xp: state.playerXP,
        chapters_completed: state.completedChapters,
        badges: state.badges,
        titles: state.titles
      });
    }
  }, [state.playerXP, state.completedChapters, state.badges, state.titles, debouncedSaveUserData]);

  const setCurrentWorld = useCallback((id: number) => {
    state.currentWorld = id;
  }, [state]);

  const setCurrentChapter = useCallback((id: string) => {
    state.currentChapter = id;
  }, [state]);

  const markChapterCompleted = useCallback(async (chapterId: string) => {
    console.log('Marking chapter as completed:', chapterId);
    
    // First update local state
    dispatch({ type: 'MARK_CHAPTER_COMPLETED', chapterId });
    
    // Then immediately save to Supabase without debounce
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found when trying to mark chapter as completed');
        return;
      }
      
      // Get current state after dispatch
      const updatedCompletedChapters = [...state.completedChapters, chapterId];
      
      // Only add if not already included
      if (!state.completedChapters.includes(chapterId)) {
        console.log('Saving updated completed chapters to Supabase:', updatedCompletedChapters);
        
        const { error } = await supabase
          .from('profiles')
          .update({ chapters_completed: updatedCompletedChapters })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error saving chapter completion to Supabase:', error);
          toast.error('Erreur lors de la sauvegarde de votre progression');
        } else {
          console.log('Chapter completion saved successfully to Supabase');
        }
      } else {
        console.log('Chapter already marked as completed, skipping Supabase update');
      }
    } catch (error) {
      console.error('Exception in markChapterCompleted:', error);
    }
  }, [state.completedChapters]);

  const addXP = useCallback((amount: number) => {
    console.log('Adding XP:', amount);
    dispatch({ type: 'ADD_XP', amount });
  }, []);

  const addBadge = useCallback((badge: string) => {
    console.log('Adding badge:', badge);
    dispatch({ type: 'ADD_BADGE', badge });
  }, []);

  const addTitle = useCallback((title: string) => {
    console.log('Adding title:', title);
    dispatch({ type: 'ADD_TITLE', title });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        setCurrentWorld,
        setCurrentChapter,
        markChapterCompleted,
        addXP,
        addBadge,
        addTitle,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);