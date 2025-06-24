import React, { useState } from 'react';
import checkIcon from '../assets/images/check_icon.png';
import coloredAcorn from '../assets/images/colored_acorn.png';
import emptyAcorn from '../assets/images/empty_acorn2.png';
import '../App.css';

const dates = [
  { day: '토', date: 21 },
  { day: '일', date: 22 },
  { day: '월', date: 23 },
  { day: '화', date: 24 },
  { day: '수', date: 25 },
];

const PlusCircleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#646464"/>
    <path d="M16 9V23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M9 16H23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const TodoList = () => {
  const [inputText, setInputText] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [todos, setTodos] = useState([
    // 예시 데이터
    { id: 1, text: '리액트 공부하기', completed: true, difficulty: 4 },
    { id: 2, text: '토도토도 피그마 디자인하기', completed: false, difficulty: 3 },
    { id: 3, text: '토도토도 피그마 디자인하기', completed: false, difficulty: 4 },
    { id: 4, text: '토도토도 피그마 디자인하기', completed: false, difficulty: 5 },
  ]);
  const [selectedDate, setSelectedDate] = useState(23);
  const totalPoints = todos.filter(t => t.completed).reduce((acc, t) => acc + t.difficulty, 0);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTodos([
      ...todos,
      { id: Date.now(), text: inputText, completed: false, difficulty }
    ]);
    setInputText('');
    setDifficulty(3);
  };

  const handleToggle = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 0', position: 'relative' }}>
      {/* 타이틀 */}
      <h1 style={{
        textAlign: 'center',
        fontFamily: 'godoRounded',
        fontWeight: 700,
        fontSize: '4rem',
        color: 'var(--main-gray)',
        marginBottom: 32
      }}>todo todo</h1>

      {/* 날짜 선택 네모 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
        {dates.map(d => (
          <div
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            style={{
              background: selectedDate === d.date ? 'var(--main-yellow)' : 'var(--main-white)',
              border: `2px solid var(--main-yellow)` ,
              borderRadius: '20px',
              padding: '12px 18px',
              textAlign: 'center',
              color: 'var(--main-gray)',
              fontFamily: 'Pretendard',
              fontSize: '1.1rem',
              boxShadow: selectedDate === d.date ? '0 2px 6px #0001' : 'none',
              fontWeight: selectedDate === d.date ? 700 : 400,
              cursor: 'pointer',
              minWidth: 48
            }}
          >
            <div>{d.date}</div>
            <div>{d.day}</div>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <form onSubmit={handleAddTodo} style={{
        display: 'flex', alignItems: 'center', background: 'var(--main-yellow)',
        borderRadius: 20, padding: '16px 32px 16px 20px', marginBottom: 24, boxShadow: '0 2px 6px #0001', gap: 12
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, marginRight: 8 }}>
          <PlusCircleIcon />
        </span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            style={{
              border: 'none', background: 'transparent', fontSize: '1.1rem', width: '100%', minWidth: 0, outline: 'none', color: 'var(--main-gray)', fontFamily: 'Pretendard'
            }}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="새 todo를 입력하세요."
          />
        </div>
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <img
              key={star}
              src={emptyAcorn}
              alt="acorn"
              style={{ width: 24, height: 24, opacity: 0.5 }}
            />
          ))}
        </div>
      </form>

      {/* 총점 */}
      <div style={{
        position: 'absolute', right: 0, top: 40, background: 'var(--main-yellow)',
        borderRadius: 20, padding: '8px 20px', display: 'flex', alignItems: 'center', fontSize: '1.3rem',
        color: 'var(--main-gray)', fontFamily: 'Pretendard', boxShadow: '0 2px 6px #0001', gap: 8
      }}>
        <img src={coloredAcorn} alt="acorn" style={{ width: 24, height: 24 }} />
        <span>{totalPoints}</span>
      </div>

      {/* 투두 리스트 */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {todos.map(todo => (
          <div key={todo.id} style={{
            display: 'flex', alignItems: 'center', background: '#fff',
            border: '2px solid var(--main-yellow)',
            borderRadius: 20, padding: '16px 32px 16px 20px', gap: 12, boxShadow: '0 2px 6px #0001', position: 'relative'
          }}>
            {/* 체크/미체크 아이콘 */}
            {todo.completed ? (
              <img src={checkIcon} alt="check" style={{ width: 32, height: 32, marginRight: 8, cursor: 'pointer', opacity: 0.85 }} onClick={() => handleToggle(todo.id)} />
            ) : (
              <span
                onClick={() => handleToggle(todo.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%', border: '2px solid #646464', background: '#fff', marginRight: 8, cursor: 'pointer'
                }}
              />
            )}
            <span style={{ flex: 1, fontSize: '1.1rem', color: 'var(--main-gray)', fontFamily: 'Pretendard', textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <img
                  key={star}
                  src={star <= todo.difficulty ? coloredAcorn : emptyAcorn}
                  alt="acorn"
                  style={{ width: 24, height: 24, ...(star > todo.difficulty ? { opacity: 0.5 } : {}) }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList; 