import React, { useState, useRef, useEffect } from 'react';
import checkIcon from '../assets/images/check_icon.png';
import coloredAcorn from '../assets/images/colored_acorn.png';
import emptyAcorn from '../assets/images/empty_acorn2.png';
import '../App.css';
import { getCalendarDatesInRange, DateInfo } from '../utils/date';

const PlusCircleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#646464"/>
    <path d="M16 9V23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M9 16H23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const dateList: DateInfo[] = getCalendarDatesInRange();
const initialCenterIdx = dateList.findIndex(d =>
  d.fullDate.getFullYear() === 2025 &&
  d.fullDate.getMonth() === 5 && // 6월 (0-indexed)
  d.fullDate.getDate() === 23
);
const initialCenterDate = dateList[initialCenterIdx]?.fullDate || dateList[0].fullDate;

// 날짜를 YYYY-MM-DD 문자열로 변환하는 함수
const getDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const TodoList = () => {
  const [inputText, setInputText] = useState('');
  const [difficulty, setDifficulty] = useState(0);
  const [isInputActive, setIsInputActive] = useState(false);
  // 날짜별 todos: { 'YYYY-MM-DD': Todo[] }
  const [todosByDate, setTodosByDate] = useState<Record<string, { id: number; text: string; completed: boolean; difficulty: number; }[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(initialCenterDate);

  // 선택된 날짜의 todo 리스트
  const selectedDateKey = getDateKey(selectedDate);
  const todos = todosByDate[selectedDateKey] || [];

  // 총점(모든 날짜의 완료된 todo의 도토리 합)
  const totalPoints = Object.values(todosByDate).flat().filter(t => t.completed).reduce((acc, t) => acc + t.difficulty, 0);

  // 날짜 스크롤 관련 ref
  const dateListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 날짜 스크롤 시 가운데 날짜 자동 선택
  const handleDateScroll = () => {
    const container = dateListRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLDivElement[];
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    let minDist = Infinity;
    let centerIdx = 0;
    // 더미 2개씩 있으니 실제 날짜는 2~(length-3)
    for (let idx = 2; idx < children.length - 2; idx++) {
      const child = children[idx];
      const rect = child.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const dist = Math.abs(centerX - childCenter);
      if (dist < minDist) {
        minDist = dist;
        centerIdx = idx - 2; // 실제 날짜 인덱스
      }
    }
    setSelectedDate(dateList[centerIdx].fullDate);
  };

  // 마운트 시 초기 날짜가 가운데 오도록 스크롤 위치 조정
  useEffect(() => {
    const container = dateListRef.current;
    if (container) {
      const children = Array.from(container.children) as HTMLDivElement[];
      if (children[initialCenterIdx + 2]) {
        const centerChild = children[initialCenterIdx + 2];
        const containerRect = container.getBoundingClientRect();
        const childRect = centerChild.getBoundingClientRect();
        const scrollLeft = centerChild.offsetLeft - (containerRect.width / 2 - childRect.width / 2);
        container.scrollLeft = scrollLeft;
      }
    }
  }, []);

  // 외부 클릭 시 입력창 비활성화
  useEffect(() => {
    if (!isInputActive) return;
    const handleClick = (e: MouseEvent) => {
      if (
        formRef.current &&
        !formRef.current.contains(e.target as Node)
      ) {
        setIsInputActive(false);
        setInputText('');
        setDifficulty(0);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isInputActive]);

  // 입력창 활성화 시 자동 포커스
  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTodosByDate(prev => {
      const key = selectedDateKey;
      const prevTodos = prev[key] || [];
      return {
        ...prev,
        [key]: [
          { id: Date.now(), text: inputText, completed: false, difficulty },
          ...prevTodos // 최신순: 새 todo가 맨 앞에 오도록
        ]
      };
    });
    setInputText('');
    setDifficulty(0);
    setIsInputActive(false);
  };

  const handleToggle = (id: number) => {
    setTodosByDate(prev => {
      const key = selectedDateKey;
      return {
        ...prev,
        [key]: prev[key].map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      };
    });
  };

  // 날짜 비교 함수 (연,월,일만 비교)
  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

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
      <div
        ref={dateListRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 12,
          marginBottom: 24,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onScroll={handleDateScroll}
      >
        {/* 앞쪽 더미 */}
        <div style={{ flex: '0 0 48px', width: 48, minWidth: 48 }} />
        <div style={{ flex: '0 0 48px', width: 48, minWidth: 48 }} />
        {dateList.map(d => (
          <div
            key={d.fullDate.toISOString()}
            onClick={() => setSelectedDate(d.fullDate)}
            style={{
              background: isSameDate(selectedDate, d.fullDate) ? 'var(--main-yellow)' : 'var(--main-white)',
              border: `2px solid var(--main-yellow)` ,
              borderRadius: '20px',
              padding: '12px 18px',
              textAlign: 'center',
              color: 'var(--main-gray)',
              fontFamily: 'Pretendard',
              fontSize: '1.1rem',
              boxShadow: isSameDate(selectedDate, d.fullDate) ? '0 2px 6px #0001' : 'none',
              fontWeight: isSameDate(selectedDate, d.fullDate) ? 700 : 400,
              cursor: 'pointer',
              minWidth: 48,
              width: 48,
              flex: '0 0 48px',
              scrollSnapAlign: 'center',
              userSelect: 'none',
            }}
          >
            <div>{d.date}</div>
            <div>{d.day}</div>
          </div>
        ))}
        {/* 뒤쪽 더미 */}
        <div style={{ flex: '0 0 48px', width: 48, minWidth: 48 }} />
        <div style={{ flex: '0 0 48px', width: 48, minWidth: 48 }} />
      </div>

      {/* 입력창 UX 개선 */}
      <form
        ref={formRef}
        onSubmit={handleAddTodo}
        style={{
          display: 'flex', alignItems: 'center', background: 'var(--main-yellow)',
          borderRadius: 20, padding: '16px 32px 16px 20px', marginBottom: 24, boxShadow: '0 2px 6px #0001', gap: 12,
          cursor: isInputActive ? 'auto' : 'pointer',
        }}
        onClick={() => setIsInputActive(true)}
      >
        <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, marginRight: 8, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
          <PlusCircleIcon />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {isInputActive ? (
            <input
              ref={inputRef}
              style={{
                border: 'none', background: 'transparent', fontSize: '1.1rem', width: '100%', minWidth: 0, outline: 'none', color: 'var(--main-gray)', fontFamily: 'Pretendard'
              }}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="새 todo를 입력하세요."
            />
          ) : (
            <span style={{ color: 'var(--main-gray)', fontFamily: 'Pretendard', fontSize: '1.1rem', opacity: 0.8, pointerEvents: 'none' }}>
              새 todo를 입력하세요.
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <img
              key={star}
              src={star <= difficulty ? coloredAcorn : emptyAcorn}
              alt="acorn"
              style={{ width: 24, height: 24, cursor: isInputActive ? 'pointer' : 'default', opacity: star <= difficulty ? 1 : 0.5 }}
              onClick={isInputActive ? () => setDifficulty(star) : undefined}
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
      {todos.length > 0 && (
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
                    width: 28, height: 28, borderRadius: '50%', border: '2px solid #646464', background: '#fff', marginRight: 8, cursor: 'pointer',
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
      )}
    </div>
  );
};

export default TodoList; 