import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [filters, setFilters] = useState({ done: '', priority: '' });
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Input Validation for Due Date
  const addTask = () => {
    try {
      if (task.trim() === '') throw new Error('Task cannot be empty.');
      const currentDate = new Date();
      const taskDueDate = new Date(dueDate);

      // Validate if the due date is not in the past
      if (taskDueDate < currentDate) {
        throw new Error('Due date cannot be in the past.');
      }

      setTasks([...tasks, { text: task, done: false, priority, dueDate, isEditing: false }]);
      setTask('');
      setPriority('Medium');
      setDueDate('');
      setError(null); // Reset error on successful addition
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDone = (index) => {
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, done: !t.done } : t
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const startEditing = (index) => {
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, isEditing: true } : t
    );
    setTasks(updatedTasks);
  };

  const saveEditedTask = (index, newText, newPriority, newDueDate) => {
    if (!newText.trim()) {
      alert('Task text cannot be empty!');
      return;
    }
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, text: newText, priority: newPriority, dueDate: newDueDate, isEditing: false } : t
    );
    setTasks(updatedTasks);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addToGoogleCalendar = (task) => {
    if (!task.dueDate) {
      alert('Please set a due date before adding to Google Calendar.');
      return;
    }
    try {
      const taskDate = new Date(task.dueDate);
      const iso = taskDate.toISOString().replace(/[-:]/g, '').split('.')[0];
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${task.text}&dates=${iso}/${iso}`;
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error adding task to Google Calendar:', error);
      alert('Error adding task to Google Calendar.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    return (
      (filters.done === '' || (filters.done === 'done' ? t.done : !t.done)) &&
      (filters.priority === '' || t.priority === filters.priority)
    );
  });

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Dark Mode Toggle Switch */}
      <div className="top-bar" title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider">
            <span className="icon">{darkMode ? '🌙' : '🌞'}</span>
          </span>
        </label>
      </div>

      <h1 className="title">Task Master</h1>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => handleFilterChange('done', e.target.value)} className="filter-select">
          <option value="">All Tasks</option>
          <option value="done">Done</option>
          <option value="undone">Undone</option>
        </select>
        <select onChange={(e) => handleFilterChange('priority', e.target.value)} className="filter-select">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Input Container */}
      <div className="input-container">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What do you need to do?"
          className="task-input"
          aria-label="Task Description"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="priority-select" aria-label="Priority">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="due-date-input"
          aria-label="Due Date"
        />
        <button onClick={addTask} className="add-btn" aria-label="Add Task">
          Add Task
        </button>
      </div>

      {/* Task List */}
      <ul className="task-list">
        {filteredTasks.map((t, index) => (
          <li key={index} className="task-item">
            {t.isEditing ? (
              <>
                <input
                  type="text"
                  defaultValue={t.text}
                  onChange={(e) => {
                    const updatedTasks = [...tasks];
                    updatedTasks[index].text = e.target.value;
                    setTasks(updatedTasks);
                  }}
                  className="edit-input"
                  aria-label="Edit Task Description"
                />
                <select
                  value={t.priority}
                  onChange={(e) => {
                    const updatedTasks = [...tasks];
                    updatedTasks[index].priority = e.target.value;
                    setTasks(updatedTasks);
                  }}
                  className="priority-select"
                  aria-label="Edit Task Priority"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input
                  type="date"
                  value={t.dueDate}
                  onChange={(e) => {
                    const updatedTasks = [...tasks];
                    updatedTasks[index].dueDate = e.target.value;
                    setTasks(updatedTasks);
                  }}
                  className="due-date-input"
                  aria-label="Edit Task Due Date"
                />
                <button onClick={() => saveEditedTask(index, t.text, t.priority, t.dueDate)} className="save-btn" aria-label="Save Task">
                  💾
                </button>
              </>
            ) : (
              <>
                <span className={t.done ? 'task-text done' : 'task-text'}>{t.text}</span>
                <span className={`priority-tag ${t.priority.toLowerCase()}`}>{t.priority}</span>
                <span className="due-date">{t.dueDate ? `Due: ${t.dueDate}` : ''}</span>
                <button onClick={() => toggleDone(index)} className="task-btn" aria-label="Mark Task as Done">
                  ✔️
                </button>
                <button onClick={() => startEditing(index)} className="task-btn" aria-label="Edit Task">
                  ✏️
                </button>
                <button onClick={() => deleteTask(index)} className="task-btn delete" aria-label="Delete Task">
                  ❌
                </button>
                <button onClick={() => addToGoogleCalendar(t)} className="task-btn google-calendar" aria-label="Add to Google Calendar">
                  📅
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
