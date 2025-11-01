import { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import InsightsPanel from './components/InsightsPanel';

export default function App() {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // to refresh list after new task

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#121212', color: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#00bcd4', marginBottom: '1rem' }}>Task Manager</h1>

      <TaskForm onTaskCreated={handleTaskCreated} />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <select onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="">All</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>

        <select onChange={(e) => setSort(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="">None</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
        </select>
      </div>

      <TaskList
        filter={filter}
        sort={sort}
        onSelectTask={setSelectedTask}
        refreshTrigger={refreshTrigger}
      />

      <InsightsPanel />
    </div>
  );
}