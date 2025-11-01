import { useEffect, useState } from 'react';

export default function TaskList({ filter, sort }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (filter) query.append('status', filter);
    if (sort) query.append('sort', sort);

    fetch(`http://localhost:3000/tasks?${query.toString()}`)
      .then(res => res.json())
      .then(setTasks);
  }, [filter, sort]);

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th><th>Priority</th><th>Status</th><th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.priority}</td>
            <td>{task.status}</td>
            <td>{task.dueDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}