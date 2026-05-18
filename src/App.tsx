import React, { useState, useEffect } from 'react';
import './index.css';

// Usaremos localStorage como equivalente ao AsyncStorage em ambiente Web
const STORAGE_KEY = '@todo_list_tasks';
const THEME_KEY = '@todo_list_theme';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type FilterType = 'all' | 'active' | 'completed';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        if (storedTasks) setTasks(JSON.parse(storedTasks));

        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme === 'dark') setIsDarkMode(true);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  // Salvar tasks no localStorage sempre que alteradas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Aplicar tema escuro
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const addTask = () => {
    if (inputValue.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.text);
  };

  const saveEdit = () => {
    if (editValue.trim() === '') {
      setEditingId(null);
      return;
    }
    setTasks(tasks.map(t => t.id === editingId ? { ...t, text: editValue.trim() } : t));
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const tasksLeft = tasks.filter(t => !t.completed).length;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize: '24px' }}>☰</span>
        </div>

        <nav className="nav-menu" style={{ marginTop: '20px' }}>
          <div className="nav-item active">
            <span style={{ fontSize: '20px' }}>📋</span>
            <span>My Tasks</span>
          </div>
          <div className="nav-item">
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span>Settings</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <button 
          className="theme-toggle" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <span style={{ fontSize: '24px' }}>☀️</span> : <span style={{ fontSize: '24px' }}>🌙</span>}
        </button>

        <div className="header">
          <h1 className="header-title">My Tasks</h1>
        </div>

        <div className="todo-container">
          <div className="input-group">
            <input 
              type="text" 
              className="task-input" 
              placeholder="Type your task here.." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, addTask)}
            />
            <button className="add-btn" onClick={addTask}>
              <span>➕</span> Add
            </button>
          </div>

          <div className="filters-bar">
            <div className="filters-list">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >All</button>
              <span>|</span>
              <button 
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >Active</button>
              <span>|</span>
              <button 
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >Completed</button>
            </div>
            <span className="tasks-left">{tasksLeft} tasks left</span>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.5 }}>📝</span>
                <p>Empty as my motivation on Monday 😅<br/>Let's start adding stuff!</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className={`task-item ${editingId === task.id ? 'editing' : ''}`}>
                  <div className="task-checkbox" onClick={() => toggleTask(task.id)}>
                    {task.completed ? <span style={{ fontSize: '22px' }}>☑️</span> : <span style={{ fontSize: '22px' }}>⬜</span>}
                  </div>
                  
                  <div className="task-body">
                    {editingId === task.id ? (
                      <input 
                        type="text" 
                        className="edit-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => handleKeyPress(e, saveEdit)}
                        autoFocus
                      />
                    ) : (
                      <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                        {task.text}
                      </span>
                    )}
                  </div>

                  <div className="task-actions">
                    {editingId === task.id ? (
                       <button className="action-btn" onClick={saveEdit} title="Save">
                        <span>💾</span>
                      </button>
                    ) : (
                      <button className="action-btn" onClick={() => startEditing(task)} title="Edit">
                        <span>✏️</span>
                      </button>
                    )}
                    <button className="action-btn" onClick={() => deleteTask(task.id)} title="Delete">
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="footer">
          © 2026
        </footer>
      </main>
    </div>
  );
}

export default App;