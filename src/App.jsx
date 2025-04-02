import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, isPast, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import gsap from 'gsap';
import { FiSun, FiMoon, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiCalendar, FiClock } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks')) || []);
  const [newTask, setNewTask] = useState('');
  const [newDeadline, setNewDeadline] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Animation for task items
    gsap.fromTo('.todo-item', 
      { opacity: 0, y: 20 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  }, [tasks, darkMode]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = { 
        id: Date.now().toString(), 
        text: newTask, 
        deadline: newDeadline ? format(newDeadline, 'yyyy-MM-dd') : null,
        completed: false
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setNewDeadline(null);
      setIsAddingTask(false);
    }
  };

  const editTask = (id) => {
    setEditTaskId(id);
    const taskToEdit = tasks.find((task) => task.id === id);
    setNewTask(taskToEdit.text);
    setNewDeadline(taskToEdit.deadline ? parseISO(taskToEdit.deadline) : null);
    setIsAddingTask(true);
  };

  const updateTask = () => {
    setTasks(tasks.map((task) => 
      task.id === editTaskId ? { 
        ...task, 
        text: newTask, 
        deadline: newDeadline ? format(newDeadline, 'yyyy-MM-dd') : null 
      } : task
    ));
    setEditTaskId(null);
    setNewTask('');
    setNewDeadline(null);
    setIsAddingTask(false);
  };

  const deleteTask = (id) => {
    gsap.to(`.todo-item-${id}`, { 
      opacity: 0, 
      x: -100, 
      duration: 0.3,
      onComplete: () => setTasks(tasks.filter((task) => task.id !== id)) 
    });
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = parseISO(deadline);
    if (isPast(date)) return 'Past Due';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const getDeadlineClass = (deadline) => {
    if (!deadline) return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    const date = parseISO(deadline);
    if (isPast(date)) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (isToday(date)) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (isTomorrow(date)) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const handleDarkModeToggle = () => {
    gsap.to('body', {
      backgroundColor: darkMode ? '#ffffff' : '#111827',
      duration: 0.5
    });
    setDarkMode((prev) => !prev);
  };

  // Custom input component for DatePicker to match our style
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      className={`w-full p-3 rounded-lg border text-left ${
        darkMode ? 'bg-gray-700 border-gray-600 hover:border-blue-500' : 'bg-white border-gray-300 hover:border-blue-500'
      } transition-colors duration-300 flex items-center justify-between`}
      onClick={onClick}
      ref={ref}
    >
      {value || 'Select a date'}
      <FiCalendar className="text-gray-400" />
    </button>
  ));

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <button
            onClick={handleDarkModeToggle}
            className={`p-2 rounded-full transition-all duration-300 ${
              darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </header>

        {!isAddingTask ? (
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center justify-center w-full mb-6 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiPlus className="mr-2" /> Add New Task
          </button>
        ) : (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-all duration-300`}>
            <h2 className="text-xl font-semibold mb-4">{editTaskId ? 'Edit Task' : 'New Task'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Description</label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs to be done?"
                  className={`w-full p-3 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 focus:border-blue-500' : 'bg-white border-gray-300 focus:border-blue-500'
                  } transition-colors duration-300`}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <DatePicker
                  selected={newDeadline}
                  onChange={(date) => setNewDeadline(date)}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a deadline"
                  customInput={<CustomDateInput />}
                  className="w-full"
                  popperClassName={`${darkMode ? 'dark-datepicker' : ''}`}
                  showPopperArrow={false}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewDeadline(addDays(new Date(), 1))}
                    className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDeadline(addDays(new Date(), 7))}
                    className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Next Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDeadline(null)}
                    className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    No Deadline
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingTask(false);
                    setEditTaskId(null);
                    setNewTask('');
                    setNewDeadline(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button
                  onClick={editTaskId ? updateTask : addTask}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300 flex items-center"
                  disabled={!newTask.trim()}
                >
                  <FiCheck className="mr-2" /> {editTaskId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-3"
              >
                {tasks.length === 0 ? (
                  <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add one to get started!</p>
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`todo-item todo-item-${task.id} ${
                            darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                          } p-4 rounded-lg shadow-sm border ${
                            darkMode ? 'border-gray-700' : 'border-gray-200'
                          } transition-all duration-300 flex items-start ${task.completed ? 'opacity-70' : ''}`}
                        >
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={`mr-3 mt-1 w-5 h-5 rounded-full border ${
                              task.completed 
                                ? 'bg-green-500 border-green-500' 
                                : darkMode 
                                  ? 'border-gray-500' 
                                  : 'border-gray-300'
                            } flex items-center justify-center transition-colors duration-300`}
                            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {task.completed && <FiCheck className="text-white" size={12} />}
                          </button>
                          <div className="flex-1">
                            <div className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.text}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full mt-2 inline-flex items-center ${getDeadlineClass(task.deadline)}`}>
                              <FiClock className="mr-1" size={12} />
                              {getDeadlineStatus(task.deadline)}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-2">
                            <button
                              onClick={() => editTask(task.id)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors duration-300"
                              aria-label="Edit task"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors duration-300"
                              aria-label="Delete task"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        {tasks.length > 0 && (
          <div className={`mt-6 p-3 rounded-lg text-sm ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <p>Drag tasks to reorder • Click to complete • {tasks.filter(t => t.completed).length}/{tasks.length} tasks completed</p>
          </div>
        )}
      </div>

      {/* Add dark mode styles for date picker */}
      <style>
        {`
          .dark-datepicker .react-datepicker {
            background-color: #1f2937;
            border-color: #374151;
          }
          .dark-datepicker .react-datepicker__header {
            background-color: #111827;
            border-bottom-color: #374151;
          }
          .dark-datepicker .react-datepicker__current-month,
          .dark-datepicker .react-datepicker__day-name,
          .dark-datepicker .react-datepicker__day {
            color: #f3f4f6;
          }
          .dark-datepicker .react-datepicker__day:hover {
            background-color: #374151;
          }
          .dark-datepicker .react-datepicker__day--selected {
            background-color: #3b82f6;
          }
          .dark-datepicker .react-datepicker__day--outside-month {
            color: #6b7280;
          }
          .dark-datepicker .react-datepicker__time-container {
            border-left-color: #374151;
          }
          .dark-datepicker .react-datepicker__time-box {
            background-color: #1f2937;
          }
          .dark-datepicker .react-datepicker__time-list-item:hover {
            background-color: #374151;
          }
        `}
      </style>
    </div>
  );
}

export default App;