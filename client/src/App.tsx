import TodoList from './components/TodoList';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <div className="App">
      <Login />
      <h1>Todo App</h1>
      <TodoList />
    </div>
  );
}

export default App;
