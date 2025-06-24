import React from 'react';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '10px',
      borderBottom: '1px solid #eee'
    }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ marginRight: '10px' }}
      />
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <span style={{ 
          textDecoration: todo.completed ? 'line-through' : 'none',
        }}>
          {todo.text}
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                color: star <= (todo.difficulty || 0) ? '#8D7B68' : '#C8B6A6',
                fontSize: '14px'
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <button 
        onClick={() => onDelete(todo.id)}
        style={{
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        삭제
      </button>
    </div>
  );
};

export default TodoItem; 