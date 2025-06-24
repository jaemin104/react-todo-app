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

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C13.1 2 14 2.9 14 4V4.29C17.03 5.15 19 7.82 19 11V17L21 19V20H3V19L5 17V11C5 7.82 6.97 5.15 10 4.29V4C10 2.9 10.9 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="currentColor"/>
  </svg>
);

const dateList: DateInfo[] = getCalendarDatesInRange();
const today = new Date();
const initialCenterIdx = dateList.findIndex(d =>
  d.fullDate.getFullYear() === today.getFullYear() &&
  d.fullDate.getMonth() === today.getMonth() &&
  d.fullDate.getDate() === today.getDate()
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
  
  // 알림 관련 상태
  const [notifications, setNotifications] = useState<{ id: number; message: string; read: boolean; }[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  // 선택된 날짜의 todo 리스트
  const selectedDateKey = getDateKey(selectedDate);
  const todos = todosByDate[selectedDateKey] || [];

  // 총점(모든 날짜의 완료된 todo의 도토리 합)
  const totalPoints = Object.values(todosByDate).flat().filter(t => t.completed).reduce((acc, t) => acc + t.difficulty, 0);

  // 읽지 않은 알림 개수
  const unreadNotifications = notifications.filter(n => !n.read).length;

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

  // 총점이 10의 배수에 도달했을 때 알림 추가
  useEffect(() => {
    const currentMilestone = Math.floor(totalPoints / 10) * 10;
    if (currentMilestone > lastMilestone && currentMilestone > 0) {
      const newNotification = {
        id: Date.now(),
        message: `총점이 ${currentMilestone}점이 되었어요!`,
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      setLastMilestone(currentMilestone);
    }
  }, [totalPoints, lastMilestone]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // 도토리가 0개인 경우 안내 메시지 표시
    if (difficulty === 0) {
      alert('1~5도토리로 우선순위를 설정해주세요!');
      return;
    }
    
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

  // 알림 읽기 처리
  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
    // 모든 알림을 읽음 처리
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

      {/* 알림 아이콘 */}
      <div
        onClick={handleNotificationClick}
        style={{
          position: 'absolute', left: 0, top: 40,
          background: 'var(--main-yellow)',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 6px #0001',
          color: 'var(--main-gray)'
        }}
      >
        <BellIcon />
        {unreadNotifications > 0 && (
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#ff4757',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            fontFamily: 'Pretendard'
          }}>
            {unreadNotifications}
          </div>
        )}
      </div>

      {/* 총점 */}
      <div style={{
        position: 'absolute', right: 0, top: 40,
        background: 'var(--main-yellow)',
        borderRadius: 20, padding: '8px 20px', display: 'flex', alignItems: 'center', fontSize: '1.3rem',
        color: 'var(--main-gray)', fontFamily: 'Pretendard', boxShadow: '0 2px 6px #0001', gap: 8
      }}>
        <img src={coloredAcorn} alt="acorn" style={{ width: 24, height: 24 }} />
        <span>{totalPoints}</span>
      </div>

      {/* 알림 모달 */}
      {isNotificationModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={handleCloseNotificationModal}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '32px',
            maxWidth: 400,
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{
              fontFamily: 'godoRounded',
              fontSize: '1.5rem',
              color: 'var(--main-gray)',
              marginBottom: 24,
              textAlign: 'center'
            }}>알림</h2>
            {notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {notifications.map(notification => (
                  <div key={notification.id} style={{
                    padding: '16px',
                    background: notification.read ? '#f8f9fa' : 'var(--main-yellow)',
                    borderRadius: 12,
                    border: notification.read ? '1px solid #e9ecef' : 'none',
                    opacity: notification.read ? 0.7 : 1
                  }}>
                    <p style={{
                      margin: 0,
                      fontFamily: 'Pretendard',
                      fontSize: '1rem',
                      color: 'var(--main-gray)',
                      lineHeight: 1.5
                    }}>
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                textAlign: 'center',
                fontFamily: 'Pretendard',
                color: 'var(--main-gray)',
                opacity: 0.7
              }}>
                새로운 알림이 없습니다.
              </p>
            )}
            <button
              onClick={handleCloseNotificationModal}
              style={{
                marginTop: 24,
                width: '100%',
                padding: '12px',
                background: 'var(--main-yellow)',
                border: 'none',
                borderRadius: 12,
                color: 'var(--main-gray)',
                fontFamily: 'Pretendard',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

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